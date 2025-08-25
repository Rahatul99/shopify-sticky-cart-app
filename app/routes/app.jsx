import { Link, Outlet, useLoaderData, useRouteError } from "@remix-run/react";
import { boundary } from "@shopify/shopify-app-remix/server";
import { AppProvider } from "@shopify/shopify-app-remix/react";
import { NavMenu } from "@shopify/app-bridge-react";
import polarisStyles from "@shopify/polaris/build/esm/styles.css?url";
import { authenticate } from "../shopify.server";

export const links = () => [{ rel: "stylesheet", href: polarisStyles }];

// Stable build/version identifier to cache-bust the ScriptTag src without recreating it on every request
const BUILD_ID =
  process.env.APP_BUILD_ID ||
  process.env.VERCEL_GIT_COMMIT_SHA ||
  process.env.RENDER_GIT_COMMIT ||
  process.env.FLY_ALLOC_ID ||
  process.env.HEROKU_RELEASE_VERSION ||
  process.env.APP_VERSION ||
  "dev";

export const loader = async ({ request }) => {
  const { admin } = await authenticate.admin(request);

  // Ensure storefront ScriptTag exists (idempotent)
  try {
    const appUrl = process.env.SHOPIFY_APP_URL || "";
    if (appUrl) {
      const src = `${appUrl}/sticky-cart.js?appUrl=${encodeURIComponent(
        appUrl,
      )}&v=${encodeURIComponent(BUILD_ID)}`;

      // Fetch existing script tags and ensure only the latest (exact src) remains
      const listQuery = `#graphql\n        query GetScriptTags($first: Int!) {\n          scriptTags(first: $first) {\n            nodes { id src displayScope }\n          }\n        }`;

      const listResp = await admin.graphql(listQuery, {
        variables: { first: 25 },
      });
      const listJson = await listResp.json();
      const nodes = listJson?.data?.scriptTags?.nodes || [];

      const urlHost = new URL(appUrl).host;
      const exact = nodes.find((n) => n.src === src);
      const stale = nodes.filter((n) => {
        try {
          const u = new URL(n.src);
          return (
            u.host === urlHost &&
            u.pathname.endsWith("/sticky-cart.js") &&
            n.src !== src
          );
        } catch (_) {
          return false;
        }
      });

      if (!exact) {
        // Remove stale tags that point to the same host/path but different query/version
        if (stale.length > 0) {
          const deleteMutation = `#graphql\n            mutation ScriptTagDelete($id: ID!) {\n              scriptTagDelete(id: $id) {\n                deletedScriptTagId\n                userErrors { field message }\n              }\n            }`;
          for (const s of stale) {
            try {
              const delResp = await admin.graphql(deleteMutation, {
                variables: { id: s.id },
              });
              await delResp.json();
            } catch (_) {}
          }
        }

        const createMutation = `#graphql\n          mutation ScriptTagCreate($input: ScriptTagInput!) {\n            scriptTagCreate(input: $input) {\n              scriptTag { id src displayScope }\n              userErrors { field message }\n            }\n          }`;

        const createResp = await admin.graphql(createMutation, {
          variables: {
            input: {
              src,
              displayScope: "ONLINE_STORE",
              cache: false, //TODO: In the production it should be true
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
