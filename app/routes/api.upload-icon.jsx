import { json } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import {
  createOrUpdateStickyCartSettings,
  getShop,
} from "../models/settings.server";

export const action = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  const { shop: shopDomain } = session;

  if (request.method !== "POST") {
    return json({ error: "Method not allowed" }, { status: 405 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("icon");
    // const shopId = formData.get("shopId");

    if (!file || !(file instanceof File)) {
      return json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = [
      "image/png",
      "image/jpeg",
      "image/jpg",
      "image/svg+xml",
      "image/gif",
    ];
    if (!allowedTypes.includes(file.type)) {
      return json(
        {
          error:
            "Invalid file type. Please upload PNG, JPEG, SVG, or GIF images only.",
        },
        { status: 400 },
      );
    }

    // Validate file size (max 2MB)
    const maxSize = 2 * 1024 * 1024; // 2MB
    if (file.size > maxSize) {
      return json(
        {
          error: "File too large. Please upload images smaller than 2MB.",
        },
        { status: 400 },
      );
    }

    // Convert file to base64
    const arrayBuffer = await file.arrayBuffer();
    const base64String = Buffer.from(arrayBuffer).toString("base64");
    const dataUrl = `data:${file.type};base64,${base64String}`;

    // Get or create shop
    let shop = await getShop(shopDomain);
    if (!shop) {
      return json({ error: "Shop not found" }, { status: 404 });
    }

    // Get current settings
    const currentSettings = shop.stickyCartSettings || {};

    // Update settings with uploaded icon
    const updatedSettings = {
      ...currentSettings,
      selectedIcon: "custom",
      uploadedIconData: dataUrl,
      uploadedIconType: file.type,
    };

    await createOrUpdateStickyCartSettings(shop.id, updatedSettings);

    return json({
      success: true,
      message: "Icon uploaded successfully",
      iconData: dataUrl,
      iconType: file.type,
    });
  } catch (error) {
    console.error("Error uploading icon:", error);
    return json({ error: "Internal server error" }, { status: 500 });
  }
};

export const loader = () => {
  return json({ error: "Method not allowed" }, { status: 405 });
};
