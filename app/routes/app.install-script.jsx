import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { Page, Layout, Card, Text, Button, ButtonGroup, TextField, BlockStack } from "@shopify/polaris";
import { useState, useCallback } from "react";
import { authenticate } from "../shopify.server";

export const loader = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  const shopDomain = session.shop;
  const shopHandle = shopDomain.replace(".myshopify.com", "");
  const themeEditorUrl = `https://admin.shopify.com/store/${shopHandle}/themes/current/editor?context=apps`;
  return json({ shopDomain, themeEditorUrl, appUrl: process.env.SHOPIFY_APP_URL || "" });
};

export default function InstallScript() {
  const { themeEditorUrl, appUrl, shopDomain } = useLoaderData();
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(appUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  }, [appUrl]);

  return (
    <Page title="Install on your storefront">
      <Layout>
        <Layout.Section>
          <Card sectioned>
            <BlockStack gap="200">
              <Text variant="headingMd" as="h2">Recommended: Theme app block</Text>
              <Text as="p" color="subdued">
                This app renders on your storefront via a Theme App Extension. Add the block to your theme and set your app URL.
              </Text>
              <ButtonGroup>
                <Button url={themeEditorUrl} external primary>Open theme editor</Button>
                <Button url={`https://${shopDomain}`} external>View storefront</Button>
              </ButtonGroup>
            </BlockStack>
          </Card>
        </Layout.Section>

        <Layout.Section>
          <Card title="Step 1 — Add the block" sectioned>
            <Text as="p">
              In the theme editor, add the block "Sticky Cart" to the <Text as="span" variant="bodySm" fontWeight="semibold">Theme app embeds</Text> or <Text as="span" variant="bodySm" fontWeight="semibold">App blocks</Text> section and enable it.
            </Text>
          </Card>
          <Card title="Step 2 — Set the App base URL" sectioned>
            <BlockStack>
              <Text as="p">Paste this into the block setting "App base URL":</Text>
              <div style={{ display: "flex", gap: 8 }}>
                <div style={{ flex: 1 }}>
                  <TextField label="" labelHidden value={appUrl} readOnly autoComplete="off" />
                </div>
                <Button onClick={handleCopy}>{copied ? "Copied" : "Copy"}</Button>
              </div>
              <Text as="p" color="subdued">Example: https://your-app-domain</Text>
            </BlockStack>
          </Card>
          <Card title="Step 3 — Save and test" sectioned>
            <Text as="p">Save the theme changes, refresh your storefront, and add an item to the cart to see the badge update.</Text>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}


