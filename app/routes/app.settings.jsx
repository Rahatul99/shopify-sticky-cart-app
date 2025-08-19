import { json } from "@remix-run/node";
import { getSettings } from "../models/settings.server";

export async function loader({ request }) {
  const url = new URL(request.url);
  const shop = url.searchParams.get("shop");

  if (!shop) {
    return json({ error: "Shop parameter required" }, { status: 400 });
  }

  const settings = await getSettings(shop);

  return json(
    { settings },
    {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json",
      },
    },
  );
}
