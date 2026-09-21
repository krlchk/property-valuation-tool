import { DateField, NumberField, Show } from "@refinedev/antd";
import { useCustom, useNavigation, useShow } from "@refinedev/core";
import {
  Alert,
  Card,
  Row,
  Col,
  Space,
  Table,
  Tabs,
  Tag,
  Typography,
} from "antd";
import type { PropertyRepairReview, PropertyReview } from "@pvt/shared";
import { useParams } from "react-router";
import { API_URL } from "../../providers/constants";
import {
  ClockCircleOutlined,
  HomeOutlined,
  RobotOutlined,
} from "@ant-design/icons";

const { Text, Link } = Typography;

type ReviewEvaluation = {
  component?: string;
  grade?: string;
  confidence?: number;
  reason?: string;
  recommendedAction?: string | null;
};

const getEvaluations = (review?: PropertyReview): ReviewEvaluation[] => {
  const evaluations = review?.reviewResponse;
  return Array.isArray(evaluations) ? evaluations : [];
};

export const AiReviewsShow = () => {
  const { id } = useParams<{ id: string }>();

  const { show } = useNavigation();
  const {
    result: review,
    query: { isLoading },
  } = useShow<PropertyReview>({
    resource: "ai-reviews",
    id,
    queryOptions: { enabled: !!id },
  });

  const {
    result: { data: repairs },
    query: { isLoading: repairsIsLoading, isError: repairsIsError },
  } = useCustom<PropertyRepairReview[]>({
    url: `${API_URL}/ai-reviews/${id}/repairs`,
    method: "get",
    queryOptions: {
      enabled: !!id && review?.result === "success",
    },
  });

  const evaluations = getEvaluations(review);
  const failedEvaluations = evaluations.filter(
    (evaluation) => evaluation.grade === "UNKNOWN",
  );

  const detailsContent = (
    <Space direction="vertical" size="large" style={{ width: "100%" }}>
      <Space direction="vertical" style={{ width: "100%" }} size="large">
        <Card
          title={
            <Space>
              <RobotOutlined /> AI Review Details
            </Space>
          }
        >
          <Row gutter={[16, 16]}>
            <Col span={12}>
              <Text type="secondary">Review ID</Text>
              <div>
                {review?.id ? (
                  <Text copyable>{review.id}</Text>
                ) : (
                  <Text type="secondary">N/A</Text>
                )}
              </div>
            </Col>
            <Col span={12}>
              <Text type="secondary">Property ID</Text>
              <div>
                {review?.propertyId ? (
                  <Link onClick={() => show("properties", review.propertyId)}>
                    <Space>
                      <HomeOutlined />
                      {review.propertyId}
                    </Space>
                  </Link>
                ) : (
                  <Text type="secondary">N/A</Text>
                )}
              </div>
            </Col>
            <Col span={12}>
              <Text type="secondary">Result</Text>
              <div>
                {review?.result ? (
                  <Tag color={review.result === "success" ? "blue" : "red"}>
                    {review.result}
                  </Tag>
                ) : (
                  <Text type="secondary">N/A</Text>
                )}
              </div>
            </Col>
            <Col span={12}>
              <Text type="secondary">Condition Adjustment</Text>
              <div>
                {review?.conditionAdjustmentPct != null ? (
                  <>
                    <NumberField value={review.conditionAdjustmentPct} />%
                  </>
                ) : (
                  <Text type="secondary">N/A</Text>
                )}
              </div>
            </Col>
          </Row>
        </Card>

        {/* System Metadata Card */}
        <Card
          title={
            <Space>
              <ClockCircleOutlined /> System Metadata
            </Space>
          }
        >
          <Row gutter={[16, 16]}>
            <Col xs={12} sm={12}>
              <Text type="secondary">Created At</Text>
              <div>
                {review?.createdAt ? (
                  <DateField value={review.createdAt} format="LLL" />
                ) : (
                  <Text type="secondary">N/A</Text>
                )}
              </div>
            </Col>
            <Col xs={12} sm={12}>
              <Text type="secondary">Updated At</Text>
              <div>
                {review?.updatedAt ? (
                  <DateField value={review.updatedAt} format="LLL" />
                ) : (
                  <Text type="secondary">N/A</Text>
                )}
              </div>
            </Col>
          </Row>
        </Card>
      </Space>

      {review?.result === "failed" ? (
        <Alert
          type="error"
          showIcon
          message="AI review failed"
          description={
            failedEvaluations.length > 0 ? (
              <Space direction="vertical" style={{ width: "100%" }}>
                {failedEvaluations.map((evaluation) => (
                  <div key={evaluation.component}>
                    <Text strong>{evaluation.component || "Component"}: </Text>
                    <Text>
                      {evaluation.reason ||
                        "Unable to evaluate this component."}
                    </Text>
                    {evaluation.recommendedAction && (
                      <div>
                        <Text type="secondary">
                          Recommended action: {evaluation.recommendedAction}
                        </Text>
                      </div>
                    )}
                  </div>
                ))}
              </Space>
            ) : (
              "The review did not complete successfully."
            )
          }
        />
      ) : (
        <Card title="Component review details">
          <Table<ReviewEvaluation>
            dataSource={evaluations}
            rowKey={(evaluation) =>
              `${evaluation.component || "component"}-${evaluation.grade || "unknown"}`
            }
            pagination={false}
            size="small"
          >
            <Table.Column<ReviewEvaluation>
              dataIndex="component"
              title="Component"
            />
            <Table.Column<ReviewEvaluation>
              dataIndex="grade"
              title="Grade"
              render={(value: string) => <Tag color="blue">{value}</Tag>}
            />
            <Table.Column<ReviewEvaluation>
              dataIndex="confidence"
              title="Confidence"
              render={(value?: number) =>
                value == null ? "—" : `${Math.round(value * 100)}%`
              }
            />
            <Table.Column<ReviewEvaluation> dataIndex="reason" title="Reason" />
          </Table>
        </Card>
      )}
    </Space>
  );

  const repairsContent = repairsIsError ? (
    <Alert type="error" message="Unable to load property repairs." />
  ) : (
    <Table<PropertyRepairReview>
      loading={repairsIsLoading}
      dataSource={repairs || []}
      rowKey="id"
      pagination={false}
    >
      <Table.Column<PropertyRepairReview>
        dataIndex="componentKey"
        title="Component"
      />
      <Table.Column<PropertyRepairReview> dataIndex="grade" title="Grade" />
      <Table.Column<PropertyRepairReview>
        dataIndex="estimatedRepairPrice"
        title="Estimated repair price"
        render={(value: number) => <NumberField value={value} />}
      />
      <Table.Column<PropertyRepairReview>
        title="Repair summary"
        render={(_, record) => (
          <Space direction="vertical" size={0}>
            <Text strong>{record.reviewResponse?.title || "—"}</Text>
            <Text type="secondary">{record.reviewResponse?.note || "—"}</Text>
          </Space>
        )}
      />
    </Table>
  );

  return (
    <Show isLoading={isLoading} title="AI review">
      {review?.result === "success" ? (
        <Tabs
          items={[
            { key: "details", label: "Details", children: detailsContent },
            { key: "repairs", label: "Repairs", children: repairsContent },
          ]}
        />
      ) : (
        detailsContent
      )}
    </Show>
  );
};
