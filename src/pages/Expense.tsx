import { useState } from "react";
import {
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
  SearchOutlined,
} from "@ant-design/icons";

const { RangePicker } = DatePicker;
const { Title, Text } = Typography;

type Income = {
  id: string;
  type: string;
  amount: number;
  note?: string;
  created_at: string;
};

export default function Expense() {
  const [incomes, setIncomes] = useState<Income[]>([
    {
      id: "1",
      type: "Lương",
      amount: 15000000,
      note: "Lương tháng 9",
      created_at: "2025-09-05",
    },
    {
      id: "2",
      type: "Thưởng",
      amount: 2000000,
      note: "Thưởng dự án",
      created_at: "2025-09-10",
    },
    {
      id: "3",
      type: "Vay Mượn",
      amount: 5000000,
      note: "Anh A trả nợ",
      created_at: "2025-09-20",
    },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);

  // State filter
  const [searchText, setSearchText] = useState("");
  const [selectedType, setSelectedType] = useState<string | undefined>();
  const [dateRange, setDateRange] = useState<[string, string] | null>(null);

  const totalIncome = incomes.reduce((sum, i) => sum + i.amount, 0);

  const columns = [
    { title: "Loại", dataIndex: "type" },
    {
      title: "Số tiền",
      dataIndex: "amount",
      render: (v: number) => (
        <Text strong style={{ color: "#52c41a" }}>
          {v.toLocaleString()} đ
        </Text>
      ),
    },
    { title: "Ghi chú", dataIndex: "note" },
    { title: "Ngày", dataIndex: "created_at" },
  ];

  // Lọc dữ liệu
  const filteredIncomes = incomes.filter((i) => {
    const matchSearch =
      !searchText || i.note?.toLowerCase().includes(searchText.toLowerCase());
    const matchType = !selectedType || i.type === selectedType;
    const matchDate =
      !dateRange ||
      (i.created_at >= dateRange[0] && i.created_at <= dateRange[1]);
    return matchSearch && matchType && matchDate;
  });

  return (
    <div className="p-4 max-w-6xl mx-auto" style={{ padding: "24px" }}>
      {/* Header */}
      <div className="mb-6 text-center">
        <Title level={2}>📊 Quản Lý Chi Tiêu</Title>
        <Text type="secondary">
          Theo dõi và quản lý các khoản chi tiêu của bạn
        </Text>
      </div>

      {/* Summary */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Tổng chi tiêu"
              value={totalIncome}
              prefix={<DollarOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic title="Số giao dịch" value={incomes.length} />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Chi tiêu trung bình"
              value={Math.round(totalIncome / incomes.length)}
            />
          </Card>
        </Col>
      </Row>

      {/* Bộ lọc */}
      <Card className="mb-6 shadow-sm">
        <div className="flex flex-wrap gap-2 md:gap-3 items-center">
          <Input
            placeholder="Tìm kiếm ghi chú..."
            prefix={<SearchOutlined />}
            allowClear
            style={{ width: 200, marginRight: "10px" }}
            onChange={(e) => setSearchText(e.target.value)}
          />

          <Select
            placeholder="Chọn loại"
            allowClear
            className="w-full md:w-40"
            style={{ marginRight: "10px" }}
            options={[
              { label: "Lương", value: "Lương" },
              { label: "Thưởng", value: "Thưởng" },
              { label: "Vay Mượn", value: "Vay Mượn" },
            ]}
            onChange={(val) => setSelectedType(val)}
          />

          <RangePicker
            className="w-full md:w-auto"
            style={{ marginRight: "10px" }}
            onChange={(dates) =>
              setDateRange(
                dates
                  ? [
                      dates[0]!.format("YYYY-MM-DD"),
                      dates[1]!.format("YYYY-MM-DD"),
                    ]
                  : null
              )
            }
          />
        </div>
      </Card>

      {/* Table */}
      <Card title="📑 Lịch sử chi tiêu">
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
