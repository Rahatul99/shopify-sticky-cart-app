import {
  Banner,
  Card,
  Checkbox,
  FormLayout,
  RangeSlider,
  Select,
  TextField,
} from "@shopify/polaris";
import { OPTIONS } from "../utils/data";

const QuantityBadgeSettings = ({ formSettings, handleSettingChange }) => {
  const isStructured = formSettings.quantityBadgePosition === "structured";

  if (!formSettings.showQuantityBadge && isStructured) return null;

  return (
    <Card sectioned title="Quantity Badge">
      <FormLayout>
        <Checkbox
          label="Show Quantity Badge"
          helpText="Display the number of items in the cart on the button."
          checked={formSettings.showQuantityBadge}
          onChange={(checked) =>
            handleSettingChange("showQuantityBadge", checked)
          }
        />

        {formSettings.showQuantityBadge && !isStructured && (
          <>
            <FormLayout.Group>
              <TextField
                type="color"
                label="Badge background color"
                value={formSettings.quantityBackgroundColor}
                onChange={(value) =>
                  handleSettingChange("quantityBackgroundColor", value)
                }
              />
              <TextField
                type="color"
                label="Badge text color"
                value={formSettings.quantityTextColor}
                onChange={(value) =>
                  handleSettingChange("quantityTextColor", value)
                }
              />
            </FormLayout.Group>
            <FormLayout.Group>
              <RangeSlider
                label="Badge width (px)"
                value={formSettings.quantityBadgeWidth}
                onChange={(value) =>
                  handleSettingChange("quantityBadgeWidth", value)
                }
                min={16}
                max={Math.min(formSettings.width, 60)}
                output
                helpText={`Maximum width is limited to button width (${formSettings.width}px)`}
              />
              <RangeSlider
                label="Badge height (px)"
                value={formSettings.quantityBadgeHeight}
                onChange={(value) =>
                  handleSettingChange("quantityBadgeHeight", value)
                }
                min={16}
                max={Math.min(formSettings.height, 60)}
                output
                helpText={`Maximum height is limited to button height (${formSettings.height}px)`}
              />
              <RangeSlider
                label="Badge border radius (%)"
                value={formSettings.quantityBadgeRadius}
                onChange={(value) =>
                  handleSettingChange("quantityBadgeRadius", value)
                }
                min={0}
                max={100}
                output
                helpText="100% will make the badge fully circular."
              />
            </FormLayout.Group>
            <FormLayout.Group>
              <Select
                label="Badge Position"
                options={OPTIONS.badgePosition}
                value={formSettings.quantityBadgePosition}
                onChange={(value) =>
                  handleSettingChange("quantityBadgePosition", value)
                }
                helpText="Choose where the quantity badge appears on the button."
              />
            </FormLayout.Group>
          </>
        )}

        {isStructured && (
          <Banner status="info">
            <p>
              Quantity badge is not available in structured layout. The layout
              automatically displays items count and pricing in a professional
              two-section design.
            </p>
          </Banner>
        )}
      </FormLayout>
    </Card>
  );
};

export default QuantityBadgeSettings;
