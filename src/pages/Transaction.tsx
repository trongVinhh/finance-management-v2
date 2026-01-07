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
  Grid,
  Popconfirm,
  FloatButton,
} from "antd";
import TransactionForm from "../components/transactions/TransactionForm";
import TransactionListMobile from "../components/transactions/TransactionListMobile";
import TransactionFilterMobile from "../components/transactions/TransactionFilterMobile";
import TransactionFormMobile from "../components/transactions/TransactionFormMobile";
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
import { useLocation } from "react-router-dom";
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
  group: string;
}

export default function Transactions() {
  const { user } = useAuth();
  const { accounts } = useAccounts(user?.id);
  const { categories, groups } = useCategories(user?.id);
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
  const [totalIncome, setTotalIncome] = useState(getTotalIncome());
  const [totalExpense, setTotalExpense] = useState(getTotalExpense());
  const [netAmount, setNetAmount] = useState(getNetAmount());
  const location = useLocation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [dateRange, setDateRange] = useState<[Dayjs, Dayjs] | []>([dayjs().startOf('month'), dayjs()]);
  const [editingTransaction, setEditingTransaction] =
    useState<Transaction | null>(null);

  const screens = Grid.useBreakpoint();
  const isMobile = !screens.md;






  const allCategories = useMemo(() => {
    return categories.map((cat) => cat.name);
  }, [categories]);

  // const totalIncome = getTotalIncome();
  // const totalExpense = getTotalExpense();
  // const netAmount = getNetAmount();
  const type = Form.useWatch("type", form);
  const category = Form.useWatch("category", form);

  const getTypeIcon = (type: "income" | "expense" | "suddenly") => {
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

  const getGroupByKey = (key: string) => {
    return groups.find((cat) => cat.key === key);
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

  const handleFormFinish = async (values: any) => {
    try {
      const transactionData = {
        date: values.date.format("YYYY-MM-DD"),
        desc: values.desc,
        amount: values.amount,
        type: values.type,
        category: values.category,
        account_id: values.account_id,
        group: values.group,
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

  const handleModalOk = () => {
    form.submit();
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

  useEffect(() => {
    const income = filteredData
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);
    const expense = filteredData
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);
    setTotalIncome(income)
    setTotalExpense(expense);
    setNetAmount(income - expense)
  }, [transactions, dateRange]);

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

  useEffect(() => {
    if (location.state?.openModal) {
      setIsModalOpen(true);
      // Xóa state sau khi mở để không lặp lại khi reload
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

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
      render: (type: "income" | "expense" | "suddenly") => (
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
        const group = getGroupByKey(record.group);

        return (
          <div className="flex flex-col gap-1">
            {/* Mô tả chính */}
            <div className="font-medium text-gray-900">
              {desc || "(Không có mô tả)"}
            </div>

            {/* Category + Group */}
            <div className="flex items-center flex-wrap gap-2 text-sm">
              <Tag
                color={getCategoryColor(record.category)}
                style={{
                  margin: 0,
                  marginRight: 6,
                  marginTop: 6,
                  borderRadius: "6px",
                  fontWeight: 500,
                  padding: "2px 8px",
                }}
              >
                {category?.icon && (
                  <span className="mr-1">{category.icon}</span>
                )}
                {category?.name || record.category}
              </Tag>

              {group && (
                <Tag
                  color="blue"
                  style={{
                    margin: 0,
                    marginRight: 6,
                    marginTop: 6,
                    borderRadius: "6px",
                    background: "#e6f4ff",
                    color: "#1677ff",
                    border: "none",
                    padding: "2px 8px",
                  }}
                >
                  {group.name}
                </Tag>
              )}
            </div>

            {/* Tài khoản */}
            <Text type="secondary" style={{ fontSize: "12px" }}>
              💳{" "}
              {record.category === "Lương"
                ? "Phân bổ"
                : getAccountName(record.account_id) || "Không rõ tài khoản"}
            </Text>
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
      render: (amount: number, record: Transaction) => (
        <div className="text-right">
          <div
            className="font-bold text-lg"
            style={{ color: getTypeColor(amount) }}
          >
            {record.type === "income" ? "+" : "-"}
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
    if (type === "income") {
      form.setFieldValue("group", "THU_NHAP");
      form.setFieldValue("category", "Lương");
    } else if (type === "expense") {
      // nếu muốn reset khi chuyển sang chi tiêu
      form.setFieldValue("group", "CHI_TIEU");
      form.setFieldValue("category", undefined);
    }
  }, [type, form]);

  return (
    <div className="p-6 bg-gray-50 min-h-screen" style={{ padding: "24px" }}>
      {/* Header */}
      <div className="mb-4">
        <Row gutter={[16, 16]} align="middle" justify="space-between">
          <Col>
            <Title level={3} style={{ margin: 0 }}>
              Quản lý giao dịch
            </Title>
            <Text type="secondary" style={{ fontSize: "13px" }}>
              Theo dõi thu chi và quản lý tài chính
            </Text>
          </Col>
          <Col>
            {!isMobile && (
              <Space wrap size={8}>
                <Button icon={<ImportOutlined />}>Nhập Excel</Button>
                <Button icon={<ExportOutlined />}>Xuất Excel</Button>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={handleAddTransaction}
                >
                  Thêm giao dịch
                </Button>
              </Space>
            )}
          </Col>
        </Row>
      </div>

      {/* Statistics */}
      <Row gutter={[12, 12]} className="mb-4">
        <Col xs={12} sm={8}>
          <Card bodyStyle={{ padding: "16px" }} className="shadow-sm">
            <Statistic
              title={<span className="text-sm text-gray-500">Thu nhập</span>}
              value={totalIncome}
              precision={0}
              valueStyle={{ color: "#3f8600", fontSize: isMobile ? "18px" : "24px", fontWeight: 600 }}
              prefix={<ArrowUpOutlined style={{ fontSize: "16px" }} />}
              suffix={<span className="text-xs text-gray-400 ml-1">{settings?.currency}</span>}
            />
          </Card>
        </Col>
        <Col xs={12} sm={8}>
          <Card bodyStyle={{ padding: "16px" }} className="shadow-sm">
            <Statistic
              title={<span className="text-sm text-gray-500">Chi tiêu</span>}
              value={totalExpense}
              precision={0}
              valueStyle={{ color: "#cf1322", fontSize: isMobile ? "18px" : "24px", fontWeight: 600 }}
              prefix={<ArrowDownOutlined style={{ fontSize: "16px" }} />}
              suffix={<span className="text-xs text-gray-400 ml-1">{settings?.currency}</span>}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card bodyStyle={{ padding: "16px" }} className="shadow-sm">
            <Statistic
              title={<span className="text-sm text-gray-500">Số dư ròng</span>}
              value={netAmount}
              precision={0}
              valueStyle={{
                color: netAmount >= 0 ? "#3f8600" : "#cf1322",
                fontSize: isMobile ? "18px" : "24px", fontWeight: 600
              }}
              prefix={<SwapOutlined style={{ fontSize: "16px" }} />}
              suffix={<span className="text-xs text-gray-400 ml-1">{settings?.currency}</span>}
            />
          </Card>
        </Col>
      </Row>

      {/* Filters */}
      <Card className="mb-6" bodyStyle={{ padding: isMobile ? "8px 12px" : "24px" }}>
        {isMobile ? (
          <TransactionFilterMobile
            searchText={searchText}
            selectedCategory={selectedCategory}
            dateRange={dateRange}
            allCategories={allCategories}
            onSearchChange={setSearchText}
            onCategoryChange={setSelectedCategory}
            onDateRangeChange={setDateRange}
            onClearFilters={() => {
              setSearchText("");
              setSelectedCategory("");
              setDateRange([]);
            }}
          />
        ) : (
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
        )}
      </Card>

      {/* Transactions Table or List */}
      <Card>
        {isMobile ? (
          <TransactionListMobile
            data={filteredData}
            loading={loading}
            categories={categories}
            onEdit={handleEditTransaction}
            settings={settings}
          />
        ) : (
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
        )}
      </Card>

      {/* Add/Edit Transaction Modal/Drawer */}
      {isMobile ? (
        <TransactionFormMobile
          isOpen={isModalOpen}
          editingTransaction={editingTransaction}
          form={form}
          type={type}
          category={category}
          groups={groups}
          categories={categories}
          accounts={accounts}
          settings={settings}
          creating={creating}
          updating={updating}
          deleting={deleting}
          onClose={handleModalCancel}
          onSubmit={handleModalOk}
          onDelete={handleDeleteTransaction}
          onFormFinish={handleFormFinish}
        />
      ) : (
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
          <TransactionForm
            form={form}
            type={type}
            category={category}
            groups={groups}
            categories={categories}
            accounts={accounts}
            settings={settings}
            onFinish={handleFormFinish}
          />
        </Modal>
      )
      }

      {/* Mobile Floating Action Button */}
      {isMobile && (
        <FloatButton
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleAddTransaction}
          style={{ right: 24, bottom: 24, width: 50, height: 50 }}
        />
      )}
    </div >
  );
}
