import { DateField, DeleteButton, EditButton, List, useTable } from "@refinedev/antd";
import { type BaseRecord } from "@refinedev/core";
import { Space, Table, Tag } from "antd";
import type { PropertyComponentGrade } from "@pvt/shared";
import { useNavigate } from "react-router";

const formatComponentName = (value: string) =>
  value
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

const gradeColors: Record<string, string> = {
  GOOD: "green",
  FAIR: "blue",
  BAD: "red",
};

export const ComponentsGradeList = () => {
  const { tableProps } = useTable<PropertyComponentGrade>({
    resource: "components-grade",
    syncWithLocation: true,
  });

  const navigate = useNavigate();

  return (
    <List>
      <Table {...tableProps} rowKey="id">
        <Table.Column dataIndex="id" title="ID" />
        <Table.Column
          dataIndex="componentKey"
          title="Component"
          render={(value: string) => formatComponentName(value)}
        />
        <Table.Column
          dataIndex="grade"
          title="Grade"
          render={(value: string) => <Tag color={gradeColors[value]}>{value}</Tag>}
        />
        <Table.Column
          dataIndex="gradePercentage"
          title="Adjustment (%)"
          render={(value: number) => `${value.toFixed(2)}%`}
        />
        <Table.Column
          dataIndex="updatedAt"
          title="Updated at"
          render={(value: string) => <DateField value={value} />}
        />
        <Table.Column
          title="Actions"
          render={(_, record: BaseRecord) => (
            <Space>
              <EditButton
                hideText
                size="small"
                onClick={() =>
                  navigate(
                    `/components-grade/${record.componentKey}/${record.grade}/edit`,
                  )
                }
              />
              <DeleteButton hideText size="small" recordItemId={record.id} />
            </Space>
          )}
        />
      </Table>
    </List>
  );
};
