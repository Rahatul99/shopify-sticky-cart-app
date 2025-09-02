import { Card, FormLayout, Select } from "@shopify/polaris";
import { OPTIONS } from "../utils/data";

const LayoutTypeSettings = ({ formSettings, handleSettingChange }) => (
  <Card sectioned title="Layout Type">
    <FormLayout gap={{ xs: "400", sm: "400", md: "500" }}>
      <Select
        label="Layout Type"
        options={OPTIONS.layout}
        value={
          formSettings.quantityBadgePosition === "structured"
            ? "structured"
            : "normal"
        }
        onChange={(value) => {
          const newPosition =
            value === "structured" ? "structured" : "top-right";
          handleSettingChange("quantityBadgePosition", newPosition);
        }}
        helpText="Choose between simple normal layout or professional structured layout with two sections."
      />
    </FormLayout>
  </Card>
);

export default LayoutTypeSettings;
