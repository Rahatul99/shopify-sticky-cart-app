(function () {
  "use strict";

  console.log("[Sticky Cart] script loaded");

  const getAppUrl = () => {
    if (window.stickyCartAppUrl) return window.stickyCartAppUrl;
    try {
      // Try to find the actual script element for sticky-cart.js even if loaded async
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
      // Fallback to the script origin if no explicit appUrl provided
      return appUrlParam || (url.origin ? url.origin : "");
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
          if (!url) {
            console.warn("[Sticky Cart] appUrl not found after wait");
          } else {
            console.log("[Sticky Cart] appUrl resolved:", url);
          }
          resolve(url || "");
        } else {
          setTimeout(tick, 50);
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
      return { item_count: 0 };
    }
  };

  const fetchStickyCartSettings = async () => {
    const shop = getShopDomain();
    try {
      const APP_URL = await waitForAppUrl();
      if (!APP_URL) {
        return getDefaultSettings();
      }
      const response = await fetch(
        `${APP_URL}/api/settings/${shop}?ts=${Date.now()}`,
        {
          cache: "no-store",
        },
      );
      const data = await response.json();
      return data.settings || data.defaultSettings;
    } catch (error) {
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
    showQuantityBadge: true,
    selectedIcon: "cart",
    deviceVisibility: "all",
    enableHoverAnimation: true,
    animationType: "bounce",
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

  const getIconHTML = (iconType, customIconUrl) => {
    const icons = {
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
    if (iconType === "custom" && customIconUrl) {
      return `<img src="${customIconUrl}" alt="cart" style="width:24px;height:24px;object-fit:contain;" />`;
    }
    return icons[iconType] || icons.cart;
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

  const createStickyCartHTML = (settings, cartData) => {
    const { item_count = 0, total_price = 0 } = cartData;
    const positionStyles = getPositionStyles(settings.cartPosition);
    const iconHTML = getIconHTML(settings.selectedIcon, settings.customIconUrl);
    const priceFormatted = (total_price / 100).toLocaleString(undefined, {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    });

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
          flex-direction: column;
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
          <div class="cart-price" style="
            margin-top: 4px;
            font-size: 12px;
            font-weight: 500;
            color: ${settings.iconColor};
            background: transparent;
          ">
            ${priceFormatted}
          </div>
        </div>
      </div>
    `;
  };

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

  const updateCartCount = async () => {
    const cartData = await fetchCartData();
    const quantityBadge = document.querySelector(
      "#sticky-cart-widget .quantity-badge",
    );
    const cartPrice = document.querySelector("#sticky-cart-widget .cart-price");

    if (quantityBadge && cartData.item_count > 0) {
      quantityBadge.textContent = cartData.item_count;
      quantityBadge.style.display = "flex";
    } else if (quantityBadge) {
      quantityBadge.style.display = cartData.item_count > 0 ? "flex" : "none";
    }

    if (cartPrice) {
      const priceFormatted = (cartData.total_price / 100).toLocaleString(
        undefined,
        {
          style: "currency",
          currency: "USD",
          minimumFractionDigits: 2,
        },
      );
      cartPrice.textContent = priceFormatted;
    }

    const widget = document.getElementById("sticky-cart-widget");
    if (widget) {
      widget.style.display = cartData.item_count > 0 ? "block" : "block";
    }
  };

  const initStickyCart = async () => {
    try {
      const settings = await fetchStickyCartSettings();

      if (!settings || !settings.enabled) {
        return;
      }

      const cartData = await fetchCartData();

      const existingWidget = document.getElementById("sticky-cart-widget");
      if (existingWidget) {
        existingWidget.remove();
      }

      injectStyles(settings);

      const widgetHTML = createStickyCartHTML(settings, cartData);
      document.body.insertAdjacentHTML("beforeend", widgetHTML);

      const widget = document.getElementById("sticky-cart-widget");
      if (widget) {
        widget.addEventListener("click", openCart);
      }

      document.addEventListener("cart:update", updateCartCount);
      document.addEventListener("cart:refresh", updateCartCount);

      const originalFetch = window.fetch;
      window.fetch = function (...args) {
        const [url] = args;

        return originalFetch.apply(this, args).then((response) => {
          if (
            url.includes("/cart/add") ||
            url.includes("/cart/update") ||
            url.includes("/cart/change")
          ) {
            setTimeout(updateCartCount, 100);
          }
          return response;
        });
      };
    } catch (error) {}
  };

  const ready = (fn) => {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  };

  ready(() => {
    console.log("[Sticky Cart] DOM ready");
    setTimeout(initStickyCart, 100);
  });

  window.addEventListener("shopify:section:load", initStickyCart);
  window.addEventListener("shopify:section:reorder", initStickyCart);
})();


