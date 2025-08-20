import { authenticate } from "../shopify.server";
import db from "../db.server";

export const action = async ({ request }) => {
  const { shop, session, topic, admin } = await authenticate.webhook(request);

  console.log(`Received ${topic} webhook for ${shop}`);

  // Try to delete our ScriptTag (best-effort)
  try {
    const appUrl = process.env.SHOPIFY_APP_URL || "";
    if (admin && appUrl) {
      const src = `${appUrl}/sticky-cart.js?appUrl=${encodeURIComponent(appUrl)}`;
      const getExistingQuery = `#graphql\n        query GetScriptTags($first: Int!, $src: URL) {\n          scriptTags(first: $first, src: $src) {\n            nodes { id }\n          }\n        }`;
      const existingResp = await admin.graphql(getExistingQuery, {
        variables: { first: 1, src },
      });
      const existingJson = await existingResp.json();
      const existingId = existingJson?.data?.scriptTags?.nodes?.[0]?.id;
      if (existingId) {
        const deleteMutation = `#graphql\n          mutation ScriptTagDelete($id: ID!) {\n            scriptTagDelete(id: $id) {\n              deletedScriptTagId\n              userErrors { field message }\n            }\n          }`;
        const deleteResp = await admin.graphql(deleteMutation, {
          variables: { id: existingId },
        });
        await deleteResp.json();
      }
    }
  } catch (e) {
    console.warn("Failed to remove ScriptTag on uninstall", e);
  }

  // Webhook requests can trigger multiple times and after an app has already been uninstalled.
  if (session) {
    await db.session.deleteMany({ where: { shop } });
  }

  return new Response();
};
