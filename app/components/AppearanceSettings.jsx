import { Card, FormLayout, RangeSlider, TextField } from "@shopify/polaris";

const AppearanceSettings = ({ formSettings, handleSettingChange }) => {
  const isStructured = formSettings.quantityBadgePosition === "structured";
  const showBackgroundColor = formSettings.showQuantityBadge || !isStructured;

  return (
    <Card sectioned title="Appearance">
      <FormLayout gap={{ xs: "400", sm: "400", md: "500" }}>
        <FormLayout.Group gap={{ xs: "400", sm: "400", md: "500" }}>
          {showBackgroundColor && (
            <TextField
              type="color"
              label="Background color"
              value={formSettings.backgroundColor}
              onChange={(value) =>
                handleSettingChange("backgroundColor", value)
              }
            />
          )}
          <TextField
            type="color"
            label="Icon color"
            value={formSettings.iconColor}
            onChange={(value) => handleSettingChange("iconColor", value)}
          />
        </FormLayout.Group>
        <FormLayout.Group>
          <RangeSlider
            label="Button width (px)"
            value={formSettings.width}
            onChange={(value) => handleSettingChange("width", value)}
            min={60}
            max={120}
            output
          />
          <RangeSlider
            label="Button height (px)"
            value={formSettings.height}
            onChange={(value) => handleSettingChange("height", value)}
            min={60}
            max={120}
            output
          />
          <RangeSlider
            label="Button border radius (%)"
            value={formSettings.buttonRadius}
            onChange={(value) => handleSettingChange("buttonRadius", value)}
            min={0}
            max={100}
            output
            helpText="100% will make the button fully circular."
          />
        </FormLayout.Group>
      </FormLayout>
    </Card>
  );
};

export default AppearanceSettings;
