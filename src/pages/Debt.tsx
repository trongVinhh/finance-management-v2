import { useState } from "react";
import {
  Card,
  Table,
  Button,
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  Row,
  Col,
  Typography,
  Popconfirm,
  Space,
  Tag,
  Statistic,
  Tabs,
  Tooltip,
  Spin,
  DatePicker,
  Radio,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  MoneyCollectOutlined,
  CreditCardOutlined,
  SearchOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  UserOutlined,
  DollarOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
import { useDebts, type Debt } from "../services/debts/useDebts";
import { useLoans, type Loan } from "../services/loans/useLoans";
import { useNotify } from "../contexts/NotifycationContext";
import dayjs from "dayjs";

const { Title, Text } = Typography;

export default function DebtsPage() {
  const notify = useNotify();
  const { debts, loading: loadingDebts, addDebt, updateDebt, deleteDebt } = useDebts();
  const { loans, loading: loadingLoans, addLoan, updateLoan, deleteLoan } = useLoans();

  // Tab 1 (Default): Cho vay / Nợ phải thu (uses debts dataset containing Yến, Khánh, Đạt...)
  // Tab 2: Đi vay / Nợ phải trả (uses loans dataset)
  const [activeTab, setActiveTab] = useState<"debts" | "loans">("debts");
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [entryType, setEntryType] = useState<"debts" | "loans">("debts");
  const [editingItem, setEditingItem] = useState<Debt | Loan | null>(null);
  const [form] = Form.useForm();

  // Currency Formatter
  const formatMoney = (val: number) => {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(val);
  };

  // Calculations
  const totalChoVayPending = debts
    .filter((d) => d.status !== "paid")
    .reduce((acc, curr) => acc + (curr.amount || 0), 0);

  const totalDiVayPending = loans
    .filter((l) => l.status !== "paid")
    .reduce((acc, curr) => acc + (curr.amount || 0), 0);

  const netDebtPosition = totalChoVayPending - totalDiVayPending;

  // Filtered lists
  const filteredDebts = debts.filter((item) => {
    const matchName = item.lender_name?.toLowerCase().includes(searchText.toLowerCase());
    const matchNote = item.note?.toLowerCase().includes(searchText.toLowerCase());
    const isUnpaid = item.status !== "paid";
    const isPaid = item.status === "paid";
    const matchStatus =
      statusFilter === "all" ||
      (statusFilter === "unpaid" && isUnpaid) ||
      (statusFilter === "paid" && isPaid);
    return (matchName || matchNote) && matchStatus;
  });

  const filteredLoans = loans.filter((item) => {
    const matchName = item.borrower_name?.toLowerCase().includes(searchText.toLowerCase());
    const matchNote = item.note?.toLowerCase().includes(searchText.toLowerCase());
    const isUnpaid = item.status !== "paid";
    const isPaid = item.status === "paid";
    const matchStatus =
      statusFilter === "all" ||
      (statusFilter === "unpaid" && isUnpaid) ||
      (statusFilter === "paid" && isPaid);
    return (matchName || matchNote) && matchStatus;
  });

  // Handlers
  const handleOpenAdd = (type: "debts" | "loans") => {
    setEntryType(type);
    setEditingItem(null);
    form.resetFields();
    form.setFieldsValue({
      type,
      status: "pending",
      due_date: dayjs().add(1, "month"),
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: any, type: "debts" | "loans") => {
    setEntryType(type);
    setEditingItem(item);
    form.setFieldsValue({
      type,
      person_name: type === "debts" ? item.lender_name : item.borrower_name,
      amount: item.amount,
      status: item.status === "paid" ? "paid" : "pending",
      due_date: item.due_date ? dayjs(item.due_date) : null,
      note: item.note,
    });
    setIsModalOpen(true);
  };

  const handleToggleStatus = async (item: any, type: "debts" | "loans") => {
    const newStatus = item.status === "paid" ? "pending" : "paid";
    try {
      if (type === "debts") {
        await updateDebt(item.id, { status: newStatus });
      } else {
        await updateLoan(item.id, { status: newStatus });
      }
      notify(
        "success",
        "Thành công",
        `Đã cập nhật trạng thái khoản nợ thành: ${newStatus === "paid" ? "Đã thanh toán" : "Chưa thanh toán"}`
      );
    } catch (err) {
      notify("error", "Lỗi", "Không thể cập nhật trạng thái");
    }
  };

  const handleDelete = async (id: string, type: "debts" | "loans") => {
    try {
      if (type === "debts") {
        await deleteDebt(id);
      } else {
        await deleteLoan(id);
      }
      notify("success", "Đã xóa", "Đã xóa khoản nợ thành công");
    } catch (err) {
      notify("error", "Lỗi", "Xóa khoản nợ thất bại");
    }
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      const payload = {
        amount: values.amount,
        status: values.status,
        due_date: values.due_date ? values.due_date.format("YYYY-MM-DD") : "",
        note: values.note || "",
      };

      if (entryType === "debts") {
        if (editingItem) {
          await updateDebt(editingItem.id, {
            ...payload,
            lender_name: values.person_name,
          });
          notify("success", "Thành công", "Đã cập nhật khoản cho vay (nợ phải thu)");
        } else {
          await addDebt({
            ...payload,
            lender_name: values.person_name,
          });
          notify("success", "Thành công", "Đã thêm khoản cho vay mới");
        }
      } else {
        if (editingItem) {
          await updateLoan(editingItem.id, {
            ...payload,
            borrower_name: values.person_name,
          });
          notify("success", "Thành công", "Đã cập nhật khoản đi vay (nợ phải trả)");
        } else {
          await addLoan({
            ...payload,
            borrower_name: values.person_name,
          });
          notify("success", "Thành công", "Đã thêm khoản đi vay mới");
        }
      }

      setIsModalOpen(false);
      form.resetFields();
    } catch (err) {
      console.error("Form validation error:", err);
    }
  };

  // Columns for Tables
  const getColumns = (type: "debts" | "loans") => [
    {
      title: type === "debts" ? "Người vay (Nợ bạn)" : "Người cho vay (Bạn nợ họ)",
      dataIndex: type === "debts" ? "lender_name" : "borrower_name",
      key: "person",
      render: (text: string) => (
        <Space>
          <UserOutlined style={{ color: type === "debts" ? "#16a34a" : "#dc2626" }} />
          <Text strong style={{ fontSize: "15px" }}>{text}</Text>
        </Space>
      ),
    },
    {
      title: "Số tiền",
      dataIndex: "amount",
      key: "amount",
      render: (amount: number) => (
        <Text strong style={{ fontSize: "16px", color: type === "debts" ? "#16a34a" : "#dc2626" }}>
          {formatMoney(amount)}
        </Text>
      ),
    },
    {
      title: "Hạn thanh toán",
      dataIndex: "due_date",
      key: "due_date",
      render: (date: string) => (
        <Text type="secondary">
          <CalendarOutlined /> {date ? dayjs(date).format("DD/MM/YYYY") : "—"}
        </Text>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status: string) => {
        const isPaid = status === "paid";
        return (
          <Tag
            color={isPaid ? "success" : "warning"}
            icon={isPaid ? <CheckCircleOutlined /> : <ClockCircleOutlined />}
            style={{ padding: "4px 10px", borderRadius: "6px", fontSize: "13px" }}
          >
            {isPaid ? "Đã thanh toán" : "Chưa thanh toán"}
          </Tag>
        );
      },
    },
    {
      title: "Ghi chú",
      dataIndex: "note",
      key: "note",
      render: (note: string) => <Text type="secondary">{note || "—"}</Text>,
    },
    {
      title: "Thao tác",
      key: "actions",
      render: (_: any, record: any) => {
        const isPaid = record.status === "paid";
        return (
          <Space>
            <Tooltip title={isPaid ? "Đánh dấu chưa trả" : "Đánh dấu đã trả"}>
              <Button
                size="small"
                type={isPaid ? "default" : "primary"}
                icon={isPaid ? <ClockCircleOutlined /> : <CheckCircleOutlined />}
                onClick={() => handleToggleStatus(record, type)}
                style={{ borderRadius: "6px" }}
              >
                {isPaid ? "Chưa trả" : "Đã trả"}
              </Button>
            </Tooltip>
            <Tooltip title="Sửa">
              <Button
                size="small"
                icon={<EditOutlined />}
                onClick={() => handleOpenEdit(record, type)}
              />
            </Tooltip>
            <Popconfirm
              title="Xóa khoản nợ này?"
              onConfirm={() => handleDelete(record.id, type)}
              okText="Xóa"
              cancelText="Hủy"
              okButtonProps={{ danger: true }}
            >
              <Tooltip title="Xóa">
                <Button size="small" icon={<DeleteOutlined />} danger />
              </Tooltip>
            </Popconfirm>
          </Space>
        );
      },
    },
  ];

  return (
    <div style={{ padding: "24px", maxWidth: "1280px", margin: "0 auto" }}>
      {/* Header Title Banner */}
      <div style={{ marginBottom: "24px" }}>
        <Row justify="space-between" align="middle" gutter={[16, 16]}>
          <Col xs={24} md={14}>
            <Title level={2} style={{ margin: 0, fontWeight: 700, color: "#0f172a" }}>
              💸 Quản Lý Nợ
            </Title>
            <Text type="secondary" style={{ fontSize: "15px" }}>
              Theo dõi và quản lý các khoản Cho vay (Nợ phải thu) & Đi vay (Nợ phải trả)
            </Text>
          </Col>
          <Col xs={24} md={10} style={{ textAlign: "right" }}>
            <Space wrap>
              <Button
                type="primary"
                size="large"
                icon={<PlusOutlined />}
                onClick={() => handleOpenAdd("debts")}
                style={{
                  borderRadius: "10px",
                  background: "linear-gradient(135deg, #16a34a 0%, #15803d 100%)",
                  boxShadow: "0 4px 12px rgba(22, 163, 74, 0.3)",
                  height: "46px",
                  fontWeight: 600,
                }}
              >
                + Cho vay (Nợ phải thu)
              </Button>
              <Button
                type="primary"
                size="large"
                danger
                icon={<PlusOutlined />}
                onClick={() => handleOpenAdd("loans")}
                style={{
                  borderRadius: "10px",
                  background: "linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)",
                  boxShadow: "0 4px 12px rgba(220, 38, 38, 0.3)",
                  height: "46px",
                  fontWeight: 600,
                }}
              >
                + Đi vay (Nợ phải trả)
              </Button>
            </Space>
          </Col>
        </Row>
      </div>

      {/* Statistics Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
        <Col xs={24} sm={8}>
          <Card className="modern-card" bodyStyle={{ padding: "20px" }}>
            <Statistic
              title={<Text type="secondary">Cho vay (Nợ phải thu)</Text>}
              value={totalChoVayPending}
              formatter={(val) => formatMoney(Number(val))}
              prefix={<MoneyCollectOutlined style={{ color: "#16a34a" }} />}
              valueStyle={{ fontWeight: 700, color: "#16a34a" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card className="modern-card" bodyStyle={{ padding: "20px" }}>
            <Statistic
              title={<Text type="secondary">Đi vay (Nợ phải trả)</Text>}
              value={totalDiVayPending}
              formatter={(val) => formatMoney(Number(val))}
              prefix={<CreditCardOutlined style={{ color: "#dc2626" }} />}
              valueStyle={{ fontWeight: 700, color: "#dc2626" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card className="modern-card" bodyStyle={{ padding: "20px" }}>
            <Statistic
              title={<Text type="secondary">Vị thế Nợ Ròng (Thu - Trả)</Text>}
              value={netDebtPosition}
              formatter={(val) => formatMoney(Number(val))}
              prefix={<DollarOutlined style={{ color: netDebtPosition >= 0 ? "#16a34a" : "#dc2626" }} />}
              valueStyle={{
                fontWeight: 700,
                color: netDebtPosition >= 0 ? "#16a34a" : "#dc2626",
              }}
            />
          </Card>
        </Col>
      </Row>

      {/* Filters Card */}
      <Card className="modern-card" style={{ marginBottom: "24px" }} bodyStyle={{ padding: "16px 20px" }}>
        <Row gutter={[16, 16]} align="middle" justify="space-between">
          <Col xs={24} md={14}>
            <Space wrap size="middle" style={{ width: "100%" }}>
              <Input
                placeholder="Tìm tên người vay/cho vay, ghi chú..."
                prefix={<SearchOutlined style={{ color: "#94a3b8" }} />}
                allowClear
                size="large"
                value={searchText}
                style={{ width: 280, borderRadius: "8px" }}
                onChange={(e) => setSearchText(e.target.value)}
              />

              <Radio.Group
                size="large"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                buttonStyle="solid"
              >
                <Radio.Button value="all">Tất cả</Radio.Button>
                <Radio.Button value="unpaid">Chưa trả</Radio.Button>
                <Radio.Button value="paid">Đã trả</Radio.Button>
              </Radio.Group>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Main Tabs: TAB 1 (Default) = Cho vay (debts dataset), TAB 2 = Đi vay (loans dataset) */}
      <Card className="modern-card" bodyStyle={{ padding: "12px 20px 24px 20px" }}>
        <Tabs
          activeKey={activeTab}
          onChange={(key) => setActiveTab(key as "debts" | "loans")}
          size="large"
          items={[
            {
              key: "debts",
              label: (
                <Space>
                  <MoneyCollectOutlined style={{ color: "#16a34a" }} />
                  <span style={{ fontWeight: 600 }}>
                    Cho vay / Nợ phải thu ({debts.filter((d) => d.status !== "paid").length})
                  </span>
                </Space>
              ),
              children: loadingDebts ? (
                <div style={{ textAlign: "center", padding: "40px" }}><Spin size="large" /></div>
              ) : (
                <Table
                  dataSource={filteredDebts}
                  columns={getColumns("debts")}
                  rowKey="id"
                  pagination={{ pageSize: 8 }}
                />
              ),
            },
            {
              key: "loans",
              label: (
                <Space>
                  <CreditCardOutlined style={{ color: "#dc2626" }} />
                  <span style={{ fontWeight: 600 }}>
                    Đi vay / Nợ phải trả ({loans.filter((l) => l.status !== "paid").length})
                  </span>
                </Space>
              ),
              children: loadingLoans ? (
                <div style={{ textAlign: "center", padding: "40px" }}><Spin size="large" /></div>
              ) : (
                <Table
                  dataSource={filteredLoans}
                  columns={getColumns("loans")}
                  rowKey="id"
                  pagination={{ pageSize: 8 }}
                />
              ),
            },
          ]}
        />
      </Card>

      {/* Add / Edit Modal */}
      <Modal
        title={
          <span style={{ fontWeight: 700, fontSize: "18px" }}>
            {editingItem
              ? `✏️ Cập nhật thông tin ${entryType === "debts" ? "Cho vay (Nợ phải thu)" : "Đi vay (Nợ phải trả)"}`
              : `➕ Thêm khoản ${entryType === "debts" ? "Cho vay (Nợ phải thu)" : "Đi vay (Nợ phải trả)"}`}
          </span>
        }
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={handleSave}
        okText={editingItem ? "Lưu thay đổi" : "Thêm mới"}
        cancelText="Hủy"
        width={500}
      >
        <Form form={form} layout="vertical" style={{ paddingTop: "12px" }}>
          {!editingItem && (
            <Form.Item label="Loại giao dịch nợ" name="type">
              <Radio.Group
                onChange={(e) => setEntryType(e.target.value)}
                value={entryType}
                optionType="button"
                buttonStyle="solid"
                style={{ width: "100%" }}
              >
                <Radio.Button value="debts" style={{ width: "50%", textAlign: "center" }}>
                  💰 Cho vay (Nợ phải thu)
                </Radio.Button>
                <Radio.Button value="loans" style={{ width: "50%", textAlign: "center" }}>
                  💸 Đi vay (Nợ phải trả)
                </Radio.Button>
              </Radio.Group>
            </Form.Item>
          )}

          <Form.Item
            label={entryType === "debts" ? "Tên người vay (Họ nợ bạn)" : "Tên người cho vay (Bạn nợ họ)"}
            name="person_name"
            rules={[{ required: true, message: "Vui lòng nhập tên người liên quan" }]}
          >
            <Input placeholder="ví dụ: Anh Nam, Chị Hoa, Ngân hàng A..." prefix={<UserOutlined style={{ color: "#cbd5e1" }} />} />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Số tiền (VND)"
                name="amount"
                rules={[{ required: true, message: "Nhập số tiền" }]}
              >
                <InputNumber
                  style={{ width: "100%" }}
                  min={0}
                  step={50000}
                  formatter={(val) => `${val}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                  parser={(val: any) => (val ? (val.replace(/,/g, "") as any) : 0)}
                  placeholder="0"
                />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item label="Trạng thái" name="status">
                <Select
                  options={[
                    { label: "Chưa thanh toán", value: "pending" },
                    { label: "Đã thanh toán", value: "paid" },
                  ]}
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item label="Hạn hẹn trả" name="due_date">
            <DatePicker style={{ width: "100%" }} format="DD/MM/YYYY" placeholder="Chọn ngày hẹn trả" />
          </Form.Item>

          <Form.Item label="Ghi chú" name="note">
            <Input.TextArea rows={3} placeholder="Ghi chú thêm về khoản nợ (lãi suất, lý do vay...)" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
