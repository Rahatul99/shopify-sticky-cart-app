import { json } from "@remix-run/node";
import { useLoaderData, useNavigation, useActionData, Form } from "@remix-run/react";
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
  PageActions,
} from "@shopify/polaris";
import { useState, useCallback, useEffect } from "react";
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
    customIconUrl: formData.get("customIconUrl") || null,
    deviceVisibility: formData.get("deviceVisibility"),
    enableHoverAnimation: formData.get("enableHoverAnimation") === "true",
    animationType: formData.get("animationType"),
  };

  await createOrUpdateStickyCartSettings(shop.id, settings);

  return json({ success: true, message: "Settings saved successfully!" });
};

export default function Index() {
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
  const isDirty = JSON.stringify(normalizeForCompare(formSettings)) !== JSON.stringify(normalizeForCompare(settings));

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

    const renderIcon = () => {
      if (formSettings.selectedIcon === "custom" && formSettings.customIconUrl) {
        return (
          <img
            src={formSettings.customIconUrl}
            alt="cart"
            style={{ width: 24, height: 24, objectFit: "contain" }}
          />
        );
      }

      const commonProps = { width: 24, height: 24, viewBox: "0 0 24 24", fill: "currentColor" };

      switch (formSettings.selectedIcon) {
        case "bag":
          return (
            <svg {...commonProps}>
              <path d="M19 7h-3V6a4 4 0 0 0-8 0v1H5a1 1 0 0 0-1 1v11a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V8a1 1 0 0 0-1-1zM10 6a2 2 0 0 1 4 0v1h-4V6zm8 15a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V9h2v1a1 1 0 0 0 2 0V9h4v1a1 1 0 0 0 2 0V9h2v12z" />
            </svg>
          );
        case "basket":
          return (
            <svg {...commonProps}>
              <path d="M17.21 9l-4.38-6.56a.993.993 0 0 0-.83-.42c-.32 0-.64.14-.83.43L6.79 9H2c-.55 0-1 .45-1 1 0 .09.01.18.04.27l2.54 9.27c.23.84 1 1.46 1.92 1.46h13c.92 0 1.69-.62 1.93-1.46l2.54-9.27c.03-.09.04-.18.04-.27 0-.55-.45-1-1-1h-4.79zM9 9l3-4.4L15 9H9zm3 8c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z" />
            </svg>
          );
        case "cart":
        default:
          return (
            <svg {...commonProps}>
              <path d="M7 18c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12L8.1 13h7.45c.75 0 1.41-.41 1.75-1.03L21.7 4H5.21l-.94-2H1zm16 16c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
            </svg>
          );
      }
    };

    const getAnimationCSS = () => {
      if (!formSettings.enableHoverAnimation || formSettings.animationType === "none") return "";
      const base = `#dashboard-sticky-cart-preview:hover .sticky-cart-button { animation: ANIM_NAME 1s ease; }`;
      const animations = {
        bounce: `@keyframes bounce { 0%, 20%, 53%, 80%, 100% { transform: translateY(0px); } 40%, 43% { transform: translateY(-15px); } 70% { transform: translateY(-7px); } 90% { transform: translateY(-3px); } }`,
        pulse: `@keyframes pulse { 0% { transform: scale(1); } 50% { transform: scale(1.1); } 100% { transform: scale(1); } }`,
        shake: `@keyframes shake { 0%, 100% { transform: translateX(0px); } 10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); } 20%, 40%, 60%, 80% { transform: translateX(5px); } }`,
      };
      const name = formSettings.animationType;
      return `${animations[name] || ""} ${base.replace("ANIM_NAME", name)}`;
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
        <style>{`
          ${getAnimationCSS()}
          #dashboard-sticky-cart-preview:hover .sticky-cart-button { transform: scale(1.05); box-shadow: 0 6px 16px rgba(0,0,0,0.2); }
          #dashboard-sticky-cart-preview .sticky-cart-button svg { width: 24px; height: 24px; }
        `}</style>
        <div
          id="dashboard-sticky-cart-preview"
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
            transition: "transform 0.2s ease, box-shadow 0.2s ease",
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
        >
          <div className="sticky-cart-button" style={{ position: "relative", width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
            {renderIcon()}
            {formSettings.showQuantityBadge && (
              <div
                className="quantity-badge"
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
              <style>{`
                .dashboard-grid { display: grid; grid-template-columns: 1fr; gap: 24px; }
                @media (min-width: 768px) {
                  .dashboard-grid { grid-template-columns: 1fr 1fr; align-items: start; }
                }
                .column-stack > * + * { margin-top: 16px; }
                .preview-sticky { position: sticky; top: 0; z-index: 10; }
              `}</style>
              <div className="dashboard-grid">
                <div className="column-stack">
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
                        <div>
                          <Text variant="bodyMd" as="p" color="subdued">
                            Background color
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
                            Icon color
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
                            handleSettingChange(
                              "width",
                              parseInt(value) || 60,
                            )
                          }
                          min="60"
                          max="120"
                        />
                        <TextField
                          label="Height (px)"
                          type="number"
                          value={String(formSettings.height)}
                          onChange={(value) =>
                            handleSettingChange(
                              "height",
                              parseInt(value) || 60,
                            )
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
                        <>
                          <FormLayout.Group>
                            <div>
                              <Text variant="bodyMd" as="p" color="subdued">
                                Badge background color
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
                                Badge text color
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
                          </FormLayout.Group>
                        </>
                      )}
                    </FormLayout>
                  </Card>
                </div>

                <div className="column-stack">
                  <div className="preview-sticky">
                    <Card sectioned title="Live preview">
                      <StickyCartPreview />
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
                </div>
              </div>

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
                name="customIconUrl"
                value={formSettings.customIconUrl || ""}
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
}
