import {
  DateField,
  NumberField,
  Show,
  TextField,
} from "@refinedev/antd";
import {
  useCustom,
  useOne,
  useShow,
  useNavigation,
} from "@refinedev/core";
import {
  Button,
  Card,
  Col,
  Row,
  Space,
  Tag,
  Timeline,
  Tabs,
  Typography,
  message,
} from "antd";
import {
  ArrowLeftOutlined,
  MailOutlined,
  HomeOutlined,
  UserOutlined,
} from "@ant-design/icons";
import type {
  Offer,
  OfferStatusHistory,
  PropertyResponse,
  User,
} from "@pvt/shared";
import { useParams } from "react-router";
import { API_URL } from "../../providers/constants";

const { Title, Text, Link } = Typography;

export const OfferShow = () => {
  const { id } = useParams<{ id: string }>();
  const { show, list } = useNavigation();

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
    result: property,
    query: { isLoading: propertyIsLoading },
  } = useOne<PropertyResponse>({
    resource: "properties",
    id: record?.propertyId || "",
    queryOptions: {
      enabled: !!record?.propertyId,
    },
  });

  const {
    result: user,
    query: { isLoading: userIsLoading },
  } = useOne<User>({
    resource: "users",
    id: record?.userId || "",
    queryOptions: {
      enabled: !!record?.userId,
    },
  });

  const {
    result: { data: statusHistory },
    query: { isLoading: statusHistoryIsLoading },
  } = useCustom<OfferStatusHistory[]>({
    url: `${API_URL}/offers/${id}/history`,
    method: "get",
    queryOptions: {
      enabled: !!id,
    },
  });

  const handleSendEmail = () => {
    message.success(
      `Mocked: Email notification sent to ${user?.email || "user"}`,
    );
  };

  const overviewTab = (
    <Space direction="vertical" size="large" style={{ width: "100%" }}>
      <Card>
        <Row justify="space-between" align="middle">
          <Col>
            <Title level={5} style={{ margin: 0 }}>
              Offer ID
            </Title>
            <Text copyable>{record?.id}</Text>
          </Col>

          <Col>
            <Space align="center">
              <Text type="secondary">Status:</Text>
              <Tag color="blue">{record?.status}</Tag>
            </Space>
          </Col>
        </Row>
      </Card>

      <Row gutter={[16, 16]}>
        <Col xs={24} md={12}>
          <Card
            title={
              <Space>
                <HomeOutlined />
                Property Details
              </Space>
            }
            loading={propertyIsLoading}
          >
            <Space direction="vertical">
              <div>
                <Text type="secondary">Address</Text>

                <div>
                  {property ? (
                    <Link onClick={() => show("properties", property.id)}>
                      {property.addressLine1 || property.id}
                    </Link>
                  ) : (
                    <TextField value={record?.propertyId} />
                  )}
                </div>
              </div>
            </Space>
          </Card>
        </Col>

        <Col xs={24} md={12}>
          <Card
            title={
              <Space>
                <UserOutlined />
                User Details
              </Space>
            }
            loading={userIsLoading}
            extra={
              <Button
                type="primary"
                icon={<MailOutlined />}
                onClick={handleSendEmail}
                disabled={!user?.email}
              >
                Send Email
              </Button>
            }
          >
            <Space direction="vertical">
              <div>
                <Text type="secondary">User</Text>

                <div>
                  {user ? (
                    <Link onClick={() => show("users", user.id)}>
                      {user.name} ({user.email})
                    </Link>
                  ) : (
                    <TextField value={record?.userId} />
                  )}
                </div>
              </div>
            </Space>
          </Card>
        </Col>
      </Row>

      <Card title="Pricing Details">
        <Row gutter={[16, 16]}>
          <Col xs={12} sm={6}>
            <Title level={5}>Minimum Price</Title>
            <NumberField
              value={record?.minPrice}
              options={{
                style: "currency",
                currency: "USD",
              }}
            />
          </Col>

          <Col xs={12} sm={6}>
            <Title level={5}>Maximum Price</Title>
            <NumberField
              value={record?.maxPrice}
              options={{
                style: "currency",
                currency: "USD",
              }}
            />
          </Col>
        </Row>
      </Card>

      <Card title="Metadata">
        <Row gutter={[16, 16]}>
          <Col xs={12} sm={6}>
            <Title level={5}>Created At</Title>
            <DateField value={record?.createdAt} format="LLL" />
          </Col>

          <Col xs={12} sm={6}>
            <Title level={5}>Updated At</Title>
            <DateField value={record?.updatedAt} format="LLL" />
          </Col>
        </Row>
      </Card>
    </Space>
  );

  const historyTab = (
    <Card title="Status History" loading={statusHistoryIsLoading}>
      {statusHistory?.length ? (
        <Timeline
          items={statusHistory.map((history) => ({
            children: (
              <Space direction="vertical" size={0}>
                <Text strong>{history.status}</Text>

                <DateField
                  value={history.createdAt}
                  format="LLL"
                />
              </Space>
            ),
          }))}
        />
      ) : (
        <Text type="secondary">No status history available.</Text>
      )}
    </Card>
  );

  return (
    <Show
      isLoading={isLoading}
      goBack={false}
      headerButtons={() => (
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => list("offers")}
        >
          Back to offers
        </Button>
      )}
    >
      <Tabs
        defaultActiveKey="overview"
        items={[
          {
            key: "overview",
            label: "Overview",
            children: overviewTab,
          },
          {
            key: "history",
            label: "Status History",
            children: historyTab,
          },
        ]}
      />
    </Show>
  );
};
