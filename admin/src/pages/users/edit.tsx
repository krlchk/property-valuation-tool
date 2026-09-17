import { Edit, useForm } from "@refinedev/antd";
import { Form, Input } from "antd";
import type { UpdateUserPayload } from "@pvt/shared";

export const UserEdit = () => {
  const { formProps, saveButtonProps } = useForm<UpdateUserPayload>({
    resource: "users",
  });

  return (
    <Edit saveButtonProps={saveButtonProps}>
      <Form {...formProps} layout="vertical">
        <Form.Item label="Name" name="name" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item
          label="Email"
          name="email"
          rules={[{ required: true }, { type: "email" }]}
        >
          <Input />
        </Form.Item>
        <Form.Item label="Mobile number" name="mobileNumber">
          <Input />
        </Form.Item>
      </Form>
    </Edit>
  );
};
