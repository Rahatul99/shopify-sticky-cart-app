import { json } from "@remix-run/node";
import { getStickyCartSettingsByDomain } from "../models/settings.server";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  Vary: "Origin",
};

export const loader = async ({ params }) => {
  const { shop } = params;

  if (!shop) {
    return json(
      { error: "Shop parameter is required" },
      { status: 400, headers: corsHeaders },
    );
  }

  try {
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
        {
          status: 404,
          headers: corsHeaders,
        },
      );
    }

    return json(
      { settings },
      {
        headers: {
          ...corsHeaders,
          "Cache-Control": "public, max-age=300, stale-while-revalidate=60",
        },
      },
    );
  } catch (error) {
    console.error("Error fetching settings:", error);
    return json(
      { error: "Internal server error" },
      { status: 500, headers: corsHeaders },
    );
  }
};

export const action = async ({ request }) => {
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }
  return new Response("Method Not Allowed", {
    status: 405,
    headers: corsHeaders,
  });
};
