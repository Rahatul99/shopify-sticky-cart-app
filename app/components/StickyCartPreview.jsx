import { Card, BlockStack, Text } from "@shopify/polaris";

const StickyCartPreview = ({ formSettings }) => {
  const getPositionStyles = () => {
    switch (formSettings.cartPosition) {
      case "bottom-left":
        return { left: "20px", bottom: "20px" };
      case "center-right":
        return { right: "20px", top: "50%", transform: "translateY(-50%)" };
      case "center-left":
        return { left: "20px", top: "50%", transform: "translateY(-50%)" };
      case "top-right":
        return { right: "20px", top: "20px" };
      case "top-left":
        return { left: "20px", top: "20px" };
      default:
        return { right: "20px", bottom: "20px" };
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

    const commonProps = {
      width: 24,
      height: 24,
      viewBox: "0 0 24 24",
      fill: "currentColor",
    };

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
    if (
      !formSettings.enableHoverAnimation ||
      formSettings.animationType === "none"
    )
      return "";

    const animations = {
      bounce: `@keyframes bounce { 
        0%, 20%, 53%, 80%, 100% { transform: translateY(0px); } 
        40%, 43% { transform: translateY(-15px); } 
        70% { transform: translateY(-7px); } 
        90% { transform: translateY(-3px); } 
      }`,
      pulse: `@keyframes pulse { 
        0% { transform: scale(1); } 
        50% { transform: scale(1.1); } 
        100% { transform: scale(1); } 
      }`,
      shake: `@keyframes shake { 
        0%, 100% { transform: translateX(0px); } 
        10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); } 
        20%, 40%, 60%, 80% { transform: translateX(5px); } 
      }`,
    };

    return `
      ${animations[formSettings.animationType] || ""}
      #dashboard-sticky-cart-preview:hover .sticky-cart-button { 
        animation: ${formSettings.animationType} 1s ease; 
      }
    `;
  };

  return (
    <Card>
      <BlockStack gap="400">
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
            #dashboard-sticky-cart-preview:hover .sticky-cart-button {
              transform: scale(1.05);
              box-shadow: 0 6px 16px rgba(0,0,0,0.2);
            }
            #dashboard-sticky-cart-preview .sticky-cart-button svg {
              width: 24px;
              height: 24px;
            }
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
              ...getPositionStyles(),
            }}
          >
            <div
              className="sticky-cart-button"
              style={{
                position: "relative",
                width: "100%",
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
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
            }}
          >
            <Text as="p" variant="bodySm" tone="subdued">
              Preview Area
            </Text>
          </div>
        </div>
      </BlockStack>
    </Card>
  );
};

export default StickyCartPreview;
