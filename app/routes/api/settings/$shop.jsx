// app/routes/api/settings/[shop].jsx
import { json } from "@remix-run/node";

export async function loader({ params }) {
  const { shop } = params; // Access the shop parameter (e.g., "rahatnaturenest.myshopify.com")
  // Your logic to handle the settings for the shop
  return json({ shop, settings: {} });
}
