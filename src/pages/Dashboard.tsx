import {
  Card,
  Row,
  Col,
  Button,
  Typography,
  Statistic,
} from "antd";
import {
  ArrowUpOutlined,
  ArrowDownOutlined,
  WalletOutlined,
  SettingOutlined,
  TagOutlined,
} from "@ant-design/icons";
import dayjs, { Dayjs } from "dayjs";
import CategoryPieChart from "../components/CategoryPieChart";
import useDashboard from "../services/dashboard/useDashboard";
import { useSettings } from "../services/settings/useSettings";
import { formatCurrency } from "../services/settings/enum/currency.enum";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import DashboardFilters from "../components/DashboardFilters";

const { Title, Text } = Typography;

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    filterMode,
    summary,
    categoryExpenseStats,
    categoryIncomeStats,
    categorySuddenStats,
    categorySaveAndShareStats,
    setFilterMode,
    setSelectedDate,
  } = useDashboard();
  const { settings } = useSettings();

  // const transactionColumns = [
  //   {
  //     title: "Ngày",
  //     dataIndex: "date",
  //     key: "date",
  //     render: (date: string) => dayjs(date).format("DD/MM/YYYY"),
  //     responsive: ["sm"] as any,
  //   },
  //   {
  //     title: "Mô tả",
  //     dataIndex: "desc",
  //     key: "desc",
  //     ellipsis: true,
  //   },
  //   {
  //     title: "Danh mục",
  //     dataIndex: "category",
  //     key: "category",
  //     render: (category: string) => <Tag color="blue">{category}</Tag>,
  //     responsive: ["md"] as any,
  //   },
  //   {
  //     title: "Số tiền",
  //     dataIndex: "amount",
  //     key: "amount",
  //     render: (amount: number) => (
  //       <Text type={amount > 0 ? "success" : "danger"}>
  //         {formatCurrency(Math.abs(amount), settings?.currency || "VND")}
  //       </Text>
  //     ),
  //   },
  // ];

  const handleFilterChange = (
    date: Dayjs | null,
    mode: "month" | "year" | "all"
  ) => {
    console.log("Filter:", mode, "Date:", date?.format("YYYY-MM-DD"));
    if (mode === "month" && date) {
      setSelectedDate(date); // Lưu tháng được chọn
    } else if (mode === "year" && date) {
      setSelectedDate(date); // Lưu năm được chọn
    } else if (mode === "all") {
      setSelectedDate(dayjs()); // Reset về hiện tại
    }
  };

  return (
    <div style={{ padding: "16px", margin: "0 auto" }}>
      {/* Header + Filter */}
      <Card style={{ marginBottom: "16px" }}>
        <Row justify="space-between" align="middle" gutter={[16, 16]}>
          <Col xs={24} sm={18}>
            <Title
              level={2}
              style={{
                margin: 0,
                fontSize: "clamp(1.25rem, 5vw, 1.75rem)",
              }}
            >
              Dashboard Tài Chính
            </Title>

            <Text
              type="secondary"
              style={{
                display: "block",
                marginBottom: 8,
                fontSize: "clamp(0.75rem, 3vw, 0.875rem)",
              }}
            >
              Tổng quan về tình hình tài chính của bạn
            </Text>

            {/* Bộ lọc nằm ngay dưới tiêu đề */}
            {/* <Select
              value={filterMode}
              onChange={(val) => setFilterMode(val)}
              style={{
                width: "100%",
                maxWidth: 160,
                marginTop: 16,
              }}
            >
              <Option value="month">Tháng này</Option>
              <Option value="year">Năm nay</Option>
              <Option value="all">Toàn bộ</Option>
            </Select> */}
            <DashboardFilters
              filterMode={filterMode}
              setFilterMode={setFilterMode}
              onFilterChange={handleFilterChange}
            />
          </Col>

          {/* Xin chào user */}
          <Col
            xs={24}
            sm={6}
            style={{
              textAlign: "right",
              fontSize: "clamp(0.8rem, 2.5vw, 1rem)",
            }}
            className="greeting-col"
          >
            Xin chào, {user.email}
          </Col>
        </Row>

        <style>{`
          @media (max-width: 576px) {
            .greeting-col {
              text-align: center !important;
              margin-top: 12px;
              color: rgba(0, 0, 0, 0.65);
            }
          }
        `}</style>
      </Card>

      {/* Summary Cards - Responsive */}
      <Row gutter={[16, 16]} style={{ marginBottom: "16px" }}>
        <Col xs={12} sm={12} lg={6}>
          <Card
            bodyStyle={{
              padding: "8px",
              display: "flex",
              alignItems: "center",
              height: "80px",
            }}
          >
            <Statistic
              title="Tổng Thu Nhập"
              value={summary.totalIncome}
              precision={0}
              valueStyle={{
                color: "#3f8600",
                fontSize: "clamp(1rem, 4vw, 1.5rem)",
              }}
              prefix={<ArrowUpOutlined />}
              formatter={(value) =>
                formatCurrency(Number(value), settings?.currency || "VND")
              }
            />
          </Card>
        </Col>
        <Col xs={12} sm={12} lg={6}>
          <Card
            bodyStyle={{
              padding: "8px",
              display: "flex",
              alignItems: "center",
              height: "80px",
            }}
          >
            <Statistic
              title="Tổng Chi Tiêu"
              value={summary.totalExpense}
              precision={0}
              valueStyle={{
                color: "#cf1322",
                fontSize: "clamp(1rem, 4vw, 1.5rem)",
              }}
              prefix={<ArrowDownOutlined />}
              formatter={(value) =>
                formatCurrency(Number(value), settings?.currency || "VND")
              }
            />
          </Card>
        </Col>
        <Col xs={12} sm={12} lg={6}>
          <Card
            bodyStyle={{
              padding: "8px",
              display: "flex",
              alignItems: "center",
              height: "80px",
            }}
          >
            <Statistic
              title="Tổng Save & Share"
              value={summary.totalSaveAndShare}
              precision={0}
              valueStyle={{
                color: "#cf1322",
                fontSize: "clamp(1rem, 4vw, 1.5rem)",
              }}
              prefix={<ArrowDownOutlined />}
              formatter={(value) =>
                formatCurrency(Number(value), settings?.currency || "VND")
              }
            />
          </Card>
        </Col>
        <Col xs={12} sm={12} lg={6}>
          <Card
            bodyStyle={{
              padding: "8px",
              display: "flex",
              alignItems: "center",
              height: "80px",
            }}
          >
            <Statistic
              title="Tổng Bất Ngờ"
              value={summary.totalSuddenly}
              precision={0}
              valueStyle={{
                color: "#cf1322",
                fontSize: "clamp(1rem, 4vw, 1.5rem)",
              }}
              prefix={<ArrowDownOutlined />}
              formatter={(value) =>
                formatCurrency(Number(value), settings?.currency || "VND")
              }
            />
          </Card>
        </Col>
      </Row>

      {/* Charts và Phân tích */}
      <Row gutter={[16, 16]} style={{ marginBottom: "16px" }}>
        <Col xs={24} lg={12}>
          <CategoryPieChart
            title="Phân bổ chi tiêu theo: Chi tiêu"
            data={categoryExpenseStats}
          />
        </Col>
        <Col xs={24} lg={12}>
          <CategoryPieChart
            title="Phân bổ chi tiêu theo: Save & share"
            data={categorySaveAndShareStats}
          />
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginBottom: "16px" }}>
        <Col xs={24} lg={12}>
          <CategoryPieChart
            title="Phân bổ chi tiêu theo: Bất ngờ"
            data={categorySuddenStats}
          />
        </Col>
        <Col xs={24} lg={12}>
          <CategoryPieChart
            title="Phân bổ thu nhập theo: Thu nhập"
            data={categoryIncomeStats}
          />
        </Col>
      </Row>

      {/* Xu hướng thu chi - Optional, có thể bật lại */}
      {/* {monthlyTrend && monthlyTrend.length > 0 && (
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
                      <Text
                        type="success"
                        style={{ fontSize: "clamp(0.75rem, 2.5vw, 0.875rem)" }}
                      >
                        <ArrowUpOutlined /> Thu:{" "}
                        {formatCurrency(
                          item.income,
                          settings?.currency || "VND"
                        )}
                      </Text>
                      <Text
                        type="danger"
                        style={{ fontSize: "clamp(0.75rem, 2.5vw, 0.875rem)" }}
                      >
                        <ArrowDownOutlined /> Chi:{" "}
                        {formatCurrency(
                          item.expense,
                          settings?.currency || "VND"
                        )}
                      </Text>
                    </Space>
                  </Col>
                  <Col xs={12} sm={9}>
                    <Text
                      type="secondary"
                      style={{ fontSize: "clamp(0.75rem, 2.5vw, 0.875rem)" }}
                    >
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
      )} */}

      {/* Giao dịch gần đây */}
      {/* <Card title="Giao dịch gần đây">
        <Table
          dataSource={transactions}
          columns={transactionColumns}
          pagination={{ pageSize: 5, simple: true }}
          size="small"
          rowKey="id"
          scroll={{ x: 400 }}
        />
      </Card> */}

      {/* Thao tác nhanh - Optional */}
      <Card title="Thao tác nhanh" style={{ marginTop: "16px" }}>
        <Row gutter={[8, 8]}>
          <Col xs={12} sm={6}>
            <Button
              type="primary"
              block
              icon={<ArrowUpOutlined />}
              size="middle"
              onClick={() =>
                navigate("/transactions", { state: { openModal: true } })
              }
            >
              Thêm giao dịch
            </Button>
          </Col>
          <Col xs={12} sm={6}>
            <Button
              block
              icon={<WalletOutlined />}
              size="middle"
              onClick={() => navigate("/accounts")}
            >
              Quản lý TK
            </Button>
          </Col>
          <Col xs={12} sm={6}>
            <Button
              block
              icon={<SettingOutlined />}
              size="middle"
              onClick={() => navigate("/settings")}
            >
              Cài đặt
            </Button>
          </Col>
          <Col xs={12} sm={6}>
            <Button
              block
              icon={<TagOutlined />}
              size="middle"
              onClick={() => navigate("/categories")}
            >
              Quản lí danh mục
            </Button>
          </Col>
        </Row>
      </Card>
    </div>
  );
}
