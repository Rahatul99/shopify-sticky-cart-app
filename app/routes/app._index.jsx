import { json } from "@remix-run/node";
import {
  useLoaderData,
  useNavigation,
  useActionData,
  Form,
} from "@remix-run/react";
import {
  Page,
  Layout,
  Card,
  Text,
  FormLayout,
  TextField,
  Select,
  Checkbox,
  Banner,
  Frame,
  Toast,
  PageActions,
  Grid,
  BlockStack,
  RangeSlider,
  Button,
  Thumbnail,
} from "@shopify/polaris";
import { useState, useCallback, useEffect } from "react";
import { authenticate } from "../shopify.server";
import {
  createOrUpdateStickyCartSettings,
  createShop,
  getShop,
} from "../models/settings.server";
import StickyCartPreview from "../components/StickyCartPreview";

export const loader = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  const { shop: shopDomain } = session;

  let shop = await getShop(shopDomain);
  if (!shop) {
    shop = await createShop(shopDomain);
  }

  const defaultSettings = {
    enabled: true,
    cartPosition: "bottom-right",
    backgroundColor: "#000000",
    iconColor: "#ffffff",
    buttonRadius: 50,
    width: 80,
    height: 80,
    quantityBackgroundColor: "#ff0000",
    quantityTextColor: "#ffffff",
    showQuantityBadge: true,
    selectedIcon: "cart",
    uploadedIconData: null,
    uploadedIconType: null,
    deviceVisibility: "all",
    enableHoverAnimation: true,
    animationType: "bounce",
    showPricing: true,
    pricingTextColor: "#ffffff",
    pricingFontSize: 12,
    pricingFontWeight: "500",
    customCSS: "",
  };

  return json({
    shop,
    settings: shop.stickyCartSettings || defaultSettings,
  });
};

export const action = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  const { shop: shopDomain } = session;

  let shop = await getShop(shopDomain);
  if (!shop) {
    shop = await createShop(shopDomain);
  }

  const formData = await request.formData();
  const value = parseInt(formData.get("buttonRadius"));
  const selectedIcon = formData.get("selectedIcon");

  const settings = {
    enabled: formData.get("enabled") === "true",
    cartPosition: formData.get("cartPosition"),
    backgroundColor: formData.get("backgroundColor"),
    iconColor: formData.get("iconColor"),
    buttonRadius: isNaN(value) ? 0 : value,
    width: parseInt(formData.get("width")),
    height: parseInt(formData.get("height")),
    quantityBackgroundColor: formData.get("quantityBackgroundColor"),
    quantityTextColor: formData.get("quantityTextColor"),
    showQuantityBadge: formData.get("showQuantityBadge") === "true",
    selectedIcon: formData.get("selectedIcon"),
    uploadedIconData:
      selectedIcon === "custom"
        ? formData.get("uploadedIconData") || null
        : null,

    uploadedIconType: formData.get("uploadedIconType") || null,
    deviceVisibility: formData.get("deviceVisibility"),
    enableHoverAnimation: formData.get("enableHoverAnimation") === "true",
    animationType: formData.get("animationType"),
    showPricing: formData.get("showPricing") === "true",
    pricingTextColor: formData.get("pricingTextColor"),
    pricingFontSize: parseInt(formData.get("pricingFontSize")),
    pricingFontWeight: formData.get("pricingFontWeight"),
    customCSS: formData.get("customCSS") || "",
  };
  console.log(settings, "---------settings to save-----------");

  await createOrUpdateStickyCartSettings(shop.id, settings);
  return json({ success: true, message: "Settings saved successfully!" });
};

const Index = () => {
  const { settings } = useLoaderData();
  const actionData = useActionData();
  const navigation = useNavigation();
  const isLoading = navigation.state === "submitting";

  const [formSettings, setFormSettings] = useState(settings);
  const [showToast, setShowToast] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);

  useEffect(() => {
    if (actionData?.success) {
      setShowToast(true);
    }
  }, [actionData]);

  // Handle file upload
  const handleFileUpload = useCallback(async (file) => {
    if (!file) return;
    setIsUploading(true);
    setUploadError(null);
    try {
      const formData = new FormData();
      formData.append("icon", file);
      const response = await fetch("/api/upload-icon", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        setFormSettings((prev) => ({
          ...prev,
          selectedIcon: "custom",
          uploadedIconData: result.iconData,
          uploadedIconType: result.iconType,
        }));
        setUploadedFile(file);
        setShowToast(true);
      } else {
        setUploadError(result.error || "Upload failed");
      }
    } catch (error) {
      console.error("Upload error:", error);
      setUploadError("Upload failed. Please try again.");
    } finally {
      setIsUploading(false);
    }
  }, []);

  // Handle file selection
  const handleFileSelect = useCallback(
    (event) => {
      const file = event.target.files?.[0];
      if (file) {
        handleFileUpload(file);
      }
    },
    [handleFileUpload],
  );

  // Remove uploaded icon
  const handleRemoveIcon = useCallback(() => {
    setFormSettings((prev) => ({
      ...prev,
      uploadedIconData: null,
      uploadedIconType: null,
      selectedIcon: "cart", // Reset to default icon
    }));
    setUploadedFile(null);
    setUploadError(null);
  }, []);

  // Disable save unless something changed
  const fieldNames = [
    "enabled",
    "cartPosition",
    "backgroundColor",
    "iconColor",
    "buttonRadius",
    "width",
    "height",
    "quantityBackgroundColor",
    "quantityTextColor",
    "showQuantityBadge",
    "selectedIcon",
    "uploadedIconData",
    "uploadedIconType",
    "deviceVisibility",
    "enableHoverAnimation",
    "animationType",
    "showPricing",
    "pricingTextColor",
    "pricingFontSize",
    "pricingFontWeight",
    "customCSS",
  ];
  const normalizeForCompare = (obj) => {
    const out = {};
    for (const key of fieldNames) {
      if (key === "uploadedIconData" || key === "uploadedIconType") {
        out[key] = obj?.[key] || "";
      } else {
        out[key] = obj?.[key];
      }
    }
    return out;
  };
  const isDirty =
    JSON.stringify(normalizeForCompare(formSettings)) !==
    JSON.stringify(normalizeForCompare(settings));

  const handleSettingChange = useCallback((field, value) => {
    setFormSettings((prev) => ({
      ...prev,
      [field]: value,
    }));
  }, []);

  const handleReset = useCallback(() => {
    setFormSettings(settings);
  }, [settings]);

  const positionOptions = [
    { label: "Bottom Right", value: "bottom-right" },
    { label: "Bottom Left", value: "bottom-left" },
    { label: "Center Right", value: "center-right" },
    { label: "Center Left", value: "center-left" },
    { label: "Top Right", value: "top-right" },
    { label: "Top Left", value: "top-left" },
  ];

  const iconOptions = [
    { label: "Shopping Cart", value: "cart" },
    { label: "Shopping Bag", value: "bag" },
    { label: "Basket", value: "basket" },
    { label: "Custom", value: "custom" },
  ];

  const deviceOptions = [
    { label: "All Devices", value: "all" },
    { label: "Mobile Only", value: "mobile-only" },
    { label: "Desktop Only", value: "desktop-only" },
  ];

  const animationOptions = [
    { label: "Bounce", value: "bounce" },
    { label: "Pulse", value: "pulse" },
    { label: "Shake", value: "shake" },
    { label: "None", value: "none" },
  ];

  // Disable save unless something changed and all required fields are valid
  const isFormValid = () => {
    if (formSettings.selectedIcon === "custom") {
      // Check if we have either uploaded icon data or custom URL
      if (!formSettings.uploadedIconData && !formSettings.customIconUrl) {
        return false;
      }
    }
    return true;
  };

  return (
    <Frame>
      <Page title="Customize your Sticky Cart">
        <Layout>
          <Layout.Section>
            <Banner title="Customize your sticky cart" status="info">
              <p>
                Design and configure your sticky cart to match your store's
                branding.
              </p>
            </Banner>
          </Layout.Section>

          <Layout.Section>
            <Form method="post">
              <Grid>
                {/* Left Column - General & Appearance */}
                <Grid.Cell
                  order={{ xs: 1, sm: 2, md: 2, lg: 2, xl: 2 }}
                  columnSpan={{ xs: 6, sm: 6, md: 6, lg: 6, xl: 6 }}
                >
                  <BlockStack gap="400">
                    <Card sectioned title="General">
                      <FormLayout>
                        <Checkbox
                          label="Enable Sticky Cart"
                          helpText="Toggle the sticky cart on or off for your storefront."
                          checked={formSettings.enabled}
                          onChange={(checked) =>
                            handleSettingChange("enabled", checked)
                          }
                        />
                        <Select
                          label="Cart position"
                          options={positionOptions}
                          value={formSettings.cartPosition}
                          onChange={(value) =>
                            handleSettingChange("cartPosition", value)
                          }
                          helpText="Choose where the button appears on the screen."
                        />
                        <Select
                          label="Device visibility"
                          options={deviceOptions}
                          value={formSettings.deviceVisibility}
                          onChange={(value) =>
                            handleSettingChange("deviceVisibility", value)
                          }
                          helpText="Control which devices will see the sticky cart."
                        />
                      </FormLayout>
                    </Card>

                    <Card sectioned title="Appearance">
                      <FormLayout>
                        <FormLayout.Group>
                          <Text variant="bodyMd" as="p" color="subdued">
                            Background color
                          </Text>
                          <TextField
                            type="color"
                            value={formSettings.backgroundColor}
                            onChange={(value) =>
                              handleSettingChange("backgroundColor", value)
                            }
                          />

                          <Text variant="bodyMd" as="p" color="subdued">
                            Icon color
                          </Text>
                          <TextField
                            type="color"
                            value={formSettings.iconColor}
                            onChange={(value) =>
                              handleSettingChange("iconColor", value)
                            }
                          />
                        </FormLayout.Group>
                        <FormLayout.Group>
                          <RangeSlider
                            label="Button width (px)"
                            value={formSettings.width}
                            onChange={(value) =>
                              handleSettingChange("width", value)
                            }
                            min={60}
                            max={120}
                            output
                          />

                          <RangeSlider
                            label="Button height (px)"
                            value={formSettings.height}
                            onChange={(value) =>
                              handleSettingChange("height", value)
                            }
                            min={60}
                            max={120}
                            output
                          />

                          <RangeSlider
                            label="Button border radius (%)"
                            value={formSettings.buttonRadius}
                            onChange={(value) => {
                              handleSettingChange("buttonRadius", value);
                            }}
                            min={0}
                            max={100}
                            output
                            helpText="100% will make the button fully circular."
                          />
                        </FormLayout.Group>
                      </FormLayout>
                    </Card>

                    <Card sectioned title="Quantity Badge">
                      <FormLayout>
                        <Checkbox
                          label="Show Quantity Badge"
                          helpText="Display the number of items in the cart on the button."
                          checked={formSettings.showQuantityBadge}
                          onChange={(checked) =>
                            handleSettingChange("showQuantityBadge", checked)
                          }
                        />

                        {formSettings.showQuantityBadge && (
                          <FormLayout.Group>
                            <Text variant="bodyMd" as="p" color="subdued">
                              Badge background color
                            </Text>
                            <TextField
                              type="color"
                              value={formSettings.quantityBackgroundColor}
                              onChange={(value) =>
                                handleSettingChange(
                                  "quantityBackgroundColor",
                                  value,
                                )
                              }
                            />
                            <Text variant="bodyMd" as="p" color="subdued">
                              Badge text color
                            </Text>
                            <TextField
                              type="color"
                              value={formSettings.quantityTextColor}
                              onChange={(value) =>
                                handleSettingChange("quantityTextColor", value)
                              }
                            />
                          </FormLayout.Group>
                        )}
                      </FormLayout>
                    </Card>

                    <Card sectioned title="Pricing Display">
                      <FormLayout>
                        <Checkbox
                          label="Show Pricing Information"
                          helpText="Display the cart total price below the icon."
                          checked={formSettings.showPricing}
                          onChange={(checked) =>
                            handleSettingChange("showPricing", checked)
                          }
                        />

                        {formSettings.showPricing && (
                          <FormLayout.Group>
                            <Text variant="bodyMd" as="p" color="subdued">
                              Price text color
                            </Text>
                            <TextField
                              type="color"
                              value={formSettings.pricingTextColor}
                              onChange={(value) =>
                                handleSettingChange("pricingTextColor", value)
                              }
                            />
                            <RangeSlider
                              label="Price font size (px)"
                              value={formSettings.pricingFontSize}
                              onChange={(value) =>
                                handleSettingChange("pricingFontSize", value)
                              }
                              min={8}
                              max={20}
                              output
                            />
                            <Select
                              label="Price font weight"
                              options={[
                                { label: "Normal", value: "400" },
                                { label: "Medium", value: "500" },
                                { label: "Semi-bold", value: "600" },
                                { label: "Bold", value: "700" },
                              ]}
                              value={formSettings.pricingFontWeight}
                              onChange={(value) =>
                                handleSettingChange("pricingFontWeight", value)
                              }
                            />
                          </FormLayout.Group>
                        )}
                      </FormLayout>
                    </Card>

                    <Card sectioned title="Custom CSS">
                      <FormLayout>
                        <TextField
                          label="Custom CSS"
                          value={formSettings.customCSS || ""}
                          onChange={(value) =>
                            handleSettingChange("customCSS", value)
                          }
                          multiline={4}
                          placeholder="/* Add your custom CSS here */"
                          helpText="Add custom CSS to further customize the sticky cart appearance. This will be injected after the default styles."
                        />
                      </FormLayout>
                    </Card>
                  </BlockStack>
                </Grid.Cell>

                {/* Right Column - Live Preview & Icon/Animation */}
                <Grid.Cell
                  order={{ xs: 2, sm: 1, md: 1, lg: 1, xl: 1 }}
                  columnSpan={{ xs: 6, sm: 6, md: 6, lg: 6, xl: 6 }}
                  className="preview-section"
                >
                  <BlockStack gap="400">
                    <div
                      style={{
                        position: "sticky",
                        top: 0,
                        zIndex: 10,
                        background: "white",
                      }}
                    >
                      <Card
                        sectioned
                        title={
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "8px",
                            }}
                          >
                            <span>Live preview</span>
                            <div
                              style={{
                                fontSize: "12px",
                                padding: "2px 8px",
                                backgroundColor: "#f0f8ff",
                                color: "#0066cc",
                                borderRadius: "12px",
                                fontWeight: "500",
                              }}
                            >
                              Sticky
                            </div>
                          </div>
                        }
                      >
                        <StickyCartPreview formSettings={formSettings} />
                      </Card>
                    </div>

                    <Card sectioned title="Icon & animation">
                      <FormLayout>
                        <Select
                          label="Icon type"
                          options={iconOptions}
                          value={formSettings.selectedIcon}
                          onChange={(value) =>
                            handleSettingChange("selectedIcon", value)
                          }
                          helpText="Choose a built-in icon or upload your own image."
                        />

                        {formSettings.selectedIcon === "custom" && (
                          <BlockStack gap="400">
                            {/* Upload Section */}
                            <div>
                              <Text variant="bodyMd" as="p" fontWeight="medium">
                                Upload Icon
                              </Text>
                              <div style={{ marginTop: "12px" }}>
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={handleFileSelect}
                                  style={{ display: "none" }}
                                  id="icon-upload"
                                />
                                <Button
                                  onClick={() =>
                                    document
                                      .getElementById("icon-upload")
                                      .click()
                                  }
                                  disabled={isUploading}
                                  loading={isUploading}
                                >
                                  {isUploading ? "Uploading..." : "Choose File"}
                                </Button>
                                <Text
                                  variant="bodySm"
                                  as="p"
                                  tone="subdued"
                                  style={{ marginTop: "6px" }}
                                >
                                  Supported: PNG, JPEG, SVG, GIF (max 2MB)
                                </Text>
                              </div>
                            </div>

                            {/* Preview of Uploaded Icon */}
                            {formSettings.uploadedIconData && (
                              <div
                                style={{
                                  border: "1px solid #e1e3e5",
                                  borderRadius: "8px",
                                  padding: "12px",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "space-between",
                                  background: "#fafafa",
                                }}
                              >
                                <div
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "10px",
                                  }}
                                >
                                  <Thumbnail
                                    source={formSettings.uploadedIconData}
                                    alt="Uploaded icon"
                                    size="medium"
                                  />
                                  <Text variant="bodyMd" as="p">
                                    {uploadedFile?.name || "Uploaded icon"}
                                  </Text>
                                </div>
                                <Button
                                  onClick={handleRemoveIcon}
                                  variant="plain"
                                  tone="critical"
                                  size="slim"
                                >
                                  Remove
                                </Button>
                              </div>
                            )}

                            {/* Upload Error Display */}
                            {uploadError && (
                              <Banner status="critical" title="Upload Error">
                                <p>{uploadError}</p>
                              </Banner>
                            )}
                          </BlockStack>
                        )}

                        <Checkbox
                          label="Enable hover animation"
                          helpText="Animate the button when hovered."
                          checked={formSettings.enableHoverAnimation}
                          onChange={(checked) =>
                            handleSettingChange("enableHoverAnimation", checked)
                          }
                        />
                        <Select
                          label="Animation type"
                          options={animationOptions}
                          value={formSettings.animationType}
                          onChange={(value) =>
                            handleSettingChange("animationType", value)
                          }
                          disabled={!formSettings.enableHoverAnimation}
                        />
                      </FormLayout>
                    </Card>
                  </BlockStack>
                </Grid.Cell>

                {/* Below the tab section - Full width (one column) */}
                <Grid.Cell
                  columnSpan={{ xs: 12, sm: 12, md: 12, lg: 12, xl: 12 }}
                >
                  <PageActions
                    primaryAction={{
                      content: "Save settings",
                      submit: true,
                      loading: isLoading,
                      disabled: !isDirty || isLoading || !isFormValid(),
                    }}
                    secondaryActions={[
                      {
                        content: "Reset",
                        onAction: handleReset,
                        disabled: !isDirty,
                      },
                    ]}
                  />
                </Grid.Cell>
              </Grid>

              {/* Hidden fields */}
              {Object.entries(formSettings).map(([key, value]) => (
                <input key={key} type="hidden" name={key} value={value || ""} />
              ))}
            </Form>
          </Layout.Section>
        </Layout>

        {showToast && (
          <Toast
            content="Settings saved successfully!"
            duration={3000}
            onDismiss={() => setShowToast(false)}
          />
        )}
      </Page>
    </Frame>
  );
};

export default Index;
