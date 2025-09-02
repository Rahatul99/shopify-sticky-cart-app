(function () {
  "use strict";

  // =============================================================================
  // CONSTANTS & CONFIGURATION
  // =============================================================================
  
  const CONFIG = {
    CACHE_TTL_MS: 5 * 60 * 1000,
    APP_URL_TIMEOUT: 2000,
    POLL_INTERVAL: 50,
    FONT_SIZE_ADJUSTMENT_DELAY: 50,
    RESIZE_DEBOUNCE_DELAY: 250,
    WIDGET_ID: "sticky-cart-widget",
    STYLE_ID: "sticky-cart-styles",
    MIN_FONT_SIZE_RATIO: 0.5,
    MIN_ABSOLUTE_FONT_SIZE: 6,
    DEFAULT_ICON_SIZE: 24,
  };

  const CURRENCY_SYMBOLS = {
    BDT: "৳", INR: "₹", PKR: "₨", LKR: "₨", NPR: "₨", MMK: "Ks",
  };

  const ICONS = {
    cart: `<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
      <path d="M7 18c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12L8.1 13h7.45c.75 0 1.41-.41 1.75-1.03L21.7 4H5.21l-.94-2H1zm16 16c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
    </svg>`,
    bag: `<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
      <path d="M19 7h-3V6a4 4 0 0 0-8 0v1H5a1 1 0 0 0-1 1v11a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V8a1 1 0 0 0-1-1zM10 6a2 2 0 0 1 4 0v1h-4V6zm8 15a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V9h2v1a1 1 0 0 0 2 0V9h4v1a1 1 0 0 0 2 0V9h2v12z"/>
    </svg>`,
    basket: `<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.21 9l-4.38-6.56a.993.993 0 0 0-.83-.42c-.32 0-.64.14-.83.43L6.79 9H2c-.55 0-1 .45-1 1 0 .09.01.18.04.27l2.54 9.27c.23.84 1 1.46 1.92 1.46h13c.92 0 1.69-.62 1.93-1.46l2.54-9.27c.03-.09.04-.18.04-.27 0-.55-.45-1-1-1h-4.79zM9 9l3-4.4L15 9H9zm3 8c-1.1 0-2-.9-2-2s.9-2 2-2-.9-2-2-2z"/>
    </svg>`,
  };

  // =============================================================================
  // UTILITY FUNCTIONS
  // =============================================================================

  const getAppUrl = () => {
    if (window.stickyCartAppUrl) return window.stickyCartAppUrl;
    try {
      const scripts = document.getElementsByTagName("script");
      let srcToParse = "";
      for (let i = 0; i < scripts.length; i++) {
        const s = scripts[i];
        if (s && typeof s.src === "string" && s.src.indexOf("/sticky-cart.js") !== -1) {
          srcToParse = s.src;
          break;
        }
      }
      if (!srcToParse && document.currentScript && document.currentScript.src) {
        srcToParse = document.currentScript.src;
      }
      if (!srcToParse) return "";

      const url = new URL(srcToParse, window.location.href);
      const appUrlParam = url.searchParams.get("appUrl");
      return appUrlParam || (url.origin ? url.origin : "");
    } catch (_) {
      return "";
    }
  };

  const waitForAppUrl = async (timeoutMs = CONFIG.APP_URL_TIMEOUT) => {
    const start = Date.now();
    return new Promise((resolve) => {
      const tick = () => {
        const url = getAppUrl();
        if (url || Date.now() - start > timeoutMs) {
          if (!url) {
            console.warn("[Sticky Cart] appUrl not found after wait");
          } else {
            console.log("[Sticky Cart] appUrl resolved:", url);
          }
          resolve(url || "");
        } else {
          setTimeout(tick, CONFIG.POLL_INTERVAL);
        }
      };
      tick();
    });
  };

  const getShopDomain = () => {
    return (
      window.stickyCartShop ||
      window.Shopify?.shop ||
      window.location.hostname
    );
  };

  const fetchCartData = async () => {
    try {
      const response = await fetch("/cart.js");
      return await response.json();
    } catch (error) {
      return { item_count: 0, total_price: 0 };
    }
  };

  const fetchStickyCartSettings = async () => {
    const shop = getShopDomain();
    const CACHE_TTL_MS = CONFIG.CACHE_TTL_MS;
    const storageKey = `stickyCartSettings:${shop}`;
    
    // Try cache first
    try {
      const cachedRaw = window.localStorage.getItem(storageKey);
      if (cachedRaw) {
        const cached = JSON.parse(cachedRaw);
        if (cached && typeof cached.expiresAt === "number" && cached.expiresAt > Date.now() && cached.data) {
          return cached.data;
        }
      }
    } catch (_) {}
    
    // Fallback to network
    try {
      const APP_URL = await waitForAppUrl();
      if (!APP_URL) {
        return getDefaultSettings();
      }
      const response = await fetch(`${APP_URL}/api/settings/${shop}`, { cache: "no-store" });
      const data = await response.json();
      const settings = data.settings || data.defaultSettings || getDefaultSettings();

      // Store in cache
      try {
        const payload = { data: settings, expiresAt: Date.now() + CACHE_TTL_MS };
        window.localStorage.setItem(storageKey, JSON.stringify(payload));
      } catch (_) {}

      return settings;
    } catch (error) {
      // On error, try to return stale cache if available
      try {
        const cachedRaw = window.localStorage.getItem(storageKey);
        if (cachedRaw) {
          const cached = JSON.parse(cachedRaw);
          if (cached && cached.data) {
            return cached.data;
          }
        }
      } catch (_) {}
      return getDefaultSettings();
    }
  };

  const getDefaultSettings = () => ({
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
    // Structured layout settings
    structuredTopSectionBgColor: "#6b7280",
    structuredBottomSectionBgColor: "#f9fafb",
    structuredItemsTextColor: "#fbbf24",
    structuredPriceTextColor: "#374151",
    structuredCurrencySymbol: "৳",
  });

  const getPositionStyles = (position) => {
    const positions = {
      "bottom-right": "right: 20px; bottom: 20px;",
      "bottom-left": "left: 20px; bottom: 20px;",
      "center-right": "right: 20px; top: 50%; transform: translateY(-50%);",
      "center-left": "left: 20px; top: 50%; transform: translateY(-50%);",
      "top-right": "right: 20px; top: 20px;",
      "top-left": "left: 20px; top: 20px;",
    };
    return positions[position] || positions["bottom-right"];
  };

  const getIconHTML = (iconType, uploadedIconData, customIconWidth = 24, customIconHeight = 24) => {
    // Handle uploaded icon first (priority over custom URL)
    if (iconType === "custom" && uploadedIconData) {
      return `<img src="${uploadedIconData}" alt="cart" style="width:${customIconWidth}px;height:${customIconHeight}px;object-fit:contain;" />`;
    }
    
    return ICONS[iconType] || ICONS.cart;
  };

  const getDeviceVisibilityCSS = (visibility) => {
    switch (visibility) {
      case "mobile-only":
        return "@media (min-width: 768px) { #sticky-cart-widget { display: none !important; } }";
      case "desktop-only":
        return "@media (max-width: 767px) { #sticky-cart-widget { display: none !important; } }";
      default:
        return "";
    }
  };

  const getMobileResponsiveCSS = () => {
    return `
      /* Mobile responsive adjustments for sticky cart */
      @media (max-width: 767px) {
        #sticky-cart-widget {
          position: fixed !important;
          z-index: 999999 !important;
        }
        
        #sticky-cart-widget[style*="bottom-right"] {
          right: 15px !important;
          bottom: 15px !important;
        }
        
        #sticky-cart-widget[style*="bottom-left"] {
          left: 15px !important;
          bottom: 15px !important;
        }
        
        #sticky-cart-widget[style*="top-right"] {
          right: 15px !important;
          top: 15px !important;
        }
        
        #sticky-cart-widget[style*="top-left"] {
          left: 15px !important;
          top: 15px !important;
        }
        
        #sticky-cart-widget .sticky-cart-button {
          touch-action: manipulation;
          -webkit-tap-highlight-color: transparent;
        }
      }
    `;
  };

  const getAnimationCSS = (animationType, enabled) => {
    if (!enabled || animationType === "none") return "";

    const animations = {
      bounce: `
        @keyframes bounce {
          0%, 20%, 53%, 80%, 100% { transform: translateY(0px); }
          40%, 43% { transform: translateY(-15px); }
          70% { transform: translateY(-7px); }
          90% { transform: translateY(-3px); }
        }
        #sticky-cart-widget:hover .sticky-cart-button {
          animation: bounce 1s ease;
        }
      `,
      pulse: `
        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.1); }
          100% { transform: scale(1); }
        }
        #sticky-cart-widget:hover .sticky-cart-button {
          animation: pulse 1s ease;
        }
      `,
      shake: `
        @keyframes shake {
          0%, 100% { transform: translateX(0px); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
          20%, 40%, 60%, 80% { transform: translateX(5px); }
        }
        #sticky-cart-widget:hover .sticky-cart-button {
          animation: shake 0.5s ease;
        }
      `,
    };
    return animations[animationType] || "";
  };

  const isSymbolPrefix = (currency, locale) => {
    try {
      const formatter = new Intl.NumberFormat(locale, { style: "currency", currency });
      const parts = formatter.formatToParts(0);
      return parts[0].type === "currency";
    } catch {
      return true; // Default to prefix
    }
  };

  const getCurrencyLiteral = (currency, locale) => {
    try {
      const formatter = new Intl.NumberFormat(locale, { style: "currency", currency });
      const parts = formatter.formatToParts(0);
      const literalPart = parts.find(p => p.type === "literal");
      return literalPart ? literalPart.value : "";
    } catch {
      return "";
    }
  };

  const getShopCurrencySymbol = (currency = "USD") => {
    if (CURRENCY_SYMBOLS[currency]) {
      return CURRENCY_SYMBOLS[currency];
    }
  
    const locale = window.Shopify?.locale || 
                   document.documentElement.lang || 
                   navigator.language || 
                   "en-US";
  
    try {
      const formatted = new Intl.NumberFormat(locale, {
        style: "currency",
        currency: currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(0);
  
      const symbol = formatted.replace(/[0-9\s.,\u00A0]/g, "");
      return symbol || currency;
    } catch {
      return currency;
    }
  };

  const formatCurrency = (amount, currency, locale) => {
    const symbol = getShopCurrencySymbol(currency);
    const literal = getCurrencyLiteral(currency, locale);
    const numberFormatter = new Intl.NumberFormat(locale, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    const formattedNumber = numberFormatter.format(amount);
    
    if (isSymbolPrefix(currency, locale)) {
      return symbol + literal + formattedNumber;
    } else {
      return formattedNumber + literal + symbol;
    }
  };

  // Font size calculation function
  const calculateOptimalFontSize = (element, originalFontSize, maxWidth) => {
    if (!element || !maxWidth) return originalFontSize;
    
    const minFontSize = Math.max(CONFIG.MIN_ABSOLUTE_FONT_SIZE, Math.floor(originalFontSize * CONFIG.MIN_FONT_SIZE_RATIO));
    let fontSize = originalFontSize;
    
    // Store original content to test with
    const testElement = element.cloneNode(true);
    testElement.style.position = 'absolute';
    testElement.style.visibility = 'hidden';
    testElement.style.whiteSpace = 'nowrap';
    element.parentElement.appendChild(testElement);
    
    while (fontSize >= minFontSize) {
      testElement.style.fontSize = `${fontSize}px`;
      
      if (testElement.scrollWidth <= maxWidth) {
        element.parentElement.removeChild(testElement);
        return fontSize;
      }
      
      fontSize -= 1;
    }
    
    element.parentElement.removeChild(testElement);
    return minFontSize;
  };

  // Better price font size adjustment
  const adjustPriceFontSize = (settings) => {
    const widget = document.getElementById(CONFIG.WIDGET_ID);
    if (!widget) return;

    const isStructured = settings.quantityBadgePosition === "structured";
    const originalFontSize = parseInt(settings.pricingFontSize) || 12;
    
    if (isStructured) {
      const priceSection = widget.querySelector(".structured-price-section");
      if (priceSection) {
        const containerWidth = priceSection.clientWidth;
        const maxWidth = Math.max(containerWidth - 16, 20);
        const optimalSize = calculateOptimalFontSize(priceSection, originalFontSize, maxWidth);
        priceSection.style.fontSize = `${optimalSize}px`;
      }
    } else {
      const priceElement = widget.querySelector(".cart-price");
      if (priceElement) {
        const containerWidth = widget.clientWidth;
        const maxWidth = Math.max(containerWidth - 16, 20);
        const optimalSize = calculateOptimalFontSize(priceElement, originalFontSize, maxWidth);
        priceElement.style.fontSize = `${optimalSize}px`;
      }
    }
  };

  const createStickyCartHTML = (settings, cartData) => {
    const { item_count = 0, total_price = 0 } = cartData;
    const positionStyles = getPositionStyles(settings.cartPosition);
    const iconHTML = getIconHTML(settings.selectedIcon, settings.uploadedIconData, settings.customIconWidth, settings.customIconHeight);
    
    // Border radius calculation
    const getBorderRadius = () => {
      const radius = settings.buttonRadius || 0;
      if (radius === 0) return "0px";
      if (radius >= 100) return "50%";
      
      const minSide = Math.min(settings.width, settings.height);
      const computedRadius = (radius / 100) * (minSide / 2);
      return `${computedRadius}px`;
    };
    
    // Get quantity badge position styles
    const getQuantityBadgePosition = () => {
      const positions = {
        "top-right": "top: -5px; right: -5px;",
        "top-left": "top: -5px; left: -5px;",
        "bottom-right": "bottom: -5px; right: -5px;",
        "bottom-left": "bottom: -5px; left: -5px;",
      };
      return positions[settings.quantityBadgePosition] || positions["top-right"];
    };

    const getBadgeBorderRadius = () => {
      const radius = settings.quantityBadgeRadius || 50;
      if (radius === 0) return "0px";
      if (radius >= 100) return "50%";
      
      const minSide = Math.min(settings.quantityBadgeWidth || 24, settings.quantityBadgeHeight || 24);
      const computedRadius = (radius / 100) * (minSide / 2);
      return `${computedRadius}px`;
    };
    
    const isStructuredLayout = () => {
      return settings.quantityBadgePosition === "structured";
    };
    
    const currency = cartData.currency || window.Shopify?.currency?.active || "USD";
    const locale = window.Shopify?.locale || document.documentElement.lang || navigator.language || "en-US";
    const priceFormatted = formatCurrency(total_price / 100, currency, locale);
    const symbol = getShopCurrencySymbol(currency);
    const literal = getCurrencyLiteral(currency, locale) === '\u00A0' ? '&nbsp;' : getCurrencyLiteral(currency, locale);
    const formattedNumber = (total_price / 100).toLocaleString(locale, { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    });

    return `
      <div id="${CONFIG.WIDGET_ID}" style="
        position: fixed;
        ${positionStyles}
        width: ${settings.width}px;
        height: ${settings.height}px;
        z-index: 999999;
        cursor: pointer;
        user-select: none;
      ">
        <div class="sticky-cart-button" style="
          width: 100%;
          height: 100%;
          background-color: ${settings.backgroundColor};
          border-radius: ${getBorderRadius()};
          display: flex;
          align-items: center;
          justify-content: center;
          color: ${settings.iconColor};
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
          position: relative;
          flex-direction: column;
        ">
          ${isStructuredLayout() ? `
            <!-- Structured Layout: Two sections -->
            <div style="
              position: relative;
              width: 100%;
              height: 100%;
              display: flex;
              flex-direction: column;
              overflow: hidden;
              border-radius: ${getBorderRadius()};
            ">
              <!-- Top Section - Items Count -->
              <div style="
                flex: 1;
                background-color: ${settings.structuredTopSectionBgColor || "#6b7280"};
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                padding: 4px;
                position: relative;
              ">
                ${iconHTML}
                <div class="structured-items-text" style="
                  font-size: 9px;
                  font-weight: bold;
                  color: ${settings.structuredItemsTextColor || "#fbbf24"};
                  margin-top: 2px;
                  text-align: center;
                  white-space: nowrap;
                ">
                  ${item_count} ITEMS
                </div>
              </div>
              
              <!-- Bottom Section - Pricing -->
              <div class="structured-price-section" style="
                flex: 1;
                background-color: ${settings.structuredBottomSectionBgColor || "#f9fafb"};
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 4px 6px;
                font-size: ${settings.pricingFontSize || 12}px;
                font-weight: ${settings.pricingFontWeight || "500"};
                color: ${settings.structuredPriceTextColor || "#374151"};
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
                line-height: 1;
              ">
                <span>${symbol}</span>${literal ? `<span>${literal}</span>` : ''}
                <span class="structured-price-text" style="${literal ? '' : 'margin-left: 2px;'}">${formattedNumber}</span>
              </div>
            </div>
          ` : `
            <!-- Standard Layout -->
            <div style="
              position: relative;
              width: 100%;
              height: 100%;
              display: flex;
              align-items: center;
              justify-content: center;
              flex-direction: column;
              padding: 4px;
            ">
              ${iconHTML}
              ${settings.showPricing ? `
                <div class="cart-price" style="
                  margin-top: 4px;
                  font-size: ${settings.pricingFontSize || 12}px;
                  font-weight: ${settings.pricingFontWeight || "500"};
                  color: ${settings.pricingTextColor};
                  background: ${settings.priceBackgroundColor !== "transparent" ? settings.priceBackgroundColor : "transparent"};
                  padding: ${settings.priceBackgroundColor !== "transparent" ? "2px 4px" : "0"};
                  border-radius: ${settings.priceBackgroundColor !== "transparent" ? "4px" : "0"};
                  white-space: nowrap;
                  overflow: hidden;
                  text-overflow: ellipsis;
                  max-width: 100%;
                  line-height: 1;
                  text-align: center;
                ">
                  ${priceFormatted}
                </div>
              ` : ""}
            </div>
          `}
          
          ${(settings.showQuantityBadge && !isStructuredLayout()) ? `
            <div class="quantity-badge" style="
              position: absolute;
              ${getQuantityBadgePosition()}
              background-color: ${settings.quantityBackgroundColor};
              color: ${settings.quantityTextColor};
              border-radius: ${getBadgeBorderRadius()};
              width: ${settings.quantityBadgeWidth || 24}px;
              height: ${settings.quantityBadgeHeight || 24}px;
              display: ${item_count > 0 ? "flex" : "none"};
              align-items: center;
              justify-content: center;
              font-size: 11px;
              font-weight: bold;
              font-family: system-ui, -apple-system, sans-serif;
              line-height: 1;
            ">
              ${item_count}
            </div>
          ` : ""}
        </div>
      </div>
    `;
  };

  const injectStyles = (settings) => {
    const styleId = CONFIG.STYLE_ID;
    let existingStyle = document.getElementById(styleId);

    if (existingStyle) {
      existingStyle.remove();
    }

    const style = document.createElement("style");
    style.id = styleId;
    style.textContent = `
      ${getDeviceVisibilityCSS(settings.deviceVisibility)}
      ${getAnimationCSS(settings.animationType, settings.enableHoverAnimation)}
      ${getMobileResponsiveCSS()}
      
      #${CONFIG.WIDGET_ID}:hover .sticky-cart-button {
        transform: scale(1.05);
        box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
      }
      
      .sticky-cart-button svg {
        width: ${CONFIG.DEFAULT_ICON_SIZE}px;
        height: ${CONFIG.DEFAULT_ICON_SIZE}px;
      }
      
      /* Ensure price text never breaks */
      #${CONFIG.WIDGET_ID} .cart-price,
      #${CONFIG.WIDGET_ID} .structured-price-section {
        white-space: nowrap !important;
        overflow: hidden !important;
        text-overflow: ellipsis !important;
      }
      
      ${settings.customCSS || ""}
    `;

    document.head.appendChild(style);
  };

  const openCart = () => {
    const cartDrawerTriggers = [
      'a[href="/cart"]',
      "[data-cart-drawer]",
      ".cart-drawer-toggle",
      ".js-drawer-open-cart",
      "#CartDrawer-Opener",
      ".cart-link",
    ];

    for (let selector of cartDrawerTriggers) {
      const trigger = document.querySelector(selector);
      if (trigger) {
        trigger.click();
        return;
      }
    }

    window.location.href = "/cart";
  };

  // Cart count update function
  const updateCartCount = async () => {
    try {
      const [cartData, settings] = await Promise.all([
        fetchCartData(),
        fetchStickyCartSettings()
      ]);
      
      const widget = document.getElementById(CONFIG.WIDGET_ID);
      if (!widget) return;
      
      const isStructured = settings?.quantityBadgePosition === "structured";
      const currency = cartData.currency || window.Shopify?.currency?.active || "USD";
      const locale = window.Shopify?.locale || document.documentElement.lang || navigator.language || "en-US";
      
      // Update quantity badge (non-structured layout)
      if (!isStructured) {
        const quantityBadge = widget.querySelector(".quantity-badge");
        if (quantityBadge && settings.showQuantityBadge) {
          quantityBadge.textContent = cartData.item_count;
          quantityBadge.style.display = cartData.item_count > 0 ? "flex" : "none";
        }

        // Update cart price (non-structured layout)
        const cartPrice = widget.querySelector(".cart-price");
        if (cartPrice && settings.showPricing) {
          const priceFormatted = formatCurrency(cartData.total_price / 100, currency, locale);
          cartPrice.textContent = priceFormatted;
        }
      } else {
        // Update structured layout elements
        const structuredItemsText = widget.querySelector(".structured-items-text");
        if (structuredItemsText) {
          structuredItemsText.textContent = `${cartData.item_count} ITEMS`;
        }
        
        const structuredPriceText = widget.querySelector(".structured-price-text");
        if (structuredPriceText) {
          const formattedNumber = (cartData.total_price / 100).toLocaleString(locale, { 
            minimumFractionDigits: 2, 
            maximumFractionDigits: 2 
          });
          structuredPriceText.textContent = formattedNumber;
        }
      }

      // Always show widget regardless of item count
      widget.style.display = "block";

      // Apply font size adjustment after DOM updates
      setTimeout(() => {
        adjustPriceFontSize(settings);
      }, CONFIG.FONT_SIZE_ADJUSTMENT_DELAY);

    } catch (error) {
      console.error("[Sticky Cart] Update error:", error);
    }
  };

  const initStickyCart = async () => {
    try {
      console.log("[Sticky Cart] Starting initialization...");
      
      const settings = await fetchStickyCartSettings();
      console.log("[Sticky Cart] Settings fetched:", settings);

      if (!settings || !settings.enabled) {
        console.log("[Sticky Cart] Widget disabled or settings not found");
        return;
      }

      const cartData = await fetchCartData();
      console.log("[Sticky Cart] Cart data fetched:", cartData);

      console.log("[Sticky Cart] Initializing with:", {
        settings: settings.quantityBadgePosition,
        cartData: {
          item_count: cartData.item_count,
          total_price: cartData.total_price
        },
        isStructured: settings.quantityBadgePosition === "structured"
      });

      const existingWidget = document.getElementById(CONFIG.WIDGET_ID);
      if (existingWidget) {
        existingWidget.remove();
      }

      injectStyles(settings);

      const widgetHTML = createStickyCartHTML(settings, cartData);
      document.body.insertAdjacentHTML("beforeend", widgetHTML);

      const widget = document.getElementById(CONFIG.WIDGET_ID);
      if (widget) {
        widget.addEventListener("click", openCart);
      }

      // Apply font size adjustment after widget creation
      setTimeout(() => {
        adjustPriceFontSize(settings);
      }, 100);

      console.log("[Sticky Cart] Initialization complete");

    } catch (error) {
      console.error("[Sticky Cart] Initialization error:", error);
    }
  };

  const ready = (fn) => {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  };

  // Initialize everything
  ready(() => {
    console.log("[Sticky Cart] DOM ready");
    
    // Set up event listeners for cart updates
    document.addEventListener("cart:update", updateCartCount);
    document.addEventListener("cart:refresh", updateCartCount);

    // Intercept fetch requests to detect cart changes
    const originalFetch = window.fetch;
    window.fetch = function (...args) {
      const [url] = args;

      return originalFetch.apply(this, args).then((response) => {
        if (
          url.includes("/cart/add") ||
          url.includes("/cart/update") ||
          url.includes("/cart/change") ||
          url.includes("/cart/clear")
        ) {
          setTimeout(updateCartCount, 100);
        }
        return response;
      });
    };

    // Also listen for Shopify's built-in cart events
    window.addEventListener('shopify:cart:update', updateCartCount);
    
    // Listen for theme-specific cart events (common patterns)
    document.addEventListener('cart:changed', updateCartCount);
    document.addEventListener('cart:updated', updateCartCount);
    document.addEventListener('cart:item-added', updateCartCount);
    document.addEventListener('cart:item-removed', updateCartCount);

    // Initialize the sticky cart
    setTimeout(initStickyCart, 0);
  });

  // Reinitialize on Shopify section events
  window.addEventListener("shopify:section:load", initStickyCart);
  window.addEventListener("shopify:section:reorder", initStickyCart);
  
  // Handle window resize to recalculate font sizes
  let resizeTimeout;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(async () => {
      const settings = await fetchStickyCartSettings();
      if (settings) {
        adjustPriceFontSize(settings);
      }
    }, CONFIG.RESIZE_DEBOUNCE_DELAY);
  });

})();
