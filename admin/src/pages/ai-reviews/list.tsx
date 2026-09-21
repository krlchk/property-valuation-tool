import { PropertyReview } from "@pvt/shared";
import {
  DateField,
  DeleteButton,
  ShowButton,
  List,
  useTable,
} from "@refinedev/antd";
import { Button, Space, Table, Tag, Tooltip } from "antd";
import { type BaseRecord } from "@refinedev/core";
import { DownloadOutlined } from "@ant-design/icons";
import { downloadReview } from "../../utils/download-review";

export const AiReviewsList = () => {
  const { tableProps } = useTable<PropertyReview[]>({
    syncWithLocation: true,
  });

  return (
    <List>
      <Table {...tableProps} rowKey="id">
        <Table.Column dataIndex="id" title="ID" width={80} />

        <Table.Column
          dataIndex="result"
          title="Result"
          render={(value: string) => (
            <Tag color={value === "success" ? "blue" : "red"}>{value}</Tag>
          )}
        />

        <Table.Column
          dataIndex="conditionAdjustmentPct"
          title="Condition Adj."
          render={(val: number) => (
            <Tag color={val < 0 ? "volcano" : "green"}>{val}%</Tag>
          )}
        />

        <Table.Column
          dataIndex="createdAt"
          title="Created At"
          render={(val: string) => <DateField value={val} format="LLL" />}
        />

        <Table.Column<PropertyReview>
          title="Action"
          key="action"
          width={120}
          render={(_, record) => (
            <Tooltip title="Download this response JSON">
              <Button
                type="text"
                icon={<DownloadOutlined />}
                onClick={() => downloadReview(record)}
                disabled={!record.reviewResponse}
              >
                JSON
              </Button>
            </Tooltip>
          )}
        />

        <Table.Column
          title={"Actions"}
          dataIndex="actions"
          render={(_, record: BaseRecord) => (
            <Space>
              <ShowButton hideText size="small" recordItemId={record.id} />
              <DeleteButton hideText size="small" recordItemId={record.id} />
            </Space>
          )}
        />
      </Table>
    </List>
  );
};
