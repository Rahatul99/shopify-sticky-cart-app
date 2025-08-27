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
    deviceVisibility: "all",
    enableHoverAnimation: true,
    animationType: "bounce",
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
  const settings = {
    enabled: formData.get("enabled") === "true",
    cartPosition: formData.get("cartPosition"),
    backgroundColor: formData.get("backgroundColor"),
    iconColor: formData.get("iconColor"),
    buttonRadius: parseInt(formData.get("buttonRadius")),
    width: parseInt(formData.get("width")),
    height: parseInt(formData.get("height")),
    quantityBackgroundColor: formData.get("quantityBackgroundColor"),
    quantityTextColor: formData.get("quantityTextColor"),
    showQuantityBadge: formData.get("showQuantityBadge") === "true",
    selectedIcon: formData.get("selectedIcon"),
    customIconUrl: formData.get("customIconUrl") || null,
    deviceVisibility: formData.get("deviceVisibility"),
    enableHoverAnimation: formData.get("enableHoverAnimation") === "true",
    animationType: formData.get("animationType"),
  };

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

  // Show toast once per successful submission
  useEffect(() => {
    if (actionData?.success) {
      setShowToast(true);
    }
  }, [actionData]);

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
    "customIconUrl",
    "deviceVisibility",
    "enableHoverAnimation",
    "animationType",
  ];
  const normalizeForCompare = (obj) => {
    const out = {};
    for (const key of fieldNames) {
      if (key === "customIconUrl") {
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
                <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 6, lg: 6, xl: 6 }}>
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
                        <TextField
                          label="Button radius (%)"
                          type="number"
                          value={String(formSettings.buttonRadius)}
                          onChange={(value) =>
                            handleSettingChange(
                              "buttonRadius",
                              parseInt(value) || 0,
                            )
                          }
                          min="0"
                          max="50"
                          helpText="Controls how round the button corners are."
                        />
                        <TextField
                          label="Width (px)"
                          type="number"
                          value={String(formSettings.width)}
                          onChange={(value) =>
                            handleSettingChange("width", parseInt(value) || 60)
                          }
                          min="60"
                          max="120"
                        />
                        <TextField
                          label="Height (px)"
                          type="number"
                          value={String(formSettings.height)}
                          onChange={(value) =>
                            handleSettingChange("height", parseInt(value) || 60)
                          }
                          min="60"
                          max="120"
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
                </Grid.Cell>

                {/* Right Column - Live Preview & Icon/Animation */}
                <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 6, lg: 6, xl: 6 }}>
                  <Card sectioned title="Live preview">
                    <StickyCartPreview formSettings={formSettings} />
                  </Card>

                  <Card sectioned title="Icon & animation">
                    <FormLayout>
                      <Select
                        label="Icon type"
                        options={iconOptions}
                        value={formSettings.selectedIcon}
                        onChange={(value) =>
                          handleSettingChange("selectedIcon", value)
                        }
                        helpText="Choose a built-in icon or use a custom image."
                      />
                      {formSettings.selectedIcon === "custom" && (
                        <TextField
                          label="Custom icon URL"
                          value={formSettings.customIconUrl || ""}
                          onChange={(value) =>
                            handleSettingChange("customIconUrl", value)
                          }
                          placeholder="https://.../icon.png"
                        />
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
                      disabled: !isDirty || isLoading,
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
