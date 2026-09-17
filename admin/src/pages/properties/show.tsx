import {
  DateField,
  NumberField,
  Show,
  TextField,
} from "@refinedev/antd";
import { useMany, useOne, useShow, useNavigation } from "@refinedev/core";
import { Card, Image, List, Space, Tabs, Tag, Typography } from "antd";
import { OfferTerm, PropertyPhoto, PropertyResponse, User } from "@pvt/shared";
import { UserOutlined, FileTextOutlined } from "@ant-design/icons";

const { Title, Link } = Typography;

export const PropertyShow = () => {
  const { show } = useNavigation();

  const {
    result: record,
    query: { isLoading },
  } = useShow<PropertyResponse>();

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
    result: term,
    query: { isLoading: termIsLoading },
  } = useOne<OfferTerm>({
    resource: "offer-terms",
    id: record?.offerTermsId ? String(record.offerTermsId) : "",
    queryOptions: {
      enabled: !!record?.offerTermsId,
    },
  });

  // 4. Fetch associated Property Photos
  const {
    result: { data: photos },
    query: { isLoading: photosIsLoading },
  } = useMany<PropertyPhoto>({
    resource: "property-photos",
    ids: record?.id ? [record.id] : [], // Adjust resource/filters to match your backend query structure
    queryOptions: {
      enabled: !!record?.id,
    },
  });

  const detailsTabContent = (
    <Space direction="vertical" style={{ width: "100%" }} size="middle">
      <Title level={5}>ID</Title>
      <TextField value={record?.id} />

      <Title level={5}>Address Line 1</Title>
      <TextField value={record?.addressLine1} />

      <Title level={5}>City</Title>
      <TextField value={record?.city} />

      <Title level={5}>State</Title>
      <TextField value={record?.state} />

      <Title level={5}>Postal Code</Title>
      <TextField value={record?.postalCode} />

      <Title level={5}>Coordinates</Title>
      <TextField
        value={
          record?.latitude && record?.longitude
            ? `${record.latitude}, ${record.longitude}`
            : "N/A"
        }
      />

      <Title level={5}>Address Provider</Title>
      <TextField value={record?.addressProvider ?? "N/A"} />

      <Title level={5}>Provider Place ID</Title>
      <TextField value={record?.providerPlaceId ?? "N/A"} />

      <Title level={5}>Square Feet</Title>
      <NumberField
        value={record?.squareFeet ?? 0}
        options={{ style: "decimal" }}
        // suffix=" sq ft"
      />

      <Title level={5}>Starting Value</Title>
      <NumberField
        value={record?.startingValue ?? 0}
        options={{ style: "currency", currency: "USD" }}
      />

      <Title level={5}>User</Title>
      {userIsLoading ? (
        <>Loading...</>
      ) : user ? (
        <Link onClick={() => show("users", user.id)}>
            <Space>
                <UserOutlined />
                {user.email}
            </Space>
        </Link>
      ) : (
        "N/A"
      )}

      <Title level={5}>Offer Term</Title>
      {termIsLoading ? (
        <>Loading...</>
      ) : term ? (
        <Link onClick={() => show("offer-terms", String(term.id))}>
            <Space>
                <FileTextOutlined />
                {term.key}
            </Space>
        </Link>
      ) : (
        "N/A"
      )}

      <Title level={5}>Created At</Title>
      <DateField value={record?.createdAt} />

      <Title level={5}>Updated At</Title>
      <DateField value={record?.updatedAt} />
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

  return (
    <Show isLoading={isLoading}>
      <Tabs
        defaultActiveKey="details"
        items={[
          {
            key: "details",
            label: "Property Details",
            children: detailsTabContent,
          },
          {
            key: "gallery",
            label: `Photo Gallery (${photos?.length ?? 0})`,
            children: galleryTabContent,
          },
        ]}
      />
    </Show>
  );
};