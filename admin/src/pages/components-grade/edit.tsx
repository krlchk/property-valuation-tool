import { Edit, useForm } from "@refinedev/antd";
import { Form, Input, InputNumber } from "antd";
import type { UpdateComponentGradeInput } from "@pvt/shared";
import { useParams } from "react-router";

const formatComponentName = (value: string) =>
  value
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

export const ComponentsGradeEdit = () => {
  const { componentKey, grade } = useParams();
  const { formProps, saveButtonProps } = useForm<UpdateComponentGradeInput>({
    resource: "components-grade",
    id: `${componentKey}/${grade}`,
  });

  return (
    <Edit saveButtonProps={saveButtonProps}>
      <Form {...formProps} layout="vertical">
        <Form.Item label="Component">
          <Input value={componentKey ? formatComponentName(componentKey) : ""} disabled />
        </Form.Item>
        <Form.Item label="Grade">
          <Input value={grade} disabled />
        </Form.Item>
        <Form.Item
          label="Adjustment percentage"
          name="gradePercentage"
          rules={[{ required: true, type: "number", min: -10, max: 0 }]}
        >
          <InputNumber min={-10} max={0} step={0.01} precision={2} style={{ width: "100%" }} />
        </Form.Item>
      </Form>
    </Edit>
  );
};
