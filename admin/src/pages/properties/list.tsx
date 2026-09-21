/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  DateField,
  DeleteButton,
  EditButton,
  List,
  ShowButton,
  useTable,
} from "@refinedev/antd";
import { type BaseRecord, useMany } from "@refinedev/core";
import { Space, Table, Tooltip, Typography } from "antd";
import { OfferTerm, PropertyResponse, User } from "@pvt/shared";

export const PropertiesList = () => {
  const { result, tableProps } = useTable<PropertyResponse>({
    syncWithLocation: true,
  });

  const termIds =
    result?.data
      ?.map((item) => item?.offerTermsId)
      .filter((id): id is number => id !== null && id !== undefined) ?? [];

  const userIds =
    result?.data
      ?.map((item) => item?.userId)
      .filter((id): id is string => id !== null && id !== undefined) ?? [];

  const {
    result: { data: terms },
    query: { isLoading: termIsLoading },
  } = useMany<OfferTerm>({
    resource: "offer-terms",
    ids: termIds,
    queryOptions: {
      enabled: !!result?.data,
    },
  });

  const {
    result: { data: users },
    query: { isLoading: userIsLoading },
  } = useMany<User>({
    resource: "users",
    ids: userIds,
    queryOptions: {
      enabled: !!result?.data,
    },
  });

  return (
    <List>
      <Table {...tableProps} rowKey="id" scroll={{ x: "max-content" }}>
        <Table.Column
          dataIndex="id"
          title={"ID"}
          render={(id: string) => (
            <Tooltip title={id}>
              <Typography.Text copyable={{ text: id }} code>
                {id ? `${id.slice(0, 8)}...` : "-"}
              </Typography.Text>
            </Tooltip>
          )}
        />

        <Table.Column dataIndex="addressLine1" title={"Address Line 1"} />

        <Table.Column title="City" dataIndex="city" key="city" sorter />

        <Table.Column title="State" dataIndex="state" key="state" />

        <Table.Column
          title="Postal Code"
          dataIndex="postalCode"
          key="postalCode"
        />

        <Table.Column
          title="Latitude"
          dataIndex="latitude"
          key="latitude"
          render={(val: number | null) => val ?? "N/A"}
        />

        <Table.Column
          title="Longitude"
          dataIndex="longitude"
          key="longitude"
          render={(val: number | null) => val ?? "N/A"}
        />

        <Table.Column
          title="Address Provider"
          dataIndex="addressProvider"
          key="addressProvider"
          render={(val: string | null) => val ?? "N/A"}
        />

        <Table.Column
          title="Provider Place ID"
          dataIndex="providerPlaceId"
          key="providerPlaceId"
          render={(val: string | null) => val ?? "N/A"}
        />

        <Table.Column
          title="Square Feet"
          dataIndex="squareFeet"
          key="squareFeet"
          render={(val: number | null) =>
            val != null ? `${val.toLocaleString()} sq ft` : "N/A"
          }
          sorter={(a, b) => (a.squareFeet ?? 0) - (b.squareFeet ?? 0)}
        />

        <Table.Column
          title="Starting Value"
          dataIndex="startingValue"
          key="startingValue"
          render={(val: number) => `$${val.toLocaleString()}`}
          sorter={(a, b) => a.startingValue - b.startingValue}
        />

        <Table.Column
          dataIndex={"offerTermsId"}
          title={"Offer term"}
          render={(value: number | null) => {
            if (!value) return "N/A";
            if (termIsLoading) return <>Loading...</>;

            const term = terms?.find((item) => item.id === value);

            return term ? term.key : "Term not found";
          }}
        />

        <Table.Column
          dataIndex={"userId"}
          title={"User"}
          render={(value: string | null) => {
            if (!value) return "N/A";
            if (userIsLoading) return <>Loading...</>;

            console.log(users);

            const user = users?.find((item) => item.id === value);

            return user ? user.email : "User not found";
          }}
        />

        <Table.Column
          dataIndex={["createdAt"]}
          title={"Created at"}
          render={(value: any) => <DateField value={value} />}
          sorter={(a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          }
        />

        <Table.Column
          dataIndex={["updatedAt"]}
          title="Updated At"
          render={(value: any) => <DateField value={value} />}
          sorter={(a, b) =>
            new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()
          }
        />

        <Table.Column
          title={"Actions"}
          dataIndex="actions"
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
