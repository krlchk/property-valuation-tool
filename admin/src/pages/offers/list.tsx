import { DateField, DeleteButton, EditButton, List, ShowButton, useTable } from "@refinedev/antd";
import type { BaseRecord } from "@refinedev/core";
import { Space, Table, Tag } from "antd";
import type { Offer } from "@pvt/shared";

export const OffersList = () => {
  const { tableProps } = useTable<Offer>({ syncWithLocation: true });

  return (
    <List>
      <Table {...tableProps} rowKey="id">
        <Table.Column dataIndex="id" title="ID" />
        <Table.Column dataIndex="propertyId" title="Property ID" />
        <Table.Column dataIndex="userId" title="User ID" />
        <Table.Column dataIndex="minPrice" title="Minimum price" render={(value: number) => `$${value.toLocaleString()}`} />
        <Table.Column dataIndex="maxPrice" title="Maximum price" render={(value: number) => `$${value.toLocaleString()}`} />
        <Table.Column dataIndex="status" title="Status" render={(value: Offer["status"]) => <Tag>{value}</Tag>} />
        <Table.Column dataIndex="createdAt" title="Created at" render={(value: string) => <DateField value={value} />} />
        <Table.Column
          title="Actions"
          render={(_, record: BaseRecord) => (
            <Space>
              <EditButton hideText size="small" recordItemId={record.id} />
              <ShowButton hideText size="small" recordItemId={record.id} />
              <DeleteButton hideText size="small" recordItemId={record.id} />
            </Space>
          )}
        />
      </Table>
    </List>
  );
};
