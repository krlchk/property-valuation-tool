import { Edit, useForm } from "@refinedev/antd";
import { Form, Input, InputNumber } from "antd";
import type { UpdateOfferTermsRequest } from "@pvt/shared";

export const OfferTermsEdit = () => {
  const { formProps, saveButtonProps } = useForm<UpdateOfferTermsRequest>({
    resource: "offer-terms",
  });

  return (
    <Edit saveButtonProps={saveButtonProps}>
      <Form {...formProps} layout="vertical">
        <Form.Item label="Key" name="key">
          <Input disabled />
        </Form.Item>
        <Form.Item
          label="Price multiplier"
          name="priceMultiplier"
          rules={[{ required: true, type: "number", min: 0 }]}
        >
          <InputNumber min={0} step={0.01} style={{ width: "100%" }} />
        </Form.Item>
        <Form.Item
          label="Minimum closing days"
          name="closingDaysMin"
          rules={[{ required: true, type: "number", min: 0 }]}
        >
          <InputNumber min={0} precision={0} style={{ width: "100%" }} />
        </Form.Item>
        <Form.Item
          label="Maximum closing days"
          name="closingDaysMax"
          rules={[{ type: "number", min: 0 }]}
        >
          <InputNumber min={0} precision={0} style={{ width: "100%" }} />
        </Form.Item>
        <Form.Item
          label="Inspection days"
          name="inspectionDays"
          rules={[{ required: true, type: "number", min: 0 }]}
        >
          <InputNumber min={0} precision={0} style={{ width: "100%" }} />
        </Form.Item>
        <Form.Item label="Inspection description" name="inspectionDescription">
          <Input.TextArea rows={4} />
        </Form.Item>
      </Form>
    </Edit>
  );
};
