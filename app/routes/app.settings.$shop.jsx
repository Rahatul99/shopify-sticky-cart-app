import { json } from "@remix-run/node";
import { getStickyCartSettingsByDomain } from "../models/settings.server";

export const loader = async ({ params }) => {
  const { shop } = params;

  if (!shop) {
    return json({ error: "Shop parameter is required" }, { status: 400 });
  }

  try {
    // Remove .myshopify.com if present and add it back
    const shopDomain = shop.includes(".myshopify.com")
      ? shop
      : `${shop}.myshopify.com`;

    const settings = await getStickyCartSettingsByDomain(shopDomain);

    if (!settings) {
      return json(
        {
          error: "Settings not found",
          defaultSettings: {
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
          },
        },
        { status: 404 },
      );
    }

    return json(
      { settings },
      {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      },
    );
  } catch (error) {
    console.error("Error fetching settings:", error);
    return json({ error: "Internal server error" }, { status: 500 });
  }
};

// Handle preflight OPTIONS request
export const options = () => {
  return new Response(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
};
