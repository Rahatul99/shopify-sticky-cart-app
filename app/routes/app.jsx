import { Link, Outlet, useLoaderData, useRouteError } from "@remix-run/react";
import { boundary } from "@shopify/shopify-app-remix/server";
import { AppProvider } from "@shopify/shopify-app-remix/react";
import { NavMenu } from "@shopify/app-bridge-react";
import polarisStyles from "@shopify/polaris/build/esm/styles.css?url";
import { authenticate } from "../shopify.server";

export const links = () => [{ rel: "stylesheet", href: polarisStyles }];

export const loader = async ({ request }) => {
  const { admin } = await authenticate.admin(request);

  // Ensure storefront ScriptTag exists (idempotent)
  try {
    const appUrl = process.env.SHOPIFY_APP_URL || "";
    if (appUrl) {
      const src = `${appUrl}/sticky-cart.js?appUrl=${encodeURIComponent(appUrl)}`;

      const getExistingQuery = `#graphql\n        query GetScriptTags($first: Int!, $src: URL) {\n          scriptTags(first: $first, src: $src) {\n            nodes { id }\n          }\n        }`;

      const existingResp = await admin.graphql(getExistingQuery, {
        variables: { first: 1, src },
      });
      const existingJson = await existingResp.json();
      const alreadyExists =
        existingJson?.data?.scriptTags?.nodes &&
        existingJson.data.scriptTags.nodes.length > 0;

      if (!alreadyExists) {
        const createMutation = `#graphql\n          mutation ScriptTagCreate($input: ScriptTagInput!) {\n            scriptTagCreate(input: $input) {\n              scriptTag { id src displayScope }\n              userErrors { field message }\n            }\n          }`;

        const createResp = await admin.graphql(createMutation, {
          variables: {
            input: {
              src,
              displayScope: "ONLINE_STORE",
              cache: true,
            },
          },
        });
        await createResp.json();
      }
    }
  } catch (_) {}

  return { apiKey: process.env.SHOPIFY_API_KEY || "" };
};

export default function App() {
  const { apiKey } = useLoaderData();

  return (
    <AppProvider isEmbeddedApp apiKey={apiKey}>
      <NavMenu>
        <Link to="/app" rel="home">
          Home
        </Link>
        <Link to="/app/install-script">Install Script</Link>
      </NavMenu>
      <Outlet />
    </AppProvider>
  );
}

// Shopify needs Remix to catch some thrown responses, so that their headers are included in the response.
export function ErrorBoundary() {
  return boundary.error(useRouteError());
}

export const headers = (headersArgs) => {
  return boundary.headers(headersArgs);
};
