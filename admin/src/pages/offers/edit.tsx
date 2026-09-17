import { Edit, useForm } from "@refinedev/antd";
import { Form, InputNumber, Select } from "antd";
import type { OfferStatus, UpdateOfferPayload } from "@pvt/shared";

const offerStatuses: OfferStatus[] = ["accepted", "proccessed", "done"];

export const OfferEdit = () => {
  const { formProps, saveButtonProps } = useForm<UpdateOfferPayload>({
    resource: "offers",
  });

  return (
    <Edit saveButtonProps={saveButtonProps}>
      <Form {...formProps} layout="vertical">
        <Form.Item label="Minimum price" name="minPrice" rules={[{ required: true, type: "number", min: 0 }]}> 
          <InputNumber min={0} style={{ width: "100%" }} />
        </Form.Item>
        <Form.Item label="Maximum price" name="maxPrice" rules={[{ required: true, type: "number", min: 0 }]}> 
          <InputNumber min={0} style={{ width: "100%" }} />
        </Form.Item>
        <Form.Item label="Status" name="status" rules={[{ required: true }]}> 
          <Select options={offerStatuses.map((status) => ({ label: status, value: status }))} />
        </Form.Item>
      </Form>
    </Edit>
  );
};
