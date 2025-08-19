import { json } from "@remix-run/node";
import { getStickyCartSettingsByDomain } from "../models/settings.server";

export async function loader({ request }) {
  const url = new URL(request.url);
  const shop = url.searchParams.get("shop");

  if (!shop) {
    return json({ error: "Shop parameter required" }, { status: 400 });
  }

  const shopDomain = shop.includes(".myshopify.com") ? shop : `${shop}.myshopify.com`;
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
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
          "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
          Pragma: "no-cache",
        },
      },
    );
  }

  return json(
    { settings },
    {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
        "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
        Pragma: "no-cache",
      },
    },
  );
}
