import { FIELD_NAMES } from "./data";

export const normalizeForComparison = (obj) => {
  const normalized = {};
  FIELD_NAMES.forEach((key) => {
    if (key === "uploadedIconData" || key === "uploadedIconType") {
      normalized[key] = obj?.[key] || "";
    } else {
      normalized[key] = obj?.[key];
    }
  });
  return normalized;
};

export const parseFormDataSettings = (formData) => {
  const getValue = (key, fallback = null) => formData.get(key) || fallback;
  const getIntValue = (key, fallback = 0) =>
    parseInt(getValue(key)) || fallback;
  const getBoolValue = (key) => getValue(key) === "true";

  const selectedIcon = getValue("selectedIcon");

  return {
    enabled: getBoolValue("enabled"),
    cartPosition: getValue("cartPosition"),
    backgroundColor: getValue("backgroundColor"),
    iconColor: getValue("iconColor"),
    buttonRadius: getIntValue("buttonRadius"),
    width: getIntValue("width"),
    height: getIntValue("height"),
    quantityBackgroundColor: getValue("quantityBackgroundColor"),
    quantityTextColor: getValue("quantityTextColor"),
    quantityBadgeWidth: getIntValue("quantityBadgeWidth", 24),
    quantityBadgeHeight: getIntValue("quantityBadgeHeight", 24),
    quantityBadgeRadius: getIntValue("quantityBadgeRadius", 50),
    showQuantityBadge: getBoolValue("showQuantityBadge"),
    selectedIcon,
    uploadedIconData:
      selectedIcon === "custom" ? getValue("uploadedIconData") : null,
    uploadedIconType: getValue("uploadedIconType"),
    customIconWidth: getIntValue("customIconWidth", 50),
    customIconHeight: getIntValue("customIconHeight", 50),
    quantityBadgePosition: getValue("quantityBadgePosition"),
    priceBackgroundColor: getValue("priceBackgroundColor"),
    deviceVisibility: getValue("deviceVisibility"),
    enableHoverAnimation: getBoolValue("enableHoverAnimation"),
    animationType: getValue("animationType"),
    showPricing: getBoolValue("showPricing"),
    pricingTextColor: getValue("pricingTextColor"),
    pricingFontSize: getIntValue("pricingFontSize"),
    pricingFontWeight: getValue("pricingFontWeight"),
    customCSS: getValue("customCSS", ""),
    structuredTopSectionBgColor: getValue(
      "structuredTopSectionBgColor",
      "#6b7280",
    ),
    structuredBottomSectionBgColor: getValue(
      "structuredBottomSectionBgColor",
      "#f9fafb",
    ),
    structuredItemsTextColor: getValue("structuredItemsTextColor", "#fbbf24"),
    structuredPriceTextColor: getValue("structuredPriceTextColor", "#374151"),
    structuredCurrencySymbol: getValue("structuredCurrencySymbol", "৳"),
  };
};
