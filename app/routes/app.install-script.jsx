import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { Page, Layout, Card, Text, TextField, BlockStack } from "@shopify/polaris";
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
    <Page title="Storefront script installation">
      <Layout>
        <Layout.Section>
          <Card title="Status" sectioned>
            <BlockStack gap="200">
              <Text as="p">
                The storefront script is automatically installed via the Shopify ScriptTag API when you open the app. It will be removed automatically when the app is uninstalled.
              </Text>
              <Text as="p" color="subdued">
                No theme changes are required.
              </Text>
            </BlockStack>
          </Card>
        </Layout.Section>

        <Layout.Section>
          <Card title="App base URL" sectioned>
            <BlockStack>
              <Text as="p">Your app base URL:</Text>
              <div style={{ display: "flex", gap: 8 }}>
                <div style={{ flex: 1 }}>
                  <TextField label="" labelHidden value={appUrl} readOnly autoComplete="off" />
                </div>
                <button className="Polaris-Button" onClick={handleCopy}>
                  <span className="Polaris-Button__Content">{copied ? "Copied" : "Copy"}</span>
                </button>
              </div>
            </BlockStack>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}


