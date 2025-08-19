import { json } from "@remix-run/node";
import { useLoaderData, useNavigation, Form } from "@remix-run/react";
import {
  Page,
  Layout,
  Card,
  Text,
  Button,
  FormLayout,
  TextField,
  Select,
  Checkbox,
  Banner,
  ButtonGroup,
  Frame,
  Toast,
} from "@shopify/polaris";
import { useState, useCallback } from "react";
import { authenticate } from "../shopify.server";
import {
  createOrUpdateStickyCartSettings,
  createShop,
  getShop,
} from "../models/settings.server";

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
    deviceVisibility: formData.get("deviceVisibility"),
    enableHoverAnimation: formData.get("enableHoverAnimation") === "true",
    animationType: formData.get("animationType"),
  };

  await createOrUpdateStickyCartSettings(shop.id, settings);

  return json({ success: true, message: "Settings saved successfully!" });
};

export default function Index() {
  const { settings } = useLoaderData();
  const navigation = useNavigation();
  const isLoading = navigation.state === "submitting";

  const [formSettings, setFormSettings] = useState(settings);
  const [showToast, setShowToast] = useState(false);

  const handleSettingChange = useCallback((field, value) => {
    setFormSettings((prev) => ({
      ...prev,
      [field]: value,
    }));
  }, []);

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

  const StickyCartPreview = () => {
    const getPositionStyles = () => {
      switch (formSettings.cartPosition) {
        case "bottom-left":
          return "left: 20px; bottom: 20px;";
        case "center-right":
          return "right: 20px; top: 50%; transform: translateY(-50%);";
        case "center-left":
          return "left: 20px; top: 50%; transform: translateY(-50%);";
        case "top-right":
          return "right: 20px; top: 20px;";
        case "top-left":
          return "left: 20px; top: 20px;";
        default:
          return "right: 20px; bottom: 20px;";
      }
    };

    return (
      <div
        style={{
          position: "relative",
          height: "300px",
          background: "#f4f4f4",
          borderRadius: "8px",
          border: "2px dashed #ddd",
        }}
      >
        <div
          style={{
            position: "absolute",
            width: `${formSettings.width}px`,
            height: `${formSettings.height}px`,
            backgroundColor: formSettings.backgroundColor,
            borderRadius: `${formSettings.buttonRadius}%`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: formSettings.iconColor,
            fontSize: "24px",
            cursor: "pointer",
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            transition: "transform 0.2s ease",
            ...Object.fromEntries(
              getPositionStyles()
                .split(";")
                .map((style) => {
                  const [prop, value] = style.split(":").map((s) => s.trim());
                  return [prop, value];
                })
                .filter(([prop]) => prop),
            ),
          }}
          onMouseEnter={(e) => {
            if (formSettings.enableHoverAnimation) {
              e.target.style.transform += " scale(1.1)";
            }
          }}
          onMouseLeave={(e) => {
            if (formSettings.enableHoverAnimation) {
              e.target.style.transform = e.target.style.transform.replace(
                " scale(1.1)",
                "",
              );
            }
          }}
        >
          <span>🛒</span>
          {formSettings.showQuantityBadge && (
            <div
              style={{
                position: "absolute",
                top: "-5px",
                right: "-5px",
                backgroundColor: formSettings.quantityBackgroundColor,
                color: formSettings.quantityTextColor,
                borderRadius: "50%",
                width: "24px",
                height: "24px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "12px",
                fontWeight: "bold",
              }}
            >
              2
            </div>
          )}
        </div>
        <div
          style={{
            position: "absolute",
            bottom: "10px",
            left: "50%",
            transform: "translateX(-50%)",
            color: "#666",
            fontSize: "14px",
          }}
        >
          Preview Area
        </div>
      </div>
    );
  };

  return (
    <Frame>
      <Page title="Sticky Cart Customizer">
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
              <Layout>
                <Layout.Section oneHalf>
                  <Card sectioned title="General Settings">
                    <FormLayout>
                      <Checkbox
                        label="Enable Sticky Cart"
                        checked={formSettings.enabled}
                        onChange={(checked) =>
                          handleSettingChange("enabled", checked)
                        }
                      />

                      <Select
                        label="Cart Position"
                        options={positionOptions}
                        value={formSettings.cartPosition}
                        onChange={(value) =>
                          handleSettingChange("cartPosition", value)
                        }
                      />

                      <Select
                        label="Device Visibility"
                        options={deviceOptions}
                        value={formSettings.deviceVisibility}
                        onChange={(value) =>
                          handleSettingChange("deviceVisibility", value)
                        }
                      />
                    </FormLayout>
                  </Card>

                  <Card sectioned title="Appearance">
                    <FormLayout>
                      <div>
                        <Text variant="bodyMd" as="p" color="subdued">
                          Background Color
                        </Text>
                        <input
                          type="color"
                          value={formSettings.backgroundColor}
                          onChange={(e) =>
                            handleSettingChange(
                              "backgroundColor",
                              e.target.value,
                            )
                          }
                          style={{
                            width: "100%",
                            height: "40px",
                            border: "1px solid #ddd",
                            borderRadius: "4px",
                          }}
                        />
                      </div>

                      <div>
                        <Text variant="bodyMd" as="p" color="subdued">
                          Icon Color
                        </Text>
                        <input
                          type="color"
                          value={formSettings.iconColor}
                          onChange={(e) =>
                            handleSettingChange("iconColor", e.target.value)
                          }
                          style={{
                            width: "100%",
                            height: "40px",
                            border: "1px solid #ddd",
                            borderRadius: "4px",
                          }}
                        />
                      </div>

                      <TextField
                        label="Button Radius (%)"
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
                    </FormLayout>
                  </Card>

                  <Card sectioned title="Quantity Badge">
                    <FormLayout>
                      <Checkbox
                        label="Show Quantity Badge"
                        checked={formSettings.showQuantityBadge}
                        onChange={(checked) =>
                          handleSettingChange("showQuantityBadge", checked)
                        }
                      />

                      {formSettings.showQuantityBadge && (
                        <>
                          <div>
                            <Text variant="bodyMd" as="p" color="subdued">
                              Badge Background Color
                            </Text>
                            <input
                              type="color"
                              value={formSettings.quantityBackgroundColor}
                              onChange={(e) =>
                                handleSettingChange(
                                  "quantityBackgroundColor",
                                  e.target.value,
                                )
                              }
                              style={{
                                width: "100%",
                                height: "40px",
                                border: "1px solid #ddd",
                                borderRadius: "4px",
                              }}
                            />
                          </div>

                          <div>
                            <Text variant="bodyMd" as="p" color="subdued">
                              Badge Text Color
                            </Text>
                            <input
                              type="color"
                              value={formSettings.quantityTextColor}
                              onChange={(e) =>
                                handleSettingChange(
                                  "quantityTextColor",
                                  e.target.value,
                                )
                              }
                              style={{
                                width: "100%",
                                height: "40px",
                                border: "1px solid #ddd",
                                borderRadius: "4px",
                              }}
                            />
                          </div>
                        </>
                      )}
                    </FormLayout>
                  </Card>
                </Layout.Section>

                <Layout.Section oneHalf>
                  <Card sectioned title="Live Preview">
                    <StickyCartPreview />
                  </Card>

                  <Card sectioned title="Icon & Animation">
                    <FormLayout>
                      <Select
                        label="Icon Type"
                        options={iconOptions}
                        value={formSettings.selectedIcon}
                        onChange={(value) =>
                          handleSettingChange("selectedIcon", value)
                        }
                      />

                      <Checkbox
                        label="Enable Hover Animation"
                        checked={formSettings.enableHoverAnimation}
                        onChange={(checked) =>
                          handleSettingChange("enableHoverAnimation", checked)
                        }
                      />

                      <Select
                        label="Animation Type"
                        options={animationOptions}
                        value={formSettings.animationType}
                        onChange={(value) =>
                          handleSettingChange("animationType", value)
                        }
                        disabled={!formSettings.enableHoverAnimation}
                      />
                    </FormLayout>
                  </Card>
                </Layout.Section>
              </Layout>

              {/* Hidden form fields */}
              <input
                type="hidden"
                name="enabled"
                value={formSettings.enabled}
              />
              <input
                type="hidden"
                name="cartPosition"
                value={formSettings.cartPosition}
              />
              <input
                type="hidden"
                name="backgroundColor"
                value={formSettings.backgroundColor}
              />
              <input
                type="hidden"
                name="iconColor"
                value={formSettings.iconColor}
              />
              <input
                type="hidden"
                name="buttonRadius"
                value={formSettings.buttonRadius}
              />
              <input type="hidden" name="width" value={formSettings.width} />
              <input type="hidden" name="height" value={formSettings.height} />
              <input
                type="hidden"
                name="quantityBackgroundColor"
                value={formSettings.quantityBackgroundColor}
              />
              <input
                type="hidden"
                name="quantityTextColor"
                value={formSettings.quantityTextColor}
              />
              <input
                type="hidden"
                name="showQuantityBadge"
                value={formSettings.showQuantityBadge}
              />
              <input
                type="hidden"
                name="selectedIcon"
                value={formSettings.selectedIcon}
              />
              <input
                type="hidden"
                name="deviceVisibility"
                value={formSettings.deviceVisibility}
              />
              <input
                type="hidden"
                name="enableHoverAnimation"
                value={formSettings.enableHoverAnimation}
              />
              <input
                type="hidden"
                name="animationType"
                value={formSettings.animationType}
              />

              <Layout.Section>
                <div style={{ textAlign: "center", marginTop: "2rem" }}>
                  <ButtonGroup>
                    <Button loading={isLoading} primary submit>
                      Save Settings
                    </Button>
                  </ButtonGroup>
                </div>
              </Layout.Section>
            </Form>
          </Layout.Section>
        </Layout>

        {showToast && (
          <Toast
            content="Settings saved successfully!"
            onDismiss={() => setShowToast(false)}
          />
        )}
      </Page>
    </Frame>
  );
}
