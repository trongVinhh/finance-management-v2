import { useState } from "react";
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
} from "antd";
import {
  ArrowUpOutlined,
  ArrowDownOutlined,
  WalletOutlined,
  EyeOutlined,
  RiseOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import CategoryPieChart from "../components/CategoryPieChart";

const { Title, Text } = Typography;
const { Option } = Select;

const mockData = {
  summary: {
    totalIncome: 15000000,
    totalExpense: 8500000,
    balance: 6500000,
    savingsRate: 43.3,
  },
  recentTransactions: [
    {
      id: 1,
      date: "2024-01-15",
      description: "Lương tháng 1",
      amount: 8000000,
      type: "income",
      category: "Lương",
    },
    {
      id: 2,
      date: "2024-02-14",
      description: "Mua sắm",
      amount: -500000,
      type: "expense",
      category: "Mua sắm",
    },
    {
      id: 3,
      date: "2024-03-13",
      description: "Ăn uống",
      amount: -200000,
      type: "expense",
      category: "Ăn uống",
    },
    {
      id: 4,
      date: "2024-04-12",
      description: "Thuê nhà",
      amount: -3000000,
      type: "expense",
      category: "Nhà ở",
    },
    {
      id: 5,
      date: "2024-04-10",
      description: "Freelance",
      amount: 2000000,
      type: "income",
      category: "Freelance",
    },
  ],
  categoryStats: [
    {
      category: "Ăn uống",
      amount: 1200000,
      percentage: 14.1,
      color: "#ff4d4f",
    },
    { category: "Nhà ở", amount: 3000000, percentage: 35.3, color: "#1890ff" },
    { category: "Mua sắm", amount: 800000, percentage: 9.4, color: "#52c41a" },
    {
      category: "Giao thông",
      amount: 500000,
      percentage: 5.9,
      color: "#faad14",
    },
    { category: "Giải trí", amount: 600000, percentage: 7.1, color: "#722ed1" },
    { category: "Khác", amount: 2400000, percentage: 28.2, color: "#8c8c8c" },
  ],
  monthlyTrend: [
    { month: "Tháng 10", income: 12000000, expense: 7000000 },
    { month: "Tháng 11", income: 13000000, expense: 7500000 },
    { month: "Tháng 12", income: 14000000, expense: 8000000 },
    { month: "Tháng 1", income: 15000000, expense: 8500000 },
  ],
};

export default function Dashboard() {
  const [filterMode, setFilterMode] = useState<"month" | "year" | "all">("all");

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);

  // Filter giao dịch theo tháng/năm
  const filteredTransactions = mockData.recentTransactions.filter((t) => {
    const d = dayjs(t.date);
    if (filterMode === "month") {
      return d.isSame(dayjs(), "month");
    } else if (filterMode === "year") {
      return d.isSame(dayjs(), "year");
    }
    return true; // all
  });

  const transactionColumns = [
    {
      title: "Ngày",
      dataIndex: "date",
      key: "date",
      render: (date: string) => dayjs(date).format("DD/MM/YYYY"),
    },
    { title: "Mô tả", dataIndex: "description", key: "description" },
    {
      title: "Danh mục",
      dataIndex: "category",
      key: "category",
      render: (category: string) => <Tag color="blue">{category}</Tag>,
    },
    {
      title: "Số tiền",
      dataIndex: "amount",
      key: "amount",
      render: (amount: number) => (
        <Text type={amount > 0 ? "success" : "danger"}>
          {formatCurrency(Math.abs(amount))}
        </Text>
      ),
    },
  ];

  return (
    <div className="dashboard-container" style={{ padding: "24px" }}>
      {/* Header + Filter */}
      <Card style={{ marginBottom: "24px" }}>
        <Row justify="space-between" align="middle">
          <Col>
            <Title level={2} style={{ margin: 0 }}>
              Dashboard Tài Chính
            </Title>
            <Text type="secondary">
              Tổng quan về tình hình tài chính của bạn
            </Text>
          </Col>
          <Col>
            <Select
              value={filterMode}
              onChange={(val) => setFilterMode(val)}
              style={{ width: 160 }}
            >
              <Option value="month">Tháng này</Option>
              <Option value="year">Năm nay</Option>
              <Option value="all">Toàn bộ</Option>
            </Select>
          </Col>
        </Row>
      </Card>
      {/* ... giữ nguyên các phần khác như summary, charts ... */}
      {/* Charts và Phân tích */}{" "}
      <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
        {" "}
        <Col xs={24} lg={12}>
          {" "}
          <CategoryPieChart
            title="Phân bổ chi tiêu theo danh mục"
            data={mockData.categoryStats}
          />{" "}
        </Col>{" "}
        <Col xs={24} lg={12}>
          {" "}
          <Card
            title="Xu hướng thu chi hàng tháng"
            extra={<RiseOutlined style={{ fontSize: 18 }} />}
          >
            {" "}
            <List
              dataSource={mockData.monthlyTrend}
              renderItem={(item) => (
                <List.Item>
                  {" "}
                  <Row style={{ width: "100%" }}>
                    {" "}
                    <Col span={6}>
                      <Text strong>{item.month}</Text>
                    </Col>{" "}
                    <Col span={9}>
                      {" "}
                      <Space direction="vertical" size={0}>
                        {" "}
                        <Text type="success">
                          {" "}
                          <ArrowUpOutlined /> Thu: {formatCurrency(
                            item.income
                          )}{" "}
                        </Text>{" "}
                        <Text type="danger">
                          {" "}
                          <ArrowDownOutlined /> Chi:{" "}
                          {formatCurrency(item.expense)}{" "}
                        </Text>{" "}
                      </Space>{" "}
                    </Col>{" "}
                    <Col span={9}>
                      {" "}
                      <Text type="secondary">
                        {" "}
                        Tiết kiệm: {formatCurrency(
                          item.income - item.expense
                        )}{" "}
                      </Text>{" "}
                    </Col>{" "}
                  </Row>{" "}
                </List.Item>
              )}
            />{" "}
          </Card>{" "}
        </Col>{" "}
      </Row>
      {/* Giao dịch gần đây */}
      <Card title="Giao dịch gần đây">
        <Table
          dataSource={filteredTransactions}
          columns={transactionColumns}
          pagination={{ pageSize: 5 }}
          size="small"
          rowKey="id"
        />
      </Card>
      <Card title="Thao tác nhanh" style={{ marginTop: "24px" }}>
        <Row gutter={[16, 16]}>
          <Col xs={12} sm={6}>
            {" "}
            <Button type="primary" block icon={<ArrowUpOutlined />}>
              {" "}
              Thêm thu nhập{" "}
            </Button>{" "}
          </Col>
          <Col xs={12} sm={6}>
            {" "}
            <Button danger block icon={<ArrowDownOutlined />}>
              {" "}
              Thêm chi tiêu{" "}
            </Button>{" "}
          </Col>
          <Col xs={12} sm={6}>
            {" "}
            <Button block icon={<WalletOutlined />}>
              {" "}
              Quản lý tài khoản{" "}
            </Button>{" "}
          </Col>{" "}
          <Col xs={12} sm={6}>
            <Button block icon={<EyeOutlined />}>
              {" "}
              Xem báo cáo{" "}
            </Button>
          </Col>
        </Row>
      </Card>
    </div>
  );
}
