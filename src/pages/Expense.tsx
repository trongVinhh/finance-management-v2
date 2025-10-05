import { useState } from "react";
import {
  Button,
  Input,
  Select,
  Table,
  Modal,
  DatePicker,
  Space,
  Typography,
  Card,
  Row,
  Col,
  Statistic,
} from "antd";
import {
  DollarOutlined,
  FilterOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { formatCurrency } from "../services/settings/enum/currency.enum";
import { useSettings } from "../services/settings/useSettings";
import dayjs from "dayjs";
import useExpense from "../services/expenses/useExpense";

const { RangePicker } = DatePicker;
const { Title, Text } = Typography;

type Expense = {
  id: string;
  type: string;
  amount: number;
  note?: string;
  created_at: string;
};

export default function Expense() {
  const {
    expenses,
    allexpenses,
    isModalOpen,
    filters,
    summary,
    expenseTypes,
    expenseByType,
    setIsModalOpen,
    updateFilters, // Thêm này
    resetFilters,
  } = useExpense();
  const { settings } = useSettings();
  const [searchText, setSearchText] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<
    string | undefined
  >();
  const [dateRange, setDateRange] = useState<[string, string] | null>(null);
  const totalIncome =
    allexpenses.length > 0
      ? allexpenses.reduce((sum, i) => sum + i.amount, 0)
      : 0;

  const columns = [
    { title: "Loại", dataIndex: "type" },
    {
      title: "Số tiền",
      dataIndex: "amount",
      render: (v: number) => (
        <Text strong style={{ color: "#52c41a" }}>
          {formatCurrency(v, settings?.currency || "VND")}
        </Text>
      ),
    },
    { title: "Ghi chú", dataIndex: "desc" },
    {
      title: "Ngày",
      dataIndex: "created_at",
      render: (date: string) => (
        <div className="flex items-center">
          {dayjs(date).format("DD/MM/YYYY")}
        </div>
      ),
    },
  ];

  // Lọc dữ liệu
  const filteredIncomes = expenses.filter((i) => {
    const matchSearch =
      !searchText || i.desc?.toLowerCase().includes(searchText.toLowerCase());
    const matchCategory = !selectedCategory || i.category === selectedCategory;
    const matchDate =
      !dateRange ||
      (i.created_at! >= dateRange[0] && i.created_at! <= dateRange[1]);
    return matchSearch && matchCategory && matchDate;
  });

  return (
    <div className="p-4 max-w-6xl mx-auto" style={{ padding: "24px" }}>
      {/* Header */}
      <div className="mb-6 text-center">
        <Title level={2}>📊 Quản Lý Chi tiêu</Title>
        <Text type="secondary">
          Theo dõi và quản lý các chi tiêu của bạn
        </Text>
      </div>

      {/* Summary */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={12}>
          <Card>
            <Statistic
              title="Tổng chi tiêu"
              value={totalIncome}
              prefix={<DollarOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12}>
          <Card>
            <Statistic title="Số giao dịch" value={expenses.length} />
          </Card>
        </Col>
        {/* <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Thu nhập trung bình"
              value={Math.round(totalIncome / incomes.length)}
            />
          </Card>
        </Col> */}
      </Row>

      {/* Bộ lọc */}
      <Card style={{ marginBottom: "24px" }}>
        <Space wrap style={{ width: "100%" }}>
          <Input
            placeholder="Tìm kiếm ghi chú..."
            prefix={<SearchOutlined />}
            allowClear
            value={filters.searchText}
            style={{ width: 200 }}
            onChange={(e) => updateFilters({ searchText: e.target.value })}
          />

          <Select
            placeholder="Chọn loại"
            allowClear
            value={filters.selectedType}
            style={{ width: 200 }}
            options={expenseTypes} // Dùng từ hook
            onChange={(val) => updateFilters({ selectedType: val })}
          />

          <RangePicker
            value={filters.dateRange ? [dayjs(filters.dateRange[0]), dayjs(filters.dateRange[1])] : null}
            onChange={(dates) =>
              updateFilters({
                dateRange: dates
                  ? [dates[0]!.format("YYYY-MM-DD"), dates[1]!.format("YYYY-MM-DD")]
                  : null,
              })
            }
          />

          <Button
            icon={<FilterOutlined />}
            onClick={resetFilters}
          >
            Xóa bộ lọc
          </Button>
        </Space>
      </Card>

      {/* Table */}
      <Card title="📑 Lịch sử thu nhập">
        <div className="overflow-x-auto">
          <Table
            dataSource={filteredIncomes}
            rowKey="id"
            columns={columns}
            pagination={{ pageSize: 5 }}
          />
        </div>
      </Card>

      {/* Modal thêm mới */}
      <Modal
        title="Thêm Thu Nhập"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={() => setIsModalOpen(false)}
      >
        <Space direction="vertical" className="w-full">
          <Select
            placeholder="Loại thu nhập"
            options={[
              { label: "Lương", value: "Lương" },
              { label: "Thưởng", value: "Thưởng" },
              { label: "Vay Mượn", value: "Vay Mượn" },
            ]}
          />
          <Input type="number" placeholder="Số tiền" />
          <Input placeholder="Ghi chú" />
        </Space>
      </Modal>
    </div>
  );
}
