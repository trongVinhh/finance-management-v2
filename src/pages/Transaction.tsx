import {
  Table,
  Button,
  Card,
  Input,
  Select,
  DatePicker,
  Space,
  Tag,
  Tooltip,
  Typography,
  Row,
  Col,
  Statistic,
  Modal,
  Form,
  InputNumber,
  Popconfirm,
} from "antd";
import {
  PlusOutlined,
  SearchOutlined,
  FilterOutlined,
  EditOutlined,
  DeleteOutlined,
  ExportOutlined,
  ImportOutlined,
  UpOutlined,
  DownOutlined,
  SwapOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
import { useEffect, useMemo, useState } from "react";
import dayjs, { Dayjs } from "dayjs";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import type { ColumnsType } from "antd/es/table";
import { useAuth } from "../contexts/AuthContext";
import { useAccounts } from "../services/accounts/useAccounts";
import { useCategories } from "../services/categories/useCategories";
import { useTransactions } from "../services/transactions/useTransactions";
import { useSettings } from "../services/settings/useSettings";
import { formatCurrency } from "../services/settings/enum/currency.enum";
dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

const { Search } = Input;
const { RangePicker } = DatePicker;
const { Title, Text } = Typography;
const { Option } = Select;

interface Transaction {
  id: string;
  date: string;
  desc: string;
  amount: number;
  type: "income" | "expense" | "suddenly";
  category: string;
  account_id: string;
}

export default function Transactions() {
  const { user } = useAuth();
  const { accounts } = useAccounts(user?.id);
  const { categories } = useCategories(user?.id);
  const { settings } = useSettings();
  const {
    transactions,
    loading,
    creating,
    updating,
    deleting,
    createTransaction,
    updateTransaction,
    deleteTransaction,
    getTotalIncome,
    getTotalExpense,
    getNetAmount,
  } = useTransactions(user?.id);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [dateRange, setDateRange] = useState<[Dayjs, Dayjs] | []>([]);
  const [editingTransaction, setEditingTransaction] =
    useState<Transaction | null>(null);

  const categoriesByType = useMemo(() => {
    return {
      income: categories.filter((cat) => cat.type === "income"),
      expense: categories.filter((cat) => cat.type === "expense"),
      saving: categories.filter((cat) => cat.type === "saving"),
      suddenly: categories.filter((cat) => cat.type === "suddenly"),
    };
  }, [categories]);

  const allCategories = useMemo(() => {
    return categories.map((cat) => cat.name);
  }, [categories]);

  const totalIncome = getTotalIncome();
  const totalExpense = getTotalExpense();
  const netAmount = getNetAmount();
  const type = Form.useWatch("type", form);
  const category = Form.useWatch("category", form);

  const getTypeIcon = (type: "income" | "expense") => {
    return type === "income" ? (
      <UpOutlined style={{ color: "#52c41a" }} />
    ) : (
      <DownOutlined style={{ color: "#f5222d" }} />
    );
  };

  const getTypeColor = (amount: number): string => {
    return amount > 0 ? "#52c41a" : "#f5222d";
  };

  const getCategoryByName = (name: string) => {
    return categories.find((cat) => cat.name === name);
  };

  // Get category color
  const getCategoryColor = (categoryName: string) => {
    const category = getCategoryByName(categoryName);
    return category?.color || "blue";
  };

  const handleAddTransaction = () => {
    setEditingTransaction(null);
    form.resetFields();
    form.setFieldsValue({
      date: dayjs(),
      type: "expense",
    });
    setIsModalOpen(true);
  };

  const handleEditTransaction = (record: Transaction) => {
    setEditingTransaction(record);
    form.setFieldsValue({
      ...record,
      date: dayjs(record.date),
      amount: Math.abs(record.amount),
    });
    setIsModalOpen(true);
  };

  const handleDeleteTransaction = async (id: string) => {
    await deleteTransaction(id);
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();

      const transactionData = {
        date: values.date.format("YYYY-MM-DD"),
        desc: values.desc,
        amount: values.amount,
        type: values.type,
        category: values.category,
        account_id: values.account_id,
      };

      if (editingTransaction) {
        await updateTransaction({
          id: editingTransaction.id,
          ...transactionData,
        });
      } else {
        await createTransaction(transactionData);
      }

      setIsModalOpen(false);
      form.resetFields();
    } catch (error) {
      console.error("Validation failed:", error);
    }
  };

  const handleModalCancel = () => {
    setIsModalOpen(false);
    form.resetFields();
  };

  // Filter data
  const filteredData = transactions.filter((item: Transaction) => {
    const matchSearch =
      !searchText || item.desc.toLowerCase().includes(searchText.toLowerCase());
    const matchCategory =
      !selectedCategory || item.category === selectedCategory;
    const matchDate =
      !dateRange.length ||
      (dayjs(item.date).isSameOrAfter(dateRange[0], "day") &&
        dayjs(item.date).isSameOrBefore(dateRange[1], "day"));
    return matchSearch && matchCategory && matchDate;
  });

  // Get account name by id
  const getAccountName = (accountId: string) => {
    const account = accounts.find((a) => a.id === accountId);
    return account?.name || accountId;
  };

  useEffect(() => {
    if (!(type === "income" && category === "Lương")) {
      // Set account mặc định khi là Lương
      form.setFieldValue("account_id", settings?.default_account_id);
    }
  }, [type, category, settings, form]);

  const columns: ColumnsType<Transaction> = [
    {
      title: "Ngày",
      dataIndex: "date",
      key: "date",
      width: 120,
      sorter: (a: Transaction, b: Transaction) =>
        new Date(a.date).getTime() - new Date(b.date).getTime(),
      render: (date: string) => (
        <div className="flex items-center">
          {dayjs(date).format("DD/MM/YYYY")}
        </div>
      ),
    },
    {
      title: "Loại",
      dataIndex: "type",
      key: "type",
      width: 80,
      filters: [
        { text: "Thu nhập", value: "income" },
        { text: "Chi tiêu", value: "expense" },
      ],
      onFilter: (value, record: Transaction) => {
        return record.type === value;
      },
      render: (type: "income" | "expense") => (
        <Tooltip title={type === "income" ? "Thu nhập" : "Chi tiêu"}>
          {getTypeIcon(type)}
        </Tooltip>
      ),
    },
    {
      title: "Mô tả",
      dataIndex: "desc",
      key: "desc",
      ellipsis: { showTitle: false },
      render: (desc: string, record: Transaction) => {
        const category = getCategoryByName(record.category);
        return (
          <div>
            <div className="font-medium">{desc}</div>
            <div className="flex items-center mt-1">
              <Tag color={getCategoryColor(record.category)}>
                {category?.icon && (
                  <span className="mr-1">{category.icon}</span>
                )}
                {record.category}
              </Tag>
              <Text type="secondary" className="text-xs ml-2">
                {getAccountName(record.account_id)}
              </Text>
            </div>
          </div>
        );
      },
    },
    {
      title: "Số tiền",
      dataIndex: "amount",
      key: "amount",
      width: 150,
      align: "right" as const,
      sorter: (a: Transaction, b: Transaction) =>
        Math.abs(a.amount) - Math.abs(b.amount),
      render: (amount: number) => (
        <div className="text-right">
          <div
            className="font-bold text-lg"
            style={{ color: getTypeColor(amount) }}
          >
            {amount > 0 ? "+" : ""}
            {formatCurrency(amount, settings?.currency || "VND")}
          </div>
        </div>
      ),
    },
    {
      title: "Thao tác",
      key: "action",
      width: 120,
      render: (_: any, record: Transaction) => (
        <Space size="small">
          <Tooltip title="Sửa">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => handleEditTransaction(record)}
              className="text-blue-500"
              loading={updating}
            />
          </Tooltip>
          <Tooltip title="Xóa">
            <Popconfirm
              title="Bạn có chắc muốn xóa giao dịch này?"
              onConfirm={() => handleDeleteTransaction(record.id)}
              okText="Có"
              cancelText="Không"
            >
              <Button
                type="text"
                danger
                icon={<DeleteOutlined />}
                loading={deleting}
              />
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    },
  ];

  useEffect(() => {
    if (type === "income" && !category) {
      form.setFieldValue("category", "Lương");
    }
  }, [type, category, form]);

  return (
    <div className="p-6 bg-gray-50 min-h-screen" style={{ padding: "24px" }}>
      {/* Header */}
      <div className="mb-6">
        <Row justify="space-between" align="middle">
          <Col>
            <Title level={2} className="mb-2">
              Quản lý giao dịch
            </Title>
            <Text type="secondary">
              Theo dõi thu chi và quản lý tài chính cá nhân
            </Text>
          </Col>
          <Col>
            <Space>
              <Button
                icon={<ImportOutlined />}
                className="hidden sm:inline-flex"
              >
                Nhập Excel
              </Button>
              <Button
                icon={<ExportOutlined />}
                className="hidden sm:inline-flex"
              >
                Xuất Excel
              </Button>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleAddTransaction}
                size="middle"
              >
                Thêm giao dịch
              </Button>
            </Space>
          </Col>
        </Row>
      </div>

      {/* Statistics Cards */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={8}>
          <Card className="text-center">
            <Statistic
              title="Thu nhập"
              value={totalIncome}
              formatter={(value) =>
                formatCurrency(Number(value), settings?.currency || "VND")
              }
              valueStyle={{ color: "#52c41a" }}
              prefix={<ArrowUpOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card className="text-center">
            <Statistic
              title="Chi tiêu"
              value={totalExpense}
              formatter={(value) =>
                formatCurrency(Number(value), settings?.currency || "VND")
              }
              valueStyle={{ color: "#f5222d" }}
              prefix={<ArrowDownOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card className="text-center">
            <Statistic
              title="Số dư ròng"
              value={netAmount}
              formatter={(value) =>
                formatCurrency(Number(value), settings?.currency || "VND")
              }
              valueStyle={{ color: netAmount >= 0 ? "#52c41a" : "#f5222d" }}
              prefix={<SwapOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* Filters */}
      <Card className="mb-6">
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={6}>
            <Search
              placeholder="Tìm kiếm mô tả..."
              allowClear
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              prefix={<SearchOutlined />}
            />
          </Col>

          <Col xs={24} sm={4}>
            <Select
              placeholder="Danh mục"
              allowClear
              value={selectedCategory || undefined}
              onChange={setSelectedCategory}
              className="w-full"
              style={{ width: "160px" }}
            >
              {allCategories.map((cat) => (
                <Option key={cat} value={cat}>
                  {cat}
                </Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} sm={6}>
            <RangePicker
              placeholder={["Từ ngày", "Đến ngày"]}
              value={dateRange.length ? dateRange : null}
              onChange={(dates) =>
                setDateRange(dates ? (dates as [Dayjs, Dayjs]) : [])
              }
              className="w-full"
              format="DD/MM/YYYY"
            />
          </Col>
          <Col xs={24} sm={4}>
            <Button
              icon={<FilterOutlined />}
              onClick={() => {
                setSearchText("");
                setSelectedCategory("");
                setDateRange([]);
              }}
              className="w-full"
            >
              Xóa bộ lọc
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Transactions Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={filteredData}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} của ${total} giao dịch`,
          }}
          scroll={{ x: 800 }}
          className="transaction-table"
        />
      </Card>

      {/* Add/Edit Transaction Modal */}

      <Modal
        title={editingTransaction ? "Sửa giao dịch" : "Thêm giao dịch mới"}
        open={isModalOpen}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        okText={editingTransaction ? "Cập nhật" : "Thêm giao dịch"}
        cancelText="Hủy"
        width={600}
        destroyOnClose
        confirmLoading={creating || updating}
      >
        <Form form={form} layout="vertical" autoComplete="off">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Loại giao dịch"
                name="type"
                rules={[
                  { required: true, message: "Vui lòng chọn loại giao dịch!" },
                ]}
              >
                <Select placeholder="Chọn loại giao dịch" size="large">
                  <Option value="income">
                    <Space>
                      <UpOutlined style={{ color: "#52c41a" }} />
                      Thu nhập
                    </Space>
                  </Option>
                  <Option value="expense">
                    <Space>
                      <DownOutlined style={{ color: "#f5222d" }} />
                      Chi tiêu
                    </Space>
                  </Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Ngày"
                name="date"
                rules={[{ required: true, message: "Vui lòng chọn ngày!" }]}
              >
                <DatePicker
                  placeholder="Chọn ngày"
                  size="large"
                  className="w-full"
                  format="DD/MM/YYYY"
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label="Mô tả"
            name="desc"
            rules={[
              { required: true, message: "Vui lòng nhập mô tả!" },
              { min: 3, message: "Mô tả phải có ít nhất 3 ký tự!" },
            ]}
          >
            <Input placeholder="Ví dụ: Ăn trưa tại nhà hàng..." size="large" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Danh mục"
                name="category"
                rules={[{ required: true, message: "Vui lòng chọn danh mục!" }]}
              >
                <Select
                  placeholder="Chọn danh mục"
                  size="large"
                  showSearch
                  optionFilterProp="children"
                >
                  {Form.useWatch("type", form) === "income"
                    ? categoriesByType.income.map((cat) => (
                        <Option key={cat.id} value={cat.name}>
                          {cat.icon && <span className="mr-1">{cat.icon}</span>}
                          {cat.name}
                        </Option>
                      ))
                    : categoriesByType.expense.map((cat) => (
                        <Option key={cat.id} value={cat.name}>
                          {cat.icon && <span className="mr-1">{cat.icon}</span>}
                          {cat.name}
                        </Option>
                      ))}
                </Select>
              </Form.Item>
            </Col>
            {type === "income" && category === "Lương" ? null : (
              <Col span={12}>
                <Form.Item
                  label="Tài khoản"
                  name="account_id"
                  rules={[
                    { required: true, message: "Vui lòng chọn tài khoản!" },
                  ]}
                >
                  <Select placeholder="Chọn tài khoản" size="large">
                    {accounts.map((acc) => (
                      <Option key={acc.id} value={acc.id}>
                        {acc.name}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            )}
          </Row>

          <Form.Item
            label="Số tiền"
            name="amount"
            rules={[
              { required: true, message: "Vui lòng nhập số tiền!" },
              { type: "number", min: 1, message: "Số tiền phải lớn hơn 0!" },
            ]}
          >
            <InputNumber
              placeholder="0"
              size="large"
              className="w-full"
              formatter={(value) =>
                `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
              }
              addonAfter={settings?.currency}
              min={0}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
