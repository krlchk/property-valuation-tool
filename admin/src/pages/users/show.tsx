import { Show, TextField } from "@refinedev/antd";
import { useShow } from "@refinedev/core";
import { Card, Space, Typography } from "antd";
import type { User } from "@pvt/shared";

const { Title } = Typography;

export const UserShow = () => {
  const {
    result: record,
    query: { isLoading },
  } = useShow<User>();

  return (
    <Show isLoading={isLoading}>
      <Card>
        <Space direction="vertical" size="middle" style={{ width: "100%" }}>
          <div><Title level={5}>ID</Title><TextField value={record?.id} /></div>
          <div><Title level={5}>Name</Title><TextField value={record?.name} /></div>
          <div><Title level={5}>Email</Title><TextField value={record?.email} /></div>
          <div><Title level={5}>Mobile number</Title><TextField value={record?.mobileNumber} /></div>
        </Space>
      </Card>
    </Show>
  );
};
