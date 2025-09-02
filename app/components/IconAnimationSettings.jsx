import {
  Banner,
  BlockStack,
  Button,
  Card,
  Checkbox,
  FormLayout,
  RangeSlider,
  Select,
  Text,
  Thumbnail,
} from "@shopify/polaris";
import { OPTIONS } from "../utils/data";

const IconAnimationSettings = ({
  formSettings,
  handleSettingChange,
  fileUploadProps,
}) => {
  const { isUploading, uploadError, handleFileSelect, handleRemoveIcon } =
    fileUploadProps;

  return (
    <Card sectioned title="Icon & Animation">
      <FormLayout>
        <Select
          label="Icon type"
          options={OPTIONS.icon}
          value={formSettings.selectedIcon}
          onChange={(value) => handleSettingChange("selectedIcon", value)}
          helpText="Choose a built-in icon or upload your own image."
        />

        {formSettings.selectedIcon === "custom" && (
          <BlockStack gap={{ xs: "400", sm: "400", md: "500" }}>
            <div>
              <Text variant="bodyMd" as="p" fontWeight="medium">
                Upload Icon
              </Text>
              <div style={{ marginTop: "12px" }}>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  style={{ display: "none" }}
                  id="icon-upload"
                />
                <Button
                  onClick={() => document.getElementById("icon-upload").click()}
                  disabled={isUploading}
                  loading={isUploading}
                >
                  {isUploading ? "Uploading..." : "Choose File"}
                </Button>
                <Text
                  variant="bodySm"
                  as="p"
                  tone="subdued"
                  style={{ marginTop: "6px" }}
                >
                  Supported: PNG, JPEG, SVG, GIF (max 2MB)
                </Text>
              </div>
            </div>

            {formSettings.uploadedIconData && (
              <div
                style={{
                  border: "1px solid #e1e3e5",
                  borderRadius: "8px",
                  padding: "12px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  background: "#fafafa",
                }}
              >
                <div
                  style={{ display: "flex", alignItems: "center", gap: "10px" }}
                >
                  <Thumbnail
                    source={formSettings.uploadedIconData}
                    alt="Uploaded icon"
                    size="medium"
                  />
                  <Text variant="bodyMd" as="p">
                    Uploaded icon
                  </Text>
                </div>
                <Button
                  onClick={handleRemoveIcon}
                  variant="plain"
                  tone="critical"
                  size="slim"
                >
                  Remove
                </Button>
              </div>
            )}

            {uploadError && (
              <Banner status="critical" title="Upload Error">
                <p>{uploadError}</p>
              </Banner>
            )}

            <div>
              <Text variant="bodyMd" as="p" fontWeight="medium">
                Custom Icon Dimensions
              </Text>
              <FormLayout.Group>
                <RangeSlider
                  label="Icon width (px)"
                  value={formSettings.customIconWidth}
                  onChange={(value) =>
                    handleSettingChange("customIconWidth", value)
                  }
                  min={20}
                  max={100}
                  output
                  helpText="Set the width of your custom icon."
                />
                <RangeSlider
                  label="Icon height (px)"
                  value={formSettings.customIconHeight}
                  onChange={(value) =>
                    handleSettingChange("customIconHeight", value)
                  }
                  min={20}
                  max={100}
                  output
                  helpText="Set the height of your custom icon."
                />
              </FormLayout.Group>
            </div>
          </BlockStack>
        )}

        <Checkbox
          label="Enable hover animation"
          helpText="Animate the button when hovered."
          checked={formSettings.enableHoverAnimation}
          onChange={(checked) =>
            handleSettingChange("enableHoverAnimation", checked)
          }
        />
        <Select
          label="Animation type"
          options={OPTIONS.animation}
          value={formSettings.animationType}
          onChange={(value) => handleSettingChange("animationType", value)}
          disabled={!formSettings.enableHoverAnimation}
        />
      </FormLayout>
    </Card>
  );
};

export default IconAnimationSettings;
