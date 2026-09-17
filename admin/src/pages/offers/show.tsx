import { DateField, NumberField, Show, TextField } from "@refinedev/antd";
import { useOne, useShow, useNavigation } from "@refinedev/core";
import { Button, Card, Col, Row, Space, Tag, Typography, message } from "antd";
import { MailOutlined, HomeOutlined, UserOutlined } from "@ant-design/icons";
import type { Offer, PropertyResponse, User } from "@pvt/shared";
import { useParams } from "react-router";

const { Title, Text, Link } = Typography;

export const OfferShow = () => {
  const { id } = useParams<{ id: string }>();
  const { show } = useNavigation();

  const {
    result: record,
    query: { isLoading },
  } = useShow<Offer>({
    resource: "offers",
    id,
    queryOptions: { enabled: !!id },
  });

  // Fetch linked Property
  const {
    result: property,
    query: { isLoading: propertyIsLoading }
  } = useOne<PropertyResponse>({
    resource: "properties",
    id: record?.propertyId || "",
    queryOptions: { enabled: !!record?.propertyId },
  });

  // Fetch linked User
  const {
    result: user,
    query: { isLoading: userIsLoading }
  } = useOne<User>({
    resource: "users",
    id: record?.userId || "",
    queryOptions: { enabled: !!record?.userId },
  });

  const handleSendEmail = () => {
    message.success(`Mocked: Email notification sent to ${user?.email || "user"}`);
  };


  return (
    <Show isLoading={isLoading}>
      <Space direction="vertical" size="large" style={{ width: "100%" }}>
        {/* Row 1: ID & Status Header */}
        <Card>
          <Row justify="space-between" align="middle">
            <Col>
              <Title level={5} style={{ margin: 0 }}>Offer ID</Title>
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

        {/* Row 2: Property & User Cards */}
        <Row gutter={[16, 16]}>
          <Col xs={24} md={12}>
            <Card title={<Space><HomeOutlined /> Property Details</Space>} loading={propertyIsLoading}>
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
              title={<Space><UserOutlined /> User Details</Space>}
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

        {/* Row 3: Pricing Information */}
        <Card title="Pricing Details">
          <Row gutter={[16, 16]}>
            <Col xs={12} sm={6}>
              <Title level={5}>Minimum Price</Title>
              <NumberField value={record?.minPrice} options={{ style: "currency", currency: "USD" }} />
            </Col>
            <Col xs={12} sm={6}>
              <Title level={5}>Maximum Price</Title>
              <NumberField value={record?.maxPrice} options={{ style: "currency", currency: "USD" }} />
            </Col>
          </Row>
        </Card>

        {/* Row 4: Metadata */}
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
    </Show>
  );
};