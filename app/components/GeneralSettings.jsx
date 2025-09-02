import { Card, Checkbox, FormLayout, Select } from "@shopify/polaris";
import { OPTIONS } from "../utils/data";

const GeneralSettings = ({ formSettings, handleSettingChange }) => (
  <Card sectioned title="General">
    <FormLayout gap={{ xs: "400", sm: "400", md: "500" }}>
      <Checkbox
        label="Enable Sticky Cart"
        helpText="Check to enable sticky cart on your storefront."
        checked={formSettings.enabled}
        onChange={(checked) => handleSettingChange("enabled", checked)}
      />
      <Select
        label="Cart position"
        options={OPTIONS.position}
        value={formSettings.cartPosition}
        onChange={(value) => handleSettingChange("cartPosition", value)}
        helpText="Choose where the button appears on the screen."
      />
      <Select
        label="Device visibility"
        options={OPTIONS.device}
        value={formSettings.deviceVisibility}
        onChange={(value) => handleSettingChange("deviceVisibility", value)}
        helpText="Control which devices will see the sticky cart."
      />
    </FormLayout>
  </Card>
);

export default GeneralSettings;
