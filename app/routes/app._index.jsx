import { json } from "@remix-run/node";
import {
  useLoaderData,
  useNavigation,
  useActionData,
  Form,
} from "@remix-run/react";
import {
  Page,
  Layout,
  Card,
  Text,
  Banner,
  Frame,
  Toast,
  PageActions,
  Grid,
  BlockStack,
  useBreakpoints,
  Box,
} from "@shopify/polaris";
import { useState, useCallback, useEffect, useMemo } from "react";
import { authenticate } from "../shopify.server";
import {
  createOrUpdateStickyCartSettings,
  createShop,
  getShop,
} from "../models/settings.server";
import StickyCartPreview from "../components/StickyCartPreview";
import { DEFAULT_SETTINGS } from "../utils/data";
import {
  normalizeForComparison,
  parseFormDataSettings,
} from "../utils/utilsFunction";
import { useFileUpload } from "../hooks/useFileUpload";
import { GeneralSettings } from "../components/GeneralSettings";
import { LayoutTypeSettings } from "../components/LayoutTypeSettings";
import { AppearanceSettings } from "../components/AppearanceSettings";
import { QuantityBadgeSettings } from "../components/QuantityBadgeSettings";
import { StructuredLayoutSettings } from "../components/StructuredLayoutSettings";
import { PricingDisplaySettings } from "../components/PricingDisplaySettings";
import { IconAnimationSettings } from "../components/IconAnimationSettings";
import { CustomCSSSettings } from "../components/CustomCSSSettings";

export const loader = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  const { shop: shopDomain } = session;

  let shop = await getShop(shopDomain);
  if (!shop) {
    shop = await createShop(shopDomain);
  }

  return json({
    shop,
    settings: shop.stickyCartSettings || DEFAULT_SETTINGS,
  });
};

export const action = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  const { shop: shopDomain } = session;

  let shop = await getShop(shopDomain);
  if (!shop) {
    shop = await createShop(shopDomain);
  }

  const formData = await request.formData();
  const settings = parseFormDataSettings(formData);

  await createOrUpdateStickyCartSettings(shop.id, settings);
  return json({ success: true, message: "Settings saved successfully!" });
};

const Index = () => {
  const { settings } = useLoaderData();
  const actionData = useActionData();
  const navigation = useNavigation();
  const isLoading = navigation.state === "submitting";
  const { mdUp } = useBreakpoints();

  const [formSettings, setFormSettings] = useState(settings);
  const [showToast, setShowToast] = useState(false);
  const [, setUploadedFile] = useState(null);

  const fileUploadProps = useFileUpload(setFormSettings, setUploadedFile);

  useEffect(() => {
    if (actionData?.success) {
      setShowToast(true);
    }
  }, [actionData]);

  useEffect(() => {
    if (settings) {
      setFormSettings(settings);
    }
  }, [settings]);

  const handleSettingChange = useCallback((field, value) => {
    setFormSettings((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleReset = useCallback(() => {
    setFormSettings(settings);
  }, [settings]);

  const isDirty = useMemo(
    () =>
      JSON.stringify(normalizeForComparison(formSettings)) !==
      JSON.stringify(normalizeForComparison(settings)),
    [formSettings, settings],
  );

  const isFormValid = useMemo(() => {
    if (formSettings.selectedIcon === "custom") {
      return !!formSettings.uploadedIconData;
    }
    return true;
  }, [formSettings.selectedIcon, formSettings.uploadedIconData]);

  const previewBoxStyle = useMemo(
    () => ({
      ...(mdUp && {
        position: "sticky",
        top: "20px",
        zIndex: 1,
      }),
      ...(!mdUp && {
        position: "relative",
        marginBottom: "20px",
      }),
    }),
    [mdUp],
  );

  const renderHiddenFields = () =>
    Object.entries(formSettings).map(([key, value]) => {
      let displayValue = value;
      if (typeof value === "boolean") {
        displayValue = value.toString();
      } else if (value === null || value === undefined) {
        displayValue = "";
      }
      return <input key={key} type="hidden" name={key} value={displayValue} />;
    });

  return (
    <Frame>
      <Page
        title="Customize your Sticky Cart"
        subtitle="Design and configure your sticky cart to match your store's branding."
      >
        <Layout>
          <Layout.Section secondary>
            <Banner
              title="Changes may take a few minutes to appear"
              status="info"
            >
              <Text as="p">
                Updates to your sticky cart might not show up right away. Please
                allow up to five minutes, as caching is used to keep your
                storefront loading quickly.
              </Text>
            </Banner>
          </Layout.Section>

          <Layout.Section secondary>
            <Form method="post">
              <Grid
                columns={{ xs: 1, md: 2, lg: 2 }}
                gap={{ xs: "400", md: "500" }}
              >
                <Grid.Cell
                  columnSpan={{ xs: 1, md: 1 }}
                  order={{ xs: 2, md: 1 }}
                >
                  <Box as="div" style={previewBoxStyle}>
                    <Card sectioned>
                      <StickyCartPreview formSettings={formSettings} />
                    </Card>
                  </Box>
                  <Box as="div" style={{ height: mdUp ? "200px" : "0px" }} />
                </Grid.Cell>

                <Grid.Cell
                  columnSpan={{ xs: 1, md: 1 }}
                  order={{ xs: 1, md: 2 }}
                >
                  <BlockStack gap={{ xs: "400", md: "500" }}>
                    <GeneralSettings
                      formSettings={formSettings}
                      handleSettingChange={handleSettingChange}
                    />
                    <LayoutTypeSettings
                      formSettings={formSettings}
                      handleSettingChange={handleSettingChange}
                    />
                    <AppearanceSettings
                      formSettings={formSettings}
                      handleSettingChange={handleSettingChange}
                    />
                    <QuantityBadgeSettings
                      formSettings={formSettings}
                      handleSettingChange={handleSettingChange}
                    />
                    <StructuredLayoutSettings
                      formSettings={formSettings}
                      handleSettingChange={handleSettingChange}
                    />
                    <PricingDisplaySettings
                      formSettings={formSettings}
                      handleSettingChange={handleSettingChange}
                    />
                    <IconAnimationSettings
                      formSettings={formSettings}
                      handleSettingChange={handleSettingChange}
                      fileUploadProps={fileUploadProps}
                    />
                    <CustomCSSSettings
                      formSettings={formSettings}
                      handleSettingChange={handleSettingChange}
                    />
                  </BlockStack>
                </Grid.Cell>
              </Grid>

              <PageActions
                primaryAction={{
                  content: "Save settings",
                  submit: true,
                  loading: isLoading,
                  disabled: !isDirty || isLoading || !isFormValid,
                }}
                secondaryActions={[
                  {
                    content: "Reset",
                    onAction: handleReset,
                    disabled: !isDirty,
                  },
                ]}
              />

              {/* Hidden form fields */}
              {renderHiddenFields()}
            </Form>
          </Layout.Section>
        </Layout>

        {showToast && (
          <Toast
            content="Settings saved successfully!"
            duration={3000}
            onDismiss={() => setShowToast(false)}
          />
        )}
      </Page>
    </Frame>
  );
};

export default Index;
