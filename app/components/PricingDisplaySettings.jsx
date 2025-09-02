import {
  Card,
  Checkbox,
  FormLayout,
  RangeSlider,
  Select,
  TextField,
} from "@shopify/polaris";
import { OPTIONS } from "../utils/data";

const PricingDisplaySettings = ({ formSettings, handleSettingChange }) => {
  if (formSettings.quantityBadgePosition === "structured") return null;

  return (
    <Card sectioned title="Pricing Display">
      <FormLayout>
        <Checkbox
          label="Show Pricing Information"
          helpText="Display the cart total price below the icon."
          checked={formSettings.showPricing}
          onChange={(checked) => handleSettingChange("showPricing", checked)}
        />

        {formSettings.showPricing && (
          <FormLayout.Group>
            <TextField
              type="color"
              label="Price text color"
              value={formSettings.pricingTextColor}
              onChange={(value) =>
                handleSettingChange("pricingTextColor", value)
              }
            />
            <TextField
              type="color"
              label="Price background color"
              value={formSettings.priceBackgroundColor}
              onChange={(value) =>
                handleSettingChange("priceBackgroundColor", value)
              }
              helpText="Set to transparent for no background."
            />
            <RangeSlider
              label="Price font size (px)"
              value={formSettings.pricingFontSize}
              onChange={(value) =>
                handleSettingChange("pricingFontSize", value)
              }
              min={8}
              max={20}
              output
            />
            <Select
              label="Price font weight"
              options={OPTIONS.fontWeight}
              value={formSettings.pricingFontWeight}
              onChange={(value) =>
                handleSettingChange("pricingFontWeight", value)
              }
            />
          </FormLayout.Group>
        )}
      </FormLayout>
    </Card>
  );
};

export default PricingDisplaySettings;
