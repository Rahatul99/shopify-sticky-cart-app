(function () {
  "use strict";

  // Resolve app URL dynamically to avoid race conditions with Liquid config
  const getAppUrl = () => {
    if (window.stickyCartAppUrl) return window.stickyCartAppUrl;
    try {
      const currentScript = document.currentScript || (function() {
        const scripts = document.getElementsByTagName('script');
        return scripts[scripts.length - 1];
      })();
      if (!currentScript || !currentScript.src) return "";
      const url = new URL(currentScript.src);
      const appUrlParam = url.searchParams.get("appUrl");
      return appUrlParam || "";
    } catch (_) {
      return "";
    }
  };
  const waitForAppUrl = async (timeoutMs = 2000) => {
    const start = Date.now();
    return new Promise((resolve) => {
      const tick = () => {
        const url = getAppUrl();
        if (url || Date.now() - start > timeoutMs) {
          resolve(url || "");
        } else {
          setTimeout(tick, 50);
        }
      };
      tick();
    });
  };

  // Get shop domain
  const getShopDomain = () => {
    return (
      window.stickyCartShop || // set in sticky-cart.liquid to permanent_domain (myshopify.com)
      window.Shopify?.shop ||
      window.location.hostname
    );
  };

  // Fetch cart data
  const fetchCartData = async () => {
    try {
      const response = await fetch("/cart.js");
      return await response.json();
    } catch (error) {
      console.error("Error fetching cart data:", error);
      return { item_count: 0 };
    }
  };

  // Fetch sticky cart settings
  const fetchStickyCartSettings = async () => {
    const shop = getShopDomain();
    try {
      const APP_URL = await waitForAppUrl();
      if (!APP_URL) {
        // Fallback to defaults if app URL isn't configured
        return getDefaultSettings();
      }
      const response = await fetch(`${APP_URL}/api/settings/${shop}?ts=${Date.now()}`, {
        cache: "no-store",
        headers: {
          "Cache-Control": "no-store",
        },
      });
      const data = await response.json();
      return data.settings || data.defaultSettings;
    } catch (error) {
      console.error("Error fetching sticky cart settings:", error);
      // Fallback to defaults if fetching fails
      return getDefaultSettings();
    }
  };

  // Default settings fallback
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
    showQuantityBadge: true,
    selectedIcon: "cart",
    deviceVisibility: "all",
    enableHoverAnimation: true,
    animationType: "bounce",
  });

  // Get position styles
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

  // Get icon HTML
  const getIconHTML = (iconType, customIconUrl) => {
    const icons = {
      cart: `<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
        <path d="M7 18c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12L8.1 13h7.45c.75 0 1.41-.41 1.75-1.03L21.7 4H5.21l-.94-2H1zm16 16c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
      </svg>`,
      bag: `<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
        <path d="M19 7h-3V6a4 4 0 0 0-8 0v1H5a1 1 0 0 0-1 1v11a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V8a1 1 0 0 0-1-1zM10 6a2 2 0 0 1 4 0v1h-4V6zm8 15a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V9h2v1a1 1 0 0 0 2 0V9h4v1a1 1 0 0 0 2 0V9h2v12z"/>
      </svg>`,
      basket: `<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
        <path d="M17.21 9l-4.38-6.56a.993.993 0 0 0-.83-.42c-.32 0-.64.14-.83.43L6.79 9H2c-.55 0-1 .45-1 1 0 .09.01.18.04.27l2.54 9.27c.23.84 1 1.46 1.92 1.46h13c.92 0 1.69-.62 1.93-1.46l2.54-9.27c.03-.09.04-.18.04-.27 0-.55-.45-1-1-1h-4.79zM9 9l3-4.4L15 9H9zm3 8c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z"/>
      </svg>`,
    };
    if (iconType === "custom" && customIconUrl) {
      return `<img src="${customIconUrl}" alt="cart" style="width:24px;height:24px;object-fit:contain;" />`;
    }
    return icons[iconType] || icons.cart;
  };

  // Get device visibility CSS
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

  // Get animation CSS
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

  // Create sticky cart HTML
  const createStickyCartHTML = (settings, cartData) => {
    const { item_count = 0 } = cartData;
    const positionStyles = getPositionStyles(settings.cartPosition);
    const iconHTML = getIconHTML(settings.selectedIcon, settings.customIconUrl);

    return `
      <div id="sticky-cart-widget" style="
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
          border-radius: ${settings.buttonRadius}%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: ${settings.iconColor};
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
          position: relative;
        ">
          ${iconHTML}
          ${
            settings.showQuantityBadge
              ? `
            <div class="quantity-badge" style="
              position: absolute;
              top: -5px;
              right: -5px;
              background-color: ${settings.quantityBackgroundColor};
              color: ${settings.quantityTextColor};
              border-radius: 50%;
              width: 24px;
              height: 24px;
              display: ${item_count > 0 ? "flex" : "none"};
              align-items: center;
              justify-content: center;
              font-size: 12px;
              font-weight: bold;
              font-family: system-ui, -apple-system, sans-serif;
            ">
              ${item_count}
            </div>
          `
              : ""
          }
        </div>
      </div>
    `;
  };

  // Create and inject styles
  const injectStyles = (settings) => {
    const styleId = "sticky-cart-styles";
    let existingStyle = document.getElementById(styleId);

    if (existingStyle) {
      existingStyle.remove();
    }

    const style = document.createElement("style");
    style.id = styleId;
    style.textContent = `
      ${getDeviceVisibilityCSS(settings.deviceVisibility)}
      ${getAnimationCSS(settings.animationType, settings.enableHoverAnimation)}
      
      #sticky-cart-widget:hover .sticky-cart-button {
        transform: scale(1.05);
        box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
      }
      
      .sticky-cart-button svg {
        width: 24px;
        height: 24px;
      }
    `;

    document.head.appendChild(style);
  };

  // Open cart drawer/page
  const openCart = () => {
    // Try to trigger existing cart drawer first
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

    // Fallback: redirect to cart page
    window.location.href = "/cart";
  };

  // Update cart count
  const updateCartCount = async () => {
    const cartData = await fetchCartData();
    const quantityBadge = document.querySelector(
      "#sticky-cart-widget .quantity-badge",
    );

    if (quantityBadge && cartData.item_count > 0) {
      quantityBadge.textContent = cartData.item_count;
      quantityBadge.style.display = "flex";
    } else if (quantityBadge) {
      quantityBadge.style.display = cartData.item_count > 0 ? "flex" : "none";
    }

    // Hide/show widget based on cart count if needed
    const widget = document.getElementById("sticky-cart-widget");
    if (widget) {
      widget.style.display = cartData.item_count > 0 ? "block" : "block"; // Always show, change as needed
    }
  };

  // Initialize sticky cart
  const initStickyCart = async () => {
    try {
      const settings = await fetchStickyCartSettings();

      if (!settings || !settings.enabled) {
        return;
      }

      const cartData = await fetchCartData();

      // Remove existing widget
      const existingWidget = document.getElementById("sticky-cart-widget");
      if (existingWidget) {
        existingWidget.remove();
      }

      // Inject styles
      injectStyles(settings);

      // Create and append widget
      const widgetHTML = createStickyCartHTML(settings, cartData);
      document.body.insertAdjacentHTML("beforeend", widgetHTML);

      // Add click event
      const widget = document.getElementById("sticky-cart-widget");
      if (widget) {
        widget.addEventListener("click", openCart);
      }

      // Listen for cart updates
      document.addEventListener("cart:update", updateCartCount);
      document.addEventListener("cart:refresh", updateCartCount);

      // Listen for fetch interceptor (for AJAX cart updates)
      const originalFetch = window.fetch;
      window.fetch = function (...args) {
        const [url] = args;

        return originalFetch.apply(this, args).then((response) => {
          if (
            url.includes("/cart/add") ||
            url.includes("/cart/update") ||
            url.includes("/cart/change")
          ) {
            setTimeout(updateCartCount, 100); // Small delay to ensure cart is updated
          }
          return response;
        });
      };
    } catch (error) {
      console.error("Error initializing sticky cart:", error);
    }
  };

  // Wait for DOM to be ready
  const ready = (fn) => {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  };

  // Initialize when ready
  ready(() => {
    // Small delay to ensure Shopify object is available
    setTimeout(initStickyCart, 100);
  });

  // Re-initialize on page changes (for SPA-like themes)
  window.addEventListener("shopify:section:load", initStickyCart);
  window.addEventListener("shopify:section:reorder", initStickyCart);
})();
