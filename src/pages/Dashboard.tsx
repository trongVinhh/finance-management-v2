import {
  Card,
  Row,
  Col,
  Button,
  Typography,
  Statistic,
  Modal,
  Table,
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
import { useState } from "react";

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
    getTransactionsByCategory,
    setFilterMode,
    setSelectedDate,
  } = useDashboard();
  const { settings } = useSettings();
  const [openModal, setOpenModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [categoryTransactions, setCategoryTransactions] = useState<any[]>([]);

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

  const handleSliceClick = (item: any) => {
    setSelectedCategory(item.category);
    setCategoryTransactions(getTransactionsByCategory(item.category));
    setOpenModal(true);
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
            onSliceClick={handleSliceClick}
          />
        </Col>
        <Col xs={24} lg={12}>
          <CategoryPieChart
            title="Phân bổ chi tiêu theo: Save & share"
            data={categorySaveAndShareStats}
            onSliceClick={handleSliceClick}
          />
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginBottom: "16px" }}>
        <Col xs={24} lg={12}>
          <CategoryPieChart
            title="Phân bổ chi tiêu theo: Bất ngờ"
            data={categorySuddenStats}
            onSliceClick={handleSliceClick}
          />
        </Col>
        <Col xs={24} lg={12}>
          <CategoryPieChart
            title="Phân bổ thu nhập theo: Thu nhập"
            data={categoryIncomeStats}
            onSliceClick={handleSliceClick}
          />
        </Col>
      </Row>

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

      {/* Modal giao dịch */}
      <Modal
        title={
          <span>
            📊 Giao dịch trong danh mục{" "}
            <b style={{ color: "#1677ff" }}>{selectedCategory}</b>
          </span>
        }
        closable={true}
        open={openModal}
        onCancel={() => {
          setSelectedCategory(null);
          setOpenModal(false);
        }}
        width="70%"
        footer={null}
        centered
      >
        <Table
          columns={[
            {
              title: "Ngày",
              dataIndex: "date",
              key: "date",
              render: (date: string) => (
                <div className="flex items-center">
                  {dayjs(date).format("DD/MM/YYYY")}
                </div>
              ),
            },
            {
              title: "Số tiền",
              dataIndex: "amount",
              key: "amount",
              render: (amount: number) => (
                <span>
                  {formatCurrency(amount, settings?.currency || 'VND')}
                </span>
              ),
            },
            {
              title: "Ghi chú",
              dataIndex: "desc",
              key: "desc",
              ellipsis: true,
              render: (note: string) => (
                <span style={{ color: "#555" }}>
                  {note || "(Không có ghi chú)"}
                </span>
              ),
            },
          ]}
          dataSource={categoryTransactions}
          rowKey="id"
          pagination={{ pageSize: 20 }}
          locale={{ emptyText: "Không có giao dịch nào trong danh mục này." }}
          scroll={{ y: 400 }}
          style={{ marginTop: 8 }}
        />
      </Modal>
    </div>
  );
}
