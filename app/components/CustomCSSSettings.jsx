import { Card, FormLayout, TextField } from "@shopify/polaris";

const CustomCSSSettings = ({ formSettings, handleSettingChange }) => (
  <Card sectioned title="Custom CSS">
    <FormLayout>
      <TextField
        label="Custom CSS"
        value={formSettings.customCSS || ""}
        onChange={(value) => handleSettingChange("customCSS", value)}
        multiline={4}
        placeholder="/* Add your custom CSS here */"
        helpText="Add custom CSS to further customize the sticky cart appearance. This will be injected after the default styles."
      />
    </FormLayout>
  </Card>
);

export default CustomCSSSettings;
