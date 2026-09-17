import { DateField, NumberField, Show, TextField } from "@refinedev/antd";
import { useCustom, useNavigation, useOne, useShow } from "@refinedev/core";
import {
  Card,
  Col,
  Image,
  List,
  Row,
  Space,
  Table,
  Tabs,
  Tag,
  Typography,
} from "antd";
import {
  FileTextOutlined,
  HomeOutlined,
  PictureOutlined,
  PercentageOutlined,
  UserOutlined,
} from "@ant-design/icons";
import type { Offer, OfferTerm, PropertyPhoto, PropertyResponse, User } from "@pvt/shared";
import { API_URL } from "../../providers/constants";

const { Text, Link } = Typography;

export const PropertyShow = () => {
  const { show } = useNavigation();

  const {
    result: record,
    query: { isLoading },
  } = useShow<PropertyResponse>();

  const {
    result: user,
    query: { isLoading: userIsLoading},
  } = useOne<User>({
    resource: "users",
    id: record?.userId || "",
    queryOptions: {
      enabled: !!record?.userId,
    },
  });

  const {
    result: term,
    query: {isLoading: termIsLoading},
  } = useOne<OfferTerm>({
    resource: "offer-terms",
    id: record?.offerTermsId ? String(record.offerTermsId) : "",
    queryOptions: {
      enabled: !!record?.offerTermsId,
    },
  });

  const {
    result: { data: photos },
    query: { isLoading: photosIsLoading },
  } = useCustom<PropertyPhoto[]>({
    url: `${API_URL}/property-photos/property/${record?.id}`,
    method: "get",
    queryOptions: {
      enabled: !!record?.id,
    },
  });


  const {
    result: { data: offers },
    query: { isLoading: offersIsLoading },
  } = useCustom<Offer[]>({
    url: `${API_URL}/offers?propertyId=${record?.id}`,
    method: "get",
    queryOptions: {
      enabled: !!record?.id,
    },
  });

  const detailsTabContent = (
    <Space direction="vertical" style={{ width: "100%" }} size="large">
      {/* Overview Grid */}
      <Row gutter={[16, 16]}>
        <Col xs={24} md={12}>
          <Card title={<Space><HomeOutlined /> Property & Valuation</Space>}>
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Text type="secondary">Square Feet</Text>
                <div>
                  <NumberField
                    value={record?.squareFeet ?? 0}
                    options={{ style: "decimal" }}
                  />
                </div>
              </Col>
              <Col span={12}>
                <Text type="secondary">Starting Value</Text>
                <div>
                  <NumberField
                    value={record?.startingValue ?? 0}
                    options={{ style: "currency", currency: "USD" }}
                  />
                </div>
              </Col>
              <Col span={12}>
                <Text type="secondary">Condition Pct %</Text>
                <div><TextField value={record?.bedrooms ?? "N/A"} /></div>
              </Col>
              <Col span={12}>
                <Text type="secondary">Estimated Price</Text>
                <div><TextField value={record?.bathrooms ?? "N/A"} /></div>
              </Col>
            </Row>
          </Card>
        </Col>

        <Col xs={24} md={12}>
          <Card title={<Space><UserOutlined /> Relations & Terms</Space>}>
            <Row gutter={[16, 16]}>
              <Col span={24}>
                <Text type="secondary">Owner / User</Text>
                <div>
                  {userIsLoading ? (
                    <Text type="secondary">Loading...</Text>
                  ) : user ? (
                    <Link onClick={() => show("users", user.id)}>
                      <Space>
                        <UserOutlined />
                        {user.name} ({user.email})
                      </Space>
                    </Link>
                  ) : (
                    <Text type="secondary">N/A</Text>
                  )}
                </div>
              </Col>
              <Col span={24}>
                <Text type="secondary">Offer Term</Text>
                <div>
                  {termIsLoading ? (
                    <Text type="secondary">Loading...</Text>
                  ) : term ? (
                    <Link onClick={() => show("offer-terms", String(term.id))}>
                      <Space>
                        <FileTextOutlined />
                        {term.key}
                      </Space>
                    </Link>
                  ) : (
                    <Text type="secondary">N/A</Text>
                  )}
                </div>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>

      <Card title="Address & Location">
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={8}>
            <Text type="secondary">Address Line 1</Text>
            <div><TextField value={record?.addressLine1} /></div>
          </Col>
          <Col xs={12} sm={6} md={4}>
            <Text type="secondary">City</Text>
            <div><TextField value={record?.city} /></div>
          </Col>
          <Col xs={12} sm={6} md={4}>
            <Text type="secondary">State</Text>
            <div><TextField value={record?.state} /></div>
          </Col>
          <Col xs={12} sm={6} md={4}>
            <Text type="secondary">Postal Code</Text>
            <div><TextField value={record?.postalCode} /></div>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Text type="secondary">Coordinates</Text>
            <div>
              <TextField
                value={
                  record?.latitude != null && record?.longitude != null
                    ? `${record.latitude}, ${record.longitude}`
                    : "N/A"
                }
              />
            </div>
          </Col>
          <Col xs={12} sm={6} md={4}>
            <Text type="secondary">Provider</Text>
            <div><TextField value={record?.addressProvider ?? "N/A"} /></div>
          </Col>
          <Col xs={12} sm={6} md={4}>
            <Text type="secondary">Place ID</Text>
            <div><TextField value={record?.providerPlaceId ?? "N/A"} /></div>
          </Col>
        </Row>
      </Card>

      {/* Metadata Card */}
      <Card title="System Metadata">
        <Row gutter={[16, 16]}>
          <Col xs={12} sm={6}>
            <Text type="secondary">Property ID</Text>
            <div><Text copyable>{record?.id}</Text></div>
          </Col>
          <Col xs={12} sm={6}>
            <Text type="secondary">Created At</Text>
            <div><DateField value={record?.createdAt} format="LLL" /></div>
          </Col>
          <Col xs={12} sm={6}>
            <Text type="secondary">Updated At</Text>
            <div><DateField value={record?.updatedAt} format="LLL" /></div>
          </Col>
        </Row>
      </Card>
    </Space>
  );

  const galleryTabContent = (
    <Image.PreviewGroup>
      <List
        loading={photosIsLoading}
        grid={{ gutter: 16, xs: 1, sm: 2, md: 3, lg: 4 }}
        dataSource={photos || []}
        renderItem={(photo) => (
          <List.Item key={photo.id}>
            <Card
              hoverable
              cover={
                <Image
                  alt={photo.category}
                  src={photo.url ?? "https://via.placeholder.com/300?text=No+Image"}
                  height={200}
                  style={{ objectFit: "cover" }}
                />
              }
            >
              <Card.Meta
                title={<Tag color="blue">{photo.category}</Tag>}
                description={new Date(photo.createdAt).toLocaleDateString()}
              />
            </Card>
          </List.Item>
        )}
      />
    </Image.PreviewGroup>
  );

  const offersTabContent = (
    <Card>
      <Table<Offer>
        loading={offersIsLoading}
        dataSource={offers || []}
        rowKey="id"
        pagination={false}
      >
        <Table.Column
          dataIndex="id"
          title="Offer ID"
          render={(value: string) => (
            <Link onClick={() => show("offers", value)}>{value}</Link>
          )}
        />
        <Table.Column
          dataIndex="minPrice"
          title="Min Price"
          render={(value: number) => (
            <NumberField value={value} options={{ style: "currency", currency: "USD" }} />
          )}
        />
        <Table.Column
          dataIndex="maxPrice"
          title="Max Price"
          render={(value: number) => (
            <NumberField value={value} options={{ style: "currency", currency: "USD" }} />
          )}
        />
        <Table.Column
          dataIndex="status"
          title="Status"
          render={(value: Offer["status"]) => <Tag color="blue">{value}</Tag>}
        />
        <Table.Column
          dataIndex="createdAt"
          title="Created At"
          render={(value: string) => <DateField value={value} format="LLL" />}
        />
      </Table>
    </Card>
  );

  return (
    <Show isLoading={isLoading}>
      <Tabs
        defaultActiveKey="details"
        items={[
          {
            key: "details",
            label: (
              <Space>
                <HomeOutlined />
                Property Details
              </Space>
            ),
            children: detailsTabContent,
          },
          {
            key: "offers",
            label: (
              <Space>
                <PercentageOutlined />
                Offers ({offers?.length ?? 0})
              </Space>
            ),
            children: offersTabContent,
          },
          {
            key: "gallery",
            label: (
              <Space>
                <PictureOutlined />
                Photo Gallery ({photos?.length ?? 0})
              </Space>
            ),
            children: galleryTabContent,
          },
        ]}
      />
    </Show>
  );
};