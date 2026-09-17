import { DateField, DeleteButton, EditButton, List, useTable } from "@refinedev/antd";
import type { BaseRecord } from "@refinedev/core";
import { Space, Table } from "antd";
import type { OfferTerm } from "@pvt/shared";

export const OfferTermsList = () => {
  const { tableProps } = useTable<OfferTerm>({ syncWithLocation: true });

  return (
    <List>
      <Table {...tableProps} rowKey="id">
        <Table.Column dataIndex="id" title="ID" />
        <Table.Column dataIndex="key" title="Key" />
        <Table.Column
          dataIndex="priceMultiplier"
          title="Price multiplier"
          render={(value: number) => `${value}x`}
        />
        <Table.Column dataIndex="closingDaysMin" title="Min closing days" />
        <Table.Column
          dataIndex="closingDaysMax"
          title="Max closing days"
          render={(value: number | null) => value ?? "No limit"}
        />
        <Table.Column dataIndex="inspectionDays" title="Inspection days" />
        <Table.Column
          dataIndex="inspectionDescription"
          title="Inspection description"
          render={(value: string | null) => value ?? "N/A"}
        />
        <Table.Column
          dataIndex="createdAt"
          title="Created at"
          render={(value: string) => <DateField value={value} />}
        />
        <Table.Column
          title="Actions"
          render={(_, record: BaseRecord) => (
            <Space>
              <EditButton hideText size="small" recordItemId={record.id} />
              <DeleteButton hideText size="small" recordItemId={record.id} />
            </Space>
          )}
        />
      </Table>
    </List>
  );
};
