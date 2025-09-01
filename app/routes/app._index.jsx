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
  useBreakpoints,
  Box,
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
    quantityBadgeWidth: 24,
    quantityBadgeHeight: 24,
    quantityBadgeRadius: 50,
    showQuantityBadge: true,
    selectedIcon: "cart",
    uploadedIconData: null,
    uploadedIconType: null,
    customIconWidth: 50,
    customIconHeight: 50,
    quantityBadgePosition: "top-right",
    priceBackgroundColor: "transparent",
    deviceVisibility: "all",
    enableHoverAnimation: true,
    animationType: "bounce",
    showPricing: true,
    pricingTextColor: "#ffffff",
    pricingFontSize: 12,
    pricingFontWeight: "500",
    customCSS: "",
    // Structured Layout Settings
    structuredTopSectionBgColor: "#6b7280",
    structuredBottomSectionBgColor: "#f9fafb",
    structuredItemsTextColor: "#fbbf24",
    structuredPriceTextColor: "#374151",
    structuredCurrencySymbol: "৳",
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
    quantityBadgeWidth: parseInt(formData.get("quantityBadgeWidth")) || 24,
    quantityBadgeHeight: parseInt(formData.get("quantityBadgeHeight")) || 24,
    quantityBadgeRadius: parseInt(formData.get("quantityBadgeRadius")) || 50,
    showQuantityBadge: formData.get("showQuantityBadge") === "true",
    selectedIcon: formData.get("selectedIcon"),
    uploadedIconData:
      selectedIcon === "custom"
        ? formData.get("uploadedIconData") || null
        : null,
    uploadedIconType: formData.get("uploadedIconType") || null,
    customIconWidth: parseInt(formData.get("customIconWidth")) || 50,
    customIconHeight: parseInt(formData.get("customIconHeight")) || 50,
    quantityBadgePosition: formData.get("quantityBadgePosition"),
    priceBackgroundColor: formData.get("priceBackgroundColor"),
    deviceVisibility: formData.get("deviceVisibility"),
    enableHoverAnimation: formData.get("enableHoverAnimation") === "true",
    animationType: formData.get("animationType"),
    showPricing: formData.get("showPricing") === "true",
    pricingTextColor: formData.get("pricingTextColor"),
    pricingFontSize: parseInt(formData.get("pricingFontSize")),
    pricingFontWeight: formData.get("pricingFontWeight"),
    customCSS: formData.get("customCSS") || "",
    // Structured Layout Settings
    structuredTopSectionBgColor:
      formData.get("structuredTopSectionBgColor") || "#6b7280",
    structuredBottomSectionBgColor:
      formData.get("structuredBottomSectionBgColor") || "#f9fafb",
    structuredItemsTextColor:
      formData.get("structuredItemsTextColor") || "#fbbf24",
    structuredPriceTextColor:
      formData.get("structuredPriceTextColor") || "#374151",
    structuredCurrencySymbol: formData.get("structuredCurrencySymbol") || "৳",
  };

  await createOrUpdateStickyCartSettings(shop.id, settings);
  return json({ success: true, message: "Settings saved successfully!" });
};

const Index = () => {
  const { settings } = useLoaderData();
  const actionData = useActionData();
  const navigation = useNavigation();
  const isLoading = navigation.state === "submitting";
  const { mdUp } = useBreakpoints();

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

  // Ensure formSettings are properly synchronized with loaded settings
  useEffect(() => {
    if (settings) {
      setFormSettings(settings);
    }
  }, [settings]);

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
    "quantityBadgeWidth",
    "quantityBadgeHeight",
    "quantityBadgeRadius",
    "showQuantityBadge",
    "selectedIcon",
    "uploadedIconData",
    "uploadedIconType",
    "customIconWidth",
    "customIconHeight",
    "quantityBadgePosition",
    "priceBackgroundColor",
    "deviceVisibility",
    "enableHoverAnimation",
    "animationType",
    "showPricing",
    "pricingTextColor",
    "pricingFontSize",
    "pricingFontWeight",
    "customCSS",
    // Structured Layout Settings
    "structuredTopSectionBgColor",
    "structuredBottomSectionBgColor",
    "structuredItemsTextColor",
    "structuredPriceTextColor",
    "structuredCurrencySymbol",
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
      // Check if we have uploaded icon data
      if (!formSettings.uploadedIconData) {
        return false;
      }
    }
    return true;
  };

  return (
    <Frame>
      <Page
        title="Customize your Sticky Cart"
        subtitle="Design and configure your sticky cart to match your store's branding."
      >
        <Layout>
          <Layout.Section secondary>
            <Banner
              title="Changes may take a few minutes to appear"
              status="info"
            >
              <p>
                Updates to your sticky cart might not show up right away. Please
                allow up to five minutes, as caching is used to keep your
                storefront loading quickly.
              </p>
            </Banner>
          </Layout.Section>

          <Layout.Section secondary>
            <Form method="post">
              <Grid
                columns={{ xs: 1, md: 2, lg: 2 }}
                gap={{ xs: "400", md: "500" }}
              >
                {/* IMPROVED RESPONSIVE PREVIEW SECTION */}
                <Grid.Cell
                  columnSpan={{ xs: 1, md: 1 }}
                  order={{ xs: 2, md: 1 }}
                >
                  <Box
                    as="div"
                    style={{
                      // Desktop: sticky positioning
                      ...(mdUp && {
                        position: "sticky",
                        top: "20px",
                        zIndex: 1,
                      }),
                      // Mobile: normal flow, no fixed positioning issues
                      ...(!mdUp && {
                        position: "relative",
                        marginBottom: "20px",
                      }),
                    }}
                  >
                    <Card sectioned>
                      <StickyCartPreview formSettings={formSettings} />
                    </Card>
                  </Box>

                  {/* Add consistent spacing for all screen sizes */}
                  <Box
                    as="div"
                    style={{
                      height: mdUp ? "200px" : "0px", // Only add extra space on desktop for sticky effect
                    }}
                  />
                </Grid.Cell>

                {/* FORM SECTION - No changes needed here */}
                <Grid.Cell
                  columnSpan={{ xs: 1, md: 1 }}
                  order={{ xs: 1, md: 2 }}
                >
                  <BlockStack gap={{ xs: "400", md: "500" }}>
                    <Card sectioned title="General">
                      <FormLayout gap={{ xs: "400", sm: "400", md: "500" }}>
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
                    <Card sectioned title="Layout Type">
                      <FormLayout gap={{ xs: "400", sm: "400", md: "500" }}>
                        <Select
                          label="Layout Type"
                          options={[
                            { label: "Normal Layout", value: "normal" },
                            { label: "Structured Layout", value: "structured" },
                          ]}
                          value={
                            formSettings.quantityBadgePosition === "structured"
                              ? "structured"
                              : "normal"
                          }
                          onChange={(value) => {
                            if (value === "structured") {
                              handleSettingChange(
                                "quantityBadgePosition",
                                "structured",
                              );
                            } else {
                              handleSettingChange(
                                "quantityBadgePosition",
                                "top-right",
                              );
                            }
                          }}
                          helpText="Choose between simple normal layout or professional structured layout with two sections."
                        />
                      </FormLayout>
                    </Card>
                    <Card sectioned title="Appearance">
                      <FormLayout gap={{ xs: "400", sm: "400", md: "500" }}>
                        <FormLayout.Group
                          gap={{ xs: "400", sm: "400", md: "500" }}
                        >
                          <TextField
                            type="color"
                            label="Background color"
                            value={formSettings.backgroundColor}
                            onChange={(value) =>
                              handleSettingChange("backgroundColor", value)
                            }
                          />
                          <TextField
                            type="color"
                            label="Icon color"
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
                          disabled={
                            formSettings.quantityBadgePosition === "structured"
                          }
                        />

                        {formSettings.showQuantityBadge &&
                          formSettings.quantityBadgePosition !==
                            "structured" && (
                            <FormLayout.Group>
                              <TextField
                                type="color"
                                label="Badge background color"
                                value={formSettings.quantityBackgroundColor}
                                onChange={(value) =>
                                  handleSettingChange(
                                    "quantityBackgroundColor",
                                    value,
                                  )
                                }
                              />
                              <TextField
                                type="color"
                                label="Badge text color"
                                value={formSettings.quantityTextColor}
                                onChange={(value) =>
                                  handleSettingChange(
                                    "quantityTextColor",
                                    value,
                                  )
                                }
                              />
                            </FormLayout.Group>
                          )}

                        {formSettings.showQuantityBadge &&
                          formSettings.quantityBadgePosition !==
                            "structured" && (
                            <FormLayout.Group>
                              <RangeSlider
                                label="Badge width (px)"
                                value={formSettings.quantityBadgeWidth}
                                onChange={(value) =>
                                  handleSettingChange(
                                    "quantityBadgeWidth",
                                    value,
                                  )
                                }
                                min={16}
                                max={Math.min(formSettings.width, 60)}
                                output
                                helpText={
                                  formSettings.quantityBadgePosition ===
                                  "structured"
                                    ? "Badge appears in corner for structured layout"
                                    : `Maximum width is limited to button width (${formSettings.width}px)`
                                }
                              />
                              <RangeSlider
                                label="Badge height (px)"
                                value={formSettings.quantityBadgeHeight}
                                onChange={(value) =>
                                  handleSettingChange(
                                    "quantityBadgeHeight",
                                    value,
                                  )
                                }
                                min={16}
                                max={Math.min(formSettings.height, 60)}
                                output
                                helpText={
                                  formSettings.quantityBadgePosition ===
                                  "structured"
                                    ? "Badge appears in corner for structured layout"
                                    : `Maximum height is limited to button height (${formSettings.height}px)`
                                }
                              />
                              <RangeSlider
                                label="Badge border radius (%)"
                                value={formSettings.quantityBadgeRadius}
                                onChange={(value) =>
                                  handleSettingChange(
                                    "quantityBadgeRadius",
                                    value,
                                  )
                                }
                                min={0}
                                max={100}
                                output
                                helpText="100% will make the badge fully circular."
                              />
                            </FormLayout.Group>
                          )}

                        {/* Badge Position - Only for Normal Layout */}
                        {formSettings.quantityBadgePosition !==
                          "structured" && (
                          <FormLayout.Group>
                            <Select
                              label="Badge Position"
                              options={[
                                {
                                  label: "Top Right Corner",
                                  value: "top-right",
                                },
                                { label: "Top Left Corner", value: "top-left" },
                                {
                                  label: "Bottom Right Corner",
                                  value: "bottom-right",
                                },
                                {
                                  label: "Bottom Left Corner",
                                  value: "bottom-left",
                                },
                              ]}
                              value={formSettings.quantityBadgePosition}
                              onChange={(value) =>
                                handleSettingChange(
                                  "quantityBadgePosition",
                                  value,
                                )
                              }
                              helpText="Choose where the quantity badge appears on the button."
                            />
                          </FormLayout.Group>
                        )}

                        {/* Structured Layout Notice */}
                        {formSettings.quantityBadgePosition ===
                          "structured" && (
                          <Banner status="info">
                            <p>
                              Quantity badge is not available in structured
                              layout. The layout automatically displays items
                              count and pricing in a professional two-section
                              design.
                            </p>
                          </Banner>
                        )}
                      </FormLayout>
                    </Card>
                    {/* Structured Layout Settings - Only shown when structured layout is selected */}
                    {formSettings.quantityBadgePosition === "structured" && (
                      <Card sectioned title="Structured Layout Settings">
                        <FormLayout>
                          <FormLayout.Group>
                            <TextField
                              label="Top Section Background Color"
                              type="color"
                              value={formSettings.structuredTopSectionBgColor}
                              onChange={(value) =>
                                handleSettingChange(
                                  "structuredTopSectionBgColor",
                                  value,
                                )
                              }
                              helpText="Background color for the items count section."
                            />
                            <TextField
                              label="Bottom Section Background Color"
                              type="color"
                              value={
                                formSettings.structuredBottomSectionBgColor
                              }
                              onChange={(value) =>
                                handleSettingChange(
                                  "structuredBottomSectionBgColor",
                                  value,
                                )
                              }
                              helpText="Background color for the pricing section."
                            />
                          </FormLayout.Group>
                          <FormLayout.Group>
                            <TextField
                              label="Items Text Color"
                              type="color"
                              value={formSettings.structuredItemsTextColor}
                              onChange={(value) =>
                                handleSettingChange(
                                  "structuredItemsTextColor",
                                  value,
                                )
                              }
                              helpText="Color for the 'X ITEMS' text."
                            />
                            <TextField
                              label="Price Text Color"
                              type="color"
                              value={formSettings.structuredPriceTextColor}
                              onChange={(value) =>
                                handleSettingChange(
                                  "structuredPriceTextColor",
                                  value,
                                )
                              }
                              helpText="Color for the price text."
                            />
                          </FormLayout.Group>
                          <FormLayout.Group>
                            <Select
                              label="Currency Symbol"
                              options={[
                                { label: "Bangladeshi Taka (৳)", value: "৳" },
                                { label: "US Dollar ($)", value: "$" },
                                { label: "Euro (€)", value: "€" },
                                { label: "British Pound (£)", value: "£" },
                                { label: "Japanese Yen (¥)", value: "¥" },
                                { label: "Canadian Dollar (C$)", value: "C$" },
                                {
                                  label: "Australian Dollar (A$)",
                                  value: "A$",
                                },
                              ]}
                              value={formSettings.structuredCurrencySymbol}
                              onChange={(value) =>
                                handleSettingChange(
                                  "structuredCurrencySymbol",
                                  value,
                                )
                              }
                              helpText="Choose the currency symbol to display."
                            />
                          </FormLayout.Group>
                        </FormLayout>
                      </Card>
                    )}
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
                            <TextField
                              type="color"
                              label="Price text color"
                              value={formSettings.pricingTextColor}
                              onChange={(value) =>
                                handleSettingChange("pricingTextColor", value)
                              }
                            />
                            <TextField
                              type="color"
                              label="Price background color"
                              value={formSettings.priceBackgroundColor}
                              onChange={(value) =>
                                handleSettingChange(
                                  "priceBackgroundColor",
                                  value,
                                )
                              }
                              helpText="Set to transparent for no background."
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
                    <Card sectioned title="Icon & Animation">
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
                          <BlockStack gap={{ xs: "400", sm: "400", md: "500" }}>
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

                            {/* Custom Icon Dimensions */}
                            <div>
                              <Text variant="bodyMd" as="p" fontWeight="medium">
                                Custom Icon Dimensions
                              </Text>
                              <FormLayout.Group>
                                <RangeSlider
                                  label="Icon width (px)"
                                  value={formSettings.customIconWidth}
                                  onChange={(value) =>
                                    handleSettingChange(
                                      "customIconWidth",
                                      value,
                                    )
                                  }
                                  min={20}
                                  max={100}
                                  output
                                  helpText="Set the width of your custom icon."
                                />
                                <RangeSlider
                                  label="Icon height (px)"
                                  value={formSettings.customIconHeight}
                                  onChange={(value) =>
                                    handleSettingChange(
                                      "customIconHeight",
                                      value,
                                    )
                                  }
                                  min={20}
                                  max={100}
                                  output
                                  helpText="Set the height of your custom icon."
                                />
                              </FormLayout.Group>
                            </div>
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
              </Grid>

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

              {/* Hidden fields */}
              {Object.entries(formSettings).map(([key, value]) => {
                // Handle different value types properly
                let displayValue = value;
                if (typeof value === "boolean") {
                  displayValue = value.toString();
                } else if (value === null || value === undefined) {
                  displayValue = "";
                }
                return (
                  <input
                    key={key}
                    type="hidden"
                    name={key}
                    value={displayValue}
                  />
                );
              })}
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
