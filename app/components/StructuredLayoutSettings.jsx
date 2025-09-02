import {
  Card,
  FormLayout,
  RangeSlider,
  Select,
  TextField,
} from "@shopify/polaris";
import { OPTIONS } from "../utils/data";

const StructuredLayoutSettings = ({ formSettings, handleSettingChange }) => {
  if (formSettings.quantityBadgePosition !== "structured") return null;

  return (
    <Card sectioned title="Structured Layout Settings">
      <FormLayout>
        <FormLayout.Group>
          <TextField
            label="Top Section Background Color"
            type="color"
            value={formSettings.structuredTopSectionBgColor}
            onChange={(value) =>
              handleSettingChange("structuredTopSectionBgColor", value)
            }
            helpText="Background color for the items count section."
          />
          <TextField
            label="Bottom Section Background Color"
            type="color"
            value={formSettings.structuredBottomSectionBgColor}
            onChange={(value) =>
              handleSettingChange("structuredBottomSectionBgColor", value)
            }
            helpText="Background color for the pricing section."
          />
        </FormLayout.Group>
        <FormLayout.Group>
          <TextField
            label="Items Text Color"
            type="color"
            value={formSettings.structuredItemsTextColor}
            onChange={(value) =>
              handleSettingChange("structuredItemsTextColor", value)
            }
            helpText="Color for the 'X ITEMS' text."
          />
          <TextField
            label="Price Text Color"
            type="color"
            value={formSettings.structuredPriceTextColor}
            onChange={(value) =>
              handleSettingChange("structuredPriceTextColor", value)
            }
            helpText="Color for the price text."
          />
        </FormLayout.Group>
        <FormLayout.Group>
          <RangeSlider
            label="Price font size (px)"
            value={formSettings.pricingFontSize}
            onChange={(value) => handleSettingChange("pricingFontSize", value)}
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
      </FormLayout>
    </Card>
  );
};

export default StructuredLayoutSettings;
