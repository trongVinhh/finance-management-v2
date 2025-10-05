import {
  Card,
  Row,
  Col,
  Button,
  Table,
  Typography,
  Space,
  Tag,
  List,
  Select,
  Statistic,
} from "antd";
import {
  ArrowUpOutlined,
  ArrowDownOutlined,
  WalletOutlined,
  EyeOutlined,
  RiseOutlined,
  DollarOutlined,
  SafetyOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import CategoryPieChart from "../components/CategoryPieChart";
import useDashboard from "../services/dashboard/useDashboard";
import { useSettings } from "../services/settings/useSettings";
import { formatCurrency } from "../services/settings/enum/currency.enum";

const { Title, Text } = Typography;
const { Option } = Select;

export default function Dashboard() {
  const {
    filterMode,
    transactions,
    isLoading,
    summary,
    categoryExpenseStats,
    categoryIncomeStats,
    monthlyTrend,
    setFilterMode,
    refreshData,
  } = useDashboard();
  const { settings } = useSettings();

  console.log("transactions", transactions);

  const transactionColumns = [
    {
      title: "Ngày",
      dataIndex: "date",
      key: "date",
      render: (date: string) => dayjs(date).format("DD/MM/YYYY"),
      responsive: ["sm"] as any,
    },
    {
      title: "Mô tả",
      dataIndex: "desc",
      key: "desc",
      ellipsis: true,
    },
    {
      title: "Danh mục",
      dataIndex: "category",
      key: "category",
      render: (category: string) => <Tag color="blue">{category}</Tag>,
      responsive: ["md"] as any,
    },
    {
      title: "Số tiền",
      dataIndex: "amount",
      key: "amount",
      render: (amount: number) => (
        <Text type={amount > 0 ? "success" : "danger"}>
          {formatCurrency(Math.abs(amount), settings?.currency || "VND")}
        </Text>
      ),
    },
  ];

  return (
    <div style={{ padding: "16px", margin: "0 auto" }}>
      {/* Header + Filter */}
      <Card style={{ marginBottom: "16px" }}>
        <Row justify="space-between" align="middle" gutter={[16, 16]}>
          <Col xs={24} sm={12}>
            <Title level={2} style={{ margin: 0, fontSize: "clamp(1.25rem, 5vw, 1.75rem)" }}>
              Dashboard Tài Chính
            </Title>
            <Text type="secondary" style={{ fontSize: "clamp(0.75rem, 3vw, 0.875rem)" }}>
              Tổng quan về tình hình tài chính của bạn
            </Text>
          </Col>
          <Col xs={24} sm={12} style={{ textAlign: "right" }}>
            <Select
              value={filterMode}
              onChange={(val) => setFilterMode(val)}
              style={{ width: "100%", maxWidth: 160 }}
            >
              <Option value="month">Tháng này</Option>
              <Option value="year">Năm nay</Option>
              <Option value="all">Toàn bộ</Option>
            </Select>
          </Col>
        </Row>
      </Card>

      {/* Summary Cards - Responsive */}
      <Row gutter={[16, 16]} style={{ marginBottom: "16px" }}>
        <Col xs={12} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Tổng Thu Nhập"
              value={summary.totalIncome}
              precision={0}
              valueStyle={{ color: "#3f8600", fontSize: "clamp(1rem, 4vw, 1.5rem)" }}
              prefix={<ArrowUpOutlined />}
              formatter={(value) =>
                formatCurrency(Number(value), settings?.currency || "VND")
              }
            />
          </Card>
        </Col>
        <Col xs={12} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Tổng Chi Tiêu"
              value={summary.totalExpense}
              precision={0}
              valueStyle={{ color: "#cf1322", fontSize: "clamp(1rem, 4vw, 1.5rem)" }}
              prefix={<ArrowDownOutlined />}
              formatter={(value) =>
                formatCurrency(Number(value), settings?.currency || "VND")
              }
            />
          </Card>
        </Col>
        <Col xs={12} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Số Dư"
              value={summary.balance}
              precision={0}
              valueStyle={{ color: "#1890ff", fontSize: "clamp(1rem, 4vw, 1.5rem)" }}
              prefix={<DollarOutlined />}
              formatter={(value) =>
                formatCurrency(Number(value), settings?.currency || "VND")
              }
            />
          </Card>
        </Col>
        <Col xs={12} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Tỷ Lệ Tiết Kiệm"
              value={summary.savingsRate}
              precision={1}
              valueStyle={{ color: "#52c41a", fontSize: "clamp(1rem, 4vw, 1.5rem)" }}
              prefix={<SafetyOutlined />}
              suffix="%"
            />
          </Card>
        </Col>
      </Row>

      {/* Charts và Phân tích */}
      <Row gutter={[16, 16]} style={{ marginBottom: "16px" }}>
        <Col xs={24} lg={12}>
          <CategoryPieChart
            title="Phân bổ chi tiêu theo danh mục"
            data={categoryExpenseStats}
          />
        </Col>
        <Col xs={24} lg={12}>
          <CategoryPieChart
            title="Phân bổ thu nhập theo danh mục"
            data={categoryIncomeStats}
          />
        </Col>
      </Row>

      {/* Xu hướng thu chi - Optional, có thể bật lại */}
      {monthlyTrend && monthlyTrend.length > 0 && (
        <Card
          title="Xu hướng thu chi hàng tháng"
          extra={<RiseOutlined style={{ fontSize: 18 }} />}
          style={{ marginBottom: "16px" }}
        >
          <List
            dataSource={monthlyTrend}
            renderItem={(item) => (
              <List.Item>
                <Row style={{ width: "100%" }} gutter={[8, 8]}>
                  <Col xs={24} sm={6}>
                    <Text strong>{item.month}</Text>
                  </Col>
                  <Col xs={12} sm={9}>
                    <Space direction="vertical" size={0}>
                      <Text type="success" style={{ fontSize: "clamp(0.75rem, 2.5vw, 0.875rem)" }}>
                        <ArrowUpOutlined /> Thu:{" "}
                        {formatCurrency(item.income, settings?.currency || "VND")}
                      </Text>
                      <Text type="danger" style={{ fontSize: "clamp(0.75rem, 2.5vw, 0.875rem)" }}>
                        <ArrowDownOutlined /> Chi:{" "}
                        {formatCurrency(item.expense, settings?.currency || "VND")}
                      </Text>
                    </Space>
                  </Col>
                  <Col xs={12} sm={9}>
                    <Text type="secondary" style={{ fontSize: "clamp(0.75rem, 2.5vw, 0.875rem)" }}>
                      Tiết kiệm:{" "}
                      {formatCurrency(
                        item.income - item.expense,
                        settings?.currency || "VND"
                      )}
                    </Text>
                  </Col>
                </Row>
              </List.Item>
            )}
          />
        </Card>
      )}

      {/* Giao dịch gần đây */}
      <Card title="Giao dịch gần đây">
        <Table
          dataSource={transactions}
          columns={transactionColumns}
          pagination={{ pageSize: 5, simple: true }}
          size="small"
          rowKey="id"
          scroll={{ x: 400 }}
        />
      </Card>

      {/* Thao tác nhanh - Optional */}
      <Card title="Thao tác nhanh" style={{ marginTop: "16px" }}>
        <Row gutter={[8, 8]}>
          <Col xs={12} sm={6}>
            <Button type="primary" block icon={<ArrowUpOutlined />} size="middle">
              Thêm thu nhập
            </Button>
          </Col>
          <Col xs={12} sm={6}>
            <Button danger block icon={<ArrowDownOutlined />} size="middle">
              Thêm chi tiêu
            </Button>
          </Col>
          <Col xs={12} sm={6}>
            <Button block icon={<WalletOutlined />} size="middle">
              Quản lý TK
            </Button>
          </Col>
          <Col xs={12} sm={6}>
            <Button block icon={<EyeOutlined />} size="middle">
              Xem báo cáo
            </Button>
          </Col>
        </Row>
      </Card>
    </div>
  );
}