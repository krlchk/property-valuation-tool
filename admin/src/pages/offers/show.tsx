import { DateField, NumberField, Show, TextField } from "@refinedev/antd";
import { useCustom, useShow } from "@refinedev/core";
import { Card, Space, Table, Tag, Typography } from "antd";
import type { Offer, OfferStatusHistory } from "@pvt/shared";
import { useParams } from "react-router";
import { API_URL } from "../../providers/constants";

const { Title } = Typography;

export const OfferShow = () => {
  const { id } = useParams<{ id: string }>();

  const {
    result: record,
    query: { isLoading },
  } = useShow<Offer>({
    resource: "offers",
    id,
    queryOptions: {
      enabled: !!id,
    },
  });

  const {
    result: { data: history },
    query: { isLoading: historyIsLoading },
  } = useCustom<OfferStatusHistory[]>({
    url: `${API_URL}/offers/${record?.id}/history`,
    method: "get",
    queryOptions: { enabled: !!record?.id },
  });


  return (
    <Show isLoading={isLoading}>
      <Card>
        <Space direction="vertical" size="middle" style={{ width: "100%" }}>
          <div><Title level={5}>ID</Title><TextField value={record?.id} /></div>
          <div><Title level={5}>Property ID</Title><TextField value={record?.propertyId} /></div>
          <div><Title level={5}>User ID</Title><TextField value={record?.userId} /></div>
          <div><Title level={5}>Minimum price</Title><NumberField value={record?.minPrice} options={{ style: "currency", currency: "USD" }} /></div>
          <div><Title level={5}>Maximum price</Title><NumberField value={record?.maxPrice} options={{ style: "currency", currency: "USD" }} /></div>
          <div><Title level={5}>Status</Title><Tag>{record?.status}</Tag></div>
          <div><Title level={5}>Created at</Title><DateField value={record?.createdAt} /></div>
          <div><Title level={5}>Updated at</Title><DateField value={record?.updatedAt} /></div>
          <Title level={4}>Status history</Title>
          <Table<OfferStatusHistory>
            loading={historyIsLoading}
            dataSource={history || []}
            rowKey="id"
            pagination={false}
          >
            <Table.Column dataIndex="status" title="Status" render={(value: OfferStatusHistory["status"]) => <Tag>{value}</Tag>} />
            <Table.Column dataIndex="createdAt" title="Changed at" render={(value: string) => <DateField value={value} />} />
          </Table>
        </Space>
      </Card>
    </Show>
  );
};
