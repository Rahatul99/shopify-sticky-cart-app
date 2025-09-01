import { Card, BlockStack, Text } from "@shopify/polaris";

const StickyCartPreview = ({ formSettings }) => {
  // Ensure formSettings exists and has required properties
  if (!formSettings) {
    return (
      <Card>
        <BlockStack gap="400">
          <div style={{ padding: "20px", textAlign: "center" }}>
            <Text>Preview not available - settings not loaded</Text>
          </div>
        </BlockStack>
      </Card>
    );
  }

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

  // Fixed border radius calculation
  const getBorderRadius = () => {
    const radius = formSettings.buttonRadius || 0;
    if (radius === 0) return "0px";
    if (radius >= 100) return "50%";

    const minSide = Math.min(formSettings.width, formSettings.height);
    const computedRadius = (radius / 100) * (minSide / 2);
    return `${computedRadius}px`;
  };

  // Get quantity badge position styles
  const getQuantityBadgePosition = () => {
    const positions = {
      "top-right": { top: "-5px", right: "-5px" },
      "top-left": { top: "-5px", left: "-5px" },
      "bottom-right": { bottom: "-5px", right: "-5px" },
      "bottom-left": { bottom: "-5px", left: "-5px" },
      structured: { top: "-5px", right: "-5px" },
    };
    return (
      positions[formSettings.quantityBadgePosition] || positions["top-right"]
    );
  };

  // Check if badge should use full button width
  const shouldUseFullButtonWidth = () => {
    return false; // No longer needed with simplified options
  };

  // Check if using structured layout
  const isStructuredLayout = () => {
    return formSettings.quantityBadgePosition === "structured";
  };

  // Get badge width based on position
  const getBadgeWidth = () => {
    if (shouldUseFullButtonWidth()) {
      return `${safeSettings.width}px`;
    }
    return `${safeSettings.quantityBadgeWidth}px`;
  };

  // Get badge height based on position
  const getBadgeHeight = () => {
    if (shouldUseFullButtonWidth()) {
      return `${safeSettings.quantityBadgeHeight}px`;
    }
    return `${safeSettings.quantityBadgeHeight}px`;
  };

  // Calculate badge border radius
  const getBadgeBorderRadius = () => {
    const radius = safeSettings.quantityBadgeRadius || 50;
    if (radius === 0) return "0px";
    if (radius >= 100) return "50%";

    let minSide;
    if (shouldUseFullButtonWidth()) {
      minSide = Math.min(safeSettings.width, safeSettings.quantityBadgeHeight);
    } else {
      minSide = Math.min(
        safeSettings.quantityBadgeWidth,
        safeSettings.quantityBadgeHeight,
      );
    }
    const computedRadius = (radius / 100) * (minSide / 2);
    return `${computedRadius}px`;
  };

  const renderIcon = () => {
    try {
      // Handle uploaded icon first (priority over custom URL)
      if (
        formSettings.selectedIcon === "custom" &&
        formSettings.uploadedIconData
      ) {
        const iconWidth = formSettings.customIconWidth || 50;
        const iconHeight = formSettings.customIconHeight || 50;
        return (
          <img
            src={formSettings.uploadedIconData}
            alt="cart"
            style={{
              width: iconWidth,
              height: iconHeight,
              objectFit: "contain",
              maxWidth: "100%",
              maxHeight: "100%",
            }}
            onError={(e) => {
              console.error("Failed to load custom icon:", e);
              e.target.style.display = "none";
            }}
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
    } catch (error) {
      console.error("Error rendering icon:", error);
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
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

  const getCustomCSS = () => {
    return formSettings.customCSS || "";
  };

  // Ensure all required values have defaults
  const safeSettings = {
    width: formSettings.width || 80,
    height: formSettings.height || 80,
    buttonRadius: formSettings.buttonRadius || 50,
    backgroundColor: formSettings.backgroundColor || "#000000",
    iconColor: formSettings.iconColor || "#ffffff",
    quantityBackgroundColor: formSettings.quantityBackgroundColor || "#ff0000",
    quantityTextColor: formSettings.quantityTextColor || "#ffffff",
    quantityBadgeWidth: formSettings.quantityBadgeWidth || 24,
    quantityBadgeHeight: formSettings.quantityBadgeHeight || 24,
    quantityBadgeRadius: formSettings.quantityBadgeRadius || 50,
    showQuantityBadge: formSettings.showQuantityBadge !== false,
    showPricing: formSettings.showPricing !== false,
    pricingFontSize: formSettings.pricingFontSize || 12,
    pricingFontWeight: formSettings.pricingFontWeight || "500",
    pricingTextColor: formSettings.pricingTextColor || "#ffffff",
    priceBackgroundColor: formSettings.priceBackgroundColor || "transparent",
    quantityBadgePosition: formSettings.quantityBadgePosition || "top-right",
    customIconWidth: formSettings.customIconWidth || 50,
    customIconHeight: formSettings.customIconHeight || 50,
    structuredTopSectionBgColor:
      formSettings.structuredTopSectionBgColor || "#6b7280",
    structuredItemsTextColor:
      formSettings.structuredItemsTextColor || "#fbbf24",
    structuredBottomSectionBgColor:
      formSettings.structuredBottomSectionBgColor || "#f9fafb",
    structuredPriceTextColor:
      formSettings.structuredPriceTextColor || "#374151",
    structuredCurrencySymbol: formSettings.structuredCurrencySymbol || "৳",
  };

  return (
    <div
      className="preview-container-wrapper"
      style={{
        position: "relative",
        height: "400px",
        background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
        borderRadius: "12px",
        border: "2px solid #e1e5e9",
        overflow: "hidden",
        minHeight: "300px",
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
        
        /* Mobile responsive styles */
        @media (max-width: 767px) {
          #dashboard-sticky-cart-preview {
            transform: scale(0.8);
            transform-origin: center;
          }
          
          /* Adjust preview container height for mobile */
          .preview-container-wrapper {
            height: 350px !important;
            min-height: 300px !important;
          }
        }
        
        @media (max-width: 480px) {
          #dashboard-sticky-cart-preview {
            transform: scale(0.7);
            transform-origin: center;
          }
          
          /* Further reduce height for very small screens */
          .preview-container-wrapper {
            height: 300px !important;
            min-height: 250px !important;
          }
        }
        
        ${getCustomCSS()}
      `}</style>

      <div
        id="dashboard-sticky-cart-preview"
        style={{
          position: "absolute",
          width: `${safeSettings.width}px`,
          height: `${safeSettings.height}px`,
          backgroundColor: safeSettings.backgroundColor,
          borderRadius: getBorderRadius(),
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: safeSettings.iconColor,
          fontSize: "24px",
          cursor: "pointer",
          boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
          transition: "transform 0.2s ease, box-shadow 0.2s ease",
          ...getPositionStyles(),
        }}
      >
        {isStructuredLayout() ? (
          // Structured Layout: Two sections
          <div
            className="sticky-cart-button"
            style={{
              position: "relative",
              width: "100%",
              height: "100%",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
              borderRadius: getBorderRadius(),
            }}
          >
            {/* Top Section - Items Count */}
            <div
              style={{
                flex: "1",
                backgroundColor:
                  safeSettings.structuredTopSectionBgColor || "#6b7280",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: "8px",
                position: "relative",
              }}
            >
              {renderIcon()}
              <div
                style={{
                  fontSize: "10px",
                  fontWeight: "bold",
                  color: safeSettings.structuredItemsTextColor || "#fbbf24",
                  marginTop: "4px",
                  textAlign: "center",
                }}
              >
                5 ITEMS
              </div>
            </div>

            {/* Bottom Section - Pricing */}
            <div
              style={{
                flex: "1",
                backgroundColor:
                  safeSettings.structuredBottomSectionBgColor || "#f9fafb",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "8px",
                fontSize: `${safeSettings.pricingFontSize}px`,
                fontWeight: safeSettings.pricingFontWeight,
                color: safeSettings.structuredPriceTextColor || "#374151",
              }}
            >
              <span style={{ fontSize: "12px" }}>
                {safeSettings.structuredCurrencySymbol || "৳"}
              </span>
              <span style={{ marginLeft: "2px" }}>2,419</span>
            </div>
          </div>
        ) : (
          // Standard Layout
          <div
            className="sticky-cart-button"
            style={{
              position: "relative",
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "column",
            }}
          >
            {renderIcon()}
            {safeSettings.showPricing && (
              <div
                className="cart-price"
                style={{
                  marginTop: "4px",
                  fontSize: `${safeSettings.pricingFontSize}px`,
                  fontWeight: safeSettings.pricingFontWeight,
                  color: safeSettings.pricingTextColor,
                  background:
                    safeSettings.priceBackgroundColor !== "transparent"
                      ? safeSettings.priceBackgroundColor
                      : "transparent",
                  padding:
                    safeSettings.priceBackgroundColor !== "transparent"
                      ? "4px 8px"
                      : "0",
                  borderRadius:
                    safeSettings.priceBackgroundColor !== "transparent"
                      ? "4px"
                      : "0",
                }}
              >
                $29.99
              </div>
            )}
          </div>
        )}

        {/* Quantity Badge - Only for Normal Layout */}
        {safeSettings.showQuantityBadge && !isStructuredLayout() && (
          <div
            className="quantity-badge"
            style={{
              position: "absolute",
              backgroundColor: safeSettings.quantityBackgroundColor,
              color: safeSettings.quantityTextColor,
              borderRadius: getBadgeBorderRadius(),
              width: getBadgeWidth(),
              height: getBadgeHeight(),
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "12px",
              fontWeight: "bold",
              ...getQuantityBadgePosition(),
            }}
          >
            2
          </div>
        )}
      </div>

      {/* Professional Preview Label */}
      <div
        style={{
          position: "absolute",
          bottom: "16px",
          left: "50%",
          transform: "translateX(-50%)",
          background: "rgba(255, 255, 255, 0.9)",
          padding: "8px 16px",
          borderRadius: "20px",
          border: "1px solid #e1e5e9",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        }}
      >
        <Text as="p" variant="bodySm" tone="subdued" fontWeight="medium">
          Preview Area
        </Text>
      </div>
    </div>
  );
};

export default StickyCartPreview;
