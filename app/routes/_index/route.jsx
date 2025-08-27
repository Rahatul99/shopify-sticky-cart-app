import { redirect } from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";
import { useState } from "react";
import {
  Page,
  Text,
  BlockStack,
  InlineStack,
  TextField,
  Button,
  Box,
  Icon,
} from "@shopify/polaris";
import { CheckIcon } from "@shopify/polaris-icons";
import { login } from "../../shopify.server";

export const loader = async ({ request }) => {
  const url = new URL(request.url);

  if (url.searchParams.get("shop")) {
    throw redirect(`/app?${url.searchParams.toString()}`);
  }

  return { showForm: Boolean(login) };
};

const App = () => {
  const { showForm } = useLoaderData();
  const [shopDomain, setShopDomain] = useState("");

  return (
    <Page>
      <Box
        minHeight="100vh"
        display="flex"
        alignItems="center"
        justifyContent="center"
        padding="500"
      >
        <Box maxWidth="800" width="100%">
          <BlockStack gap="400">
            <BlockStack gap="200" align="center">
              <Text as="h1" variant="headingLg" alignment="center">
                Sticky Cart for Shopify
              </Text>
              <Text as="p" variant="bodyMd" tone="subdued" alignment="center">
                Add a persistent cart button that reduces friction and helps
                shoppers check out faster.
              </Text>
            </BlockStack>

            {showForm && (
              <Form method="post" action="/auth/login">
                <InlineStack gap="300" align="center" blockAlign="center">
                  <Box maxWidth="360" width="100%">
                    <TextField
                      label="Shop domain"
                      name="shop"
                      value={shopDomain}
                      onChange={setShopDomain}
                      placeholder="my-shop-domain.myshopify.com"
                      helpText="Enter your exact Shopify shop domain"
                      autoComplete="off"
                    />
                  </Box>
                  <Button submit variant="primary">
                    Connect store
                  </Button>
                </InlineStack>
              </Form>
            )}

            <InlineStack gap="400" align="center" wrap>
              <InlineStack gap="150" align="center">
                <Icon source={CheckIcon} tone="success" />
                <Text as="span" variant="bodyMd">
                  One‑click access to cart from every page
                </Text>
              </InlineStack>
              <InlineStack gap="150" align="center">
                <Icon source={CheckIcon} tone="success" />
                <Text as="span" variant="bodyMd">
                  Matches your theme • Position and style are fully customizable
                </Text>
              </InlineStack>
              <InlineStack gap="150" align="center">
                <Icon source={CheckIcon} tone="success" />
                <Text as="span" variant="bodyMd">
                  Lightweight script with analytics to track impact
                </Text>
              </InlineStack>
            </InlineStack>
          </BlockStack>
        </Box>
      </Box>
    </Page>
  );
};

export default App;
