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
  Tabs,
  Tooltip,
  Spin,
  DatePicker,
  Radio,
  Segmented,
  Avatar,
  Grid,
} from "antd";
import {
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  UserOutlined,
  CalendarOutlined,
  AppstoreOutlined,
  UnorderedListOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { useDebts, type Debt } from "../services/debts/useDebts";
import { useLoans, type Loan } from "../services/loans/useLoans";
import { useNotify } from "../contexts/NotifycationContext";
import dayjs from "dayjs";

const { Title, Text } = Typography;
const { useBreakpoint } = Grid;

export default function DebtsPage() {
  const notify = useNotify();
  const screens = useBreakpoint();
  const isMobile = !screens.md; // Screen width < 768px

  const { debts, loading: loadingDebts, addDebt, updateDebt, deleteDebt } = useDebts();
  const { loans, loading: loadingLoans, addLoan, updateLoan, deleteLoan } = useLoans();

  // Tab 1 (Default): Cho vay (uses debts dataset)
  // Tab 2: Đi vay (uses loans dataset)
  const [activeTab, setActiveTab] = useState<"debts" | "loans">("debts");
  const [viewMode, setViewMode] = useState<"card" | "table">("card");
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [entryType, setEntryType] = useState<"debts" | "loans">("debts");
  const [editingItem, setEditingItem] = useState<Debt | Loan | null>(null);
  const [form] = Form.useForm();

  // Always force Card View on mobile screens
  const currentViewMode = isMobile ? "card" : viewMode;

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
        `Đã cập nhật trạng thái: ${newStatus === "paid" ? "Đã thanh toán" : "Chưa thanh toán"}`
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
          notify("success", "Thành công", "Đã cập nhật khoản cho vay");
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
          notify("success", "Thành công", "Đã cập nhật khoản đi vay");
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

  // Desktop Table Columns
  const getColumns = (type: "debts" | "loans") => [
    {
      title: type === "debts" ? "Người vay (Nợ bạn)" : "Người cho vay (Bạn nợ họ)",
      dataIndex: type === "debts" ? "lender_name" : "borrower_name",
      key: "person",
      render: (text: string) => (
        <Space>
          <Avatar style={{ backgroundColor: type === "debts" ? "#dcfce7" : "#fee2e2", color: type === "debts" ? "#15803d" : "#b91c1c" }} icon={<UserOutlined />} />
          <Text strong style={{ fontSize: "15px", color: "#0f172a" }}>{text}</Text>
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
            style={{ padding: "4px 10px", borderRadius: "6px", fontSize: "13px", fontWeight: 600 }}
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
            <Button
              size="small"
              type={isPaid ? "default" : "primary"}
              onClick={() => handleToggleStatus(record, type)}
              style={{
                borderRadius: "6px",
                background: isPaid ? "#f1f5f9" : "#16a34a",
                borderColor: isPaid ? "#cbd5e1" : "#16a34a",
                fontWeight: 600,
              }}
            >
              {isPaid ? "Chưa trả" : "Đã trả"}
            </Button>
            <Tooltip title="Sửa">
              <Button
                size="small"
                icon={<EditOutlined style={{ color: "#94a3b8" }} />}
                type="text"
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
                <Button size="small" icon={<DeleteOutlined style={{ color: "#f87171" }} />} type="text" danger />
              </Tooltip>
            </Popconfirm>
          </Space>
        );
      },
    },
  ];

  return (
    <div style={{ padding: isMobile ? "12px" : "20px", maxWidth: "1280px", margin: "0 auto" }}>
      {/* Header Banner - CLEAN DESKTOP & MOBILE UX */}
      <div style={{ marginBottom: "14px" }}>
        <Row justify="space-between" align="middle" gutter={[12, 12]}>
          <Col xs={24} md={14}>
            <Title level={3} style={{ margin: 0, fontWeight: 700, color: "#0f172a", fontSize: isMobile ? "20px" : "24px" }}>
              Quản Lý Nợ
            </Title>
            <Text type="secondary" style={{ fontSize: "13px" }}>
              Sổ theo dõi Nợ phải thu & Nợ phải trả
            </Text>
          </Col>

          {/* Desktop Add Buttons (Hidden on Mobile for ultra clean view) */}
          {!isMobile && (
            <Col md={10} style={{ textAlign: "right" }}>
              <Space wrap>
                <Button
                  type="primary"
                  size="large"
                  onClick={() => handleOpenAdd("debts")}
                  style={{
                    borderRadius: "10px",
                    background: "linear-gradient(135deg, #16a34a 0%, #15803d 100%)",
                    boxShadow: "0 4px 12px rgba(22, 163, 74, 0.25)",
                    height: "44px",
                    fontWeight: 600,
                  }}
                >
                  + Cho vay
                </Button>
                <Button
                  type="primary"
                  size="large"
                  danger
                  onClick={() => handleOpenAdd("loans")}
                  style={{
                    borderRadius: "10px",
                    background: "linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)",
                    boxShadow: "0 4px 12px rgba(220, 38, 38, 0.25)",
                    height: "44px",
                    fontWeight: 600,
                  }}
                >
                  + Đi vay
                </Button>
              </Space>
            </Col>
          )}
        </Row>
      </div>

      {/* MOBILE BANKING STYLE COMPACT SUMMARY CARD */}
      <Card
        style={{
          borderRadius: "16px",
          background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
          color: "#ffffff",
          marginBottom: "16px",
          boxShadow: "0 4px 16px rgba(15, 23, 42, 0.12)",
          border: "none",
        }}
        bodyStyle={{ padding: "16px" }}
      >
        <Row gutter={[12, 12]} align="middle">
          <Col xs={24} sm={12}>
            <div style={{ fontSize: "11px", textTransform: "uppercase", color: "#94a3b8", fontWeight: 700, letterSpacing: "0.5px" }}>
              TỔNG NỢ PHẢI THU (CHO VAY)
            </div>
            <div style={{ fontSize: isMobile ? "22px" : "26px", fontWeight: 800, color: "#4ade80", margin: "4px 0" }}>
              {formatMoney(totalChoVayPending)}
            </div>
          </Col>

          <Col xs={24} sm={12}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: isMobile ? "1px solid rgba(255,255,255,0.1)" : "none", paddingTop: isMobile ? "10px" : "0" }}>
              <div>
                <div style={{ fontSize: "10px", color: "#94a3b8", fontWeight: 700 }}>NỢ PHẢI TRẢ (ĐỊ VAY)</div>
                <div style={{ fontSize: "15px", fontWeight: 700, color: "#f87171", marginTop: "2px" }}>
                  {formatMoney(totalDiVayPending)}
                </div>
              </div>

              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: "10px", color: "#94a3b8", fontWeight: 700 }}>VỊ THẾ NỢ RÒNG</div>
                <div style={{ fontSize: "15px", fontWeight: 700, color: netDebtPosition >= 0 ? "#4ade80" : "#f87171", marginTop: "2px" }}>
                  {formatMoney(netDebtPosition)}
                </div>
              </div>
            </div>
          </Col>
        </Row>
      </Card>

      {/* MOBILE SEARCH & FILTER BAR */}
      <div style={{ marginBottom: "14px" }}>
        <Input
          placeholder="Tìm kiếm người vay, ghi chú..."
          prefix={<SearchOutlined style={{ color: "#94a3b8", fontSize: "16px" }} />}
          allowClear
          size="large"
          value={searchText}
          style={{
            borderRadius: "12px",
            border: "1px solid #cbd5e1",
            marginBottom: "10px",
            height: "46px",
          }}
          onChange={(e) => setSearchText(e.target.value)}
        />

        {/* SLEEK CHIP PILLS FOR MOBILE STATUS FILTER */}
        <div style={{ display: "flex", gap: "8px", alignItems: "center", justifyContent: "space-between" }}>
          <div className="mobile-chip-scroll">
            <button
              className="chip-btn"
              style={{
                background: statusFilter === "all" ? "#0284c7" : "#f1f5f9",
                color: statusFilter === "all" ? "#ffffff" : "#475569",
              }}
              onClick={() => setStatusFilter("all")}
            >
              Tất cả
            </button>
            <button
              className="chip-btn"
              style={{
                background: statusFilter === "unpaid" ? "#e0f2fe" : "#f1f5f9",
                color: statusFilter === "unpaid" ? "#0369a1" : "#475569",
                border: statusFilter === "unpaid" ? "1px solid #bae6fd" : "none",
              }}
              onClick={() => setStatusFilter("unpaid")}
            >
              Chưa trả
            </button>
            <button
              className="chip-btn"
              style={{
                background: statusFilter === "paid" ? "#dcfce7" : "#f1f5f9",
                color: statusFilter === "paid" ? "#15803d" : "#475569",
                border: statusFilter === "paid" ? "1px solid #bbf7d0" : "none",
              }}
              onClick={() => setStatusFilter("paid")}
            >
              Đã trả
            </button>
          </div>

          {!isMobile && (
            <Segmented
              size="large"
              value={viewMode}
              onChange={(value) => setViewMode(value as "card" | "table")}
              options={[
                { value: "card", icon: <AppstoreOutlined /> },
                { value: "table", icon: <UnorderedListOutlined /> },
              ]}
              style={{ borderRadius: "10px" }}
            />
          )}
        </div>
      </div>

      {/* SHORT & CLEAN TABS (NO TRUNCATION ON MOBILE!) */}
      <Card className="modern-card" bodyStyle={{ padding: isMobile ? "8px 12px 16px 12px" : "16px" }}>
        <Tabs
          activeKey={activeTab}
          onChange={(key) => setActiveTab(key as "debts" | "loans")}
          size="large"
          items={[
            {
              key: "debts",
              label: (
                <span style={{ fontWeight: 700, fontSize: isMobile ? "14px" : "16px" }}>
                  Cho vay ({debts.filter((d) => d.status !== "paid").length})
                </span>
              ),
              children: loadingDebts ? (
                <div style={{ textAlign: "center", padding: "40px" }}><Spin size="large" /></div>
              ) : filteredDebts.length === 0 ? (
                <div style={{ textAlign: "center", padding: "40px 16px", color: "#64748b" }}>
                  Chưa có khoản cho vay nào. Bấm nút '+' bên dưới để thêm.
                </div>
              ) : currentViewMode === "card" ? (
                /* MOBILE FIRST TOUCHABLE CARD LIST FOR CHO VAY */
                <Row gutter={[12, 12]}>
                  {filteredDebts.map((item) => {
                    const isPaid = item.status === "paid";
                    return (
                      <Col xs={24} sm={12} lg={8} xl={6} key={item.id}>
                        <Card
                          className="vault-card"
                          style={{
                            borderRadius: "14px",
                            border: "1px solid #e2e8f0",
                            background: "#ffffff",
                            boxShadow: "0 2px 6px rgba(0,0,0,0.02)",
                          }}
                          bodyStyle={{ padding: "14px 16px" }}
                        >
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "10px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                              <Avatar size={40} style={{ backgroundColor: "#dcfce7", color: "#15803d", fontWeight: 700 }} icon={<UserOutlined />} />
                              <div>
                                <Text strong style={{ fontSize: "16px", color: "#0f172a", display: "block", lineHeight: "1.2" }}>
                                  {item.lender_name}
                                </Text>
                                <Tag color={isPaid ? "success" : "warning"} style={{ fontSize: "11px", borderRadius: "4px", margin: "2px 0 0 0", fontWeight: 600 }}>
                                  {isPaid ? "Đã thanh toán" : "Chưa thanh toán"}
                                </Tag>
                              </div>
                            </div>

                            <Space size={0}>
                              <Tooltip title="Sửa">
                                <Button
                                  type="text"
                                  size="small"
                                  icon={<EditOutlined style={{ color: "#94a3b8" }} />}
                                  onClick={() => handleOpenEdit(item, "debts")}
                                />
                              </Tooltip>
                              <Popconfirm
                                title="Xóa khoản nợ này?"
                                onConfirm={() => handleDelete(item.id, "debts")}
                                okText="Xóa"
                                cancelText="Hủy"
                                okButtonProps={{ danger: true }}
                              >
                                <Tooltip title="Xóa">
                                  <Button type="text" size="small" icon={<DeleteOutlined style={{ color: "#f87171" }} />} />
                                </Tooltip>
                              </Popconfirm>
                            </Space>
                          </div>

                          {/* Amount Box */}
                          <div style={{ background: "#f8fafc", borderRadius: "10px", padding: "10px 12px", marginBottom: "12px", border: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <div>
                              <div style={{ fontSize: "10px", fontWeight: 700, color: "#94a3b8" }}>SỐ TIỀN NỢ:</div>
                              <Text strong style={{ fontSize: "18px", color: "#16a34a" }}>
                                {formatMoney(item.amount)}
                              </Text>
                            </div>

                            {item.due_date && (
                              <div style={{ textAlign: "right" }}>
                                <div style={{ fontSize: "10px", fontWeight: 700, color: "#94a3b8" }}>HẠN HẸN TRẢ:</div>
                                <Text type="secondary" style={{ fontSize: "12px" }}>
                                  {dayjs(item.due_date).format("DD/MM/YYYY")}
                                </Text>
                              </div>
                            )}
                          </div>

                          {item.note && (
                            <Text type="secondary" style={{ fontSize: "12px", display: "block", marginBottom: "12px" }}>
                              📝 {item.note}
                            </Text>
                          )}

                          {/* 1-Tap Toggle Button */}
                          <Button
                            type="default"
                            block
                            onClick={() => handleToggleStatus(item, "debts")}
                            style={{
                              borderRadius: "10px",
                              background: isPaid ? "#f1f5f9" : "#f0fdf4",
                              borderColor: isPaid ? "#cbd5e1" : "#bbf7d0",
                              color: isPaid ? "#475569" : "#15803d",
                              fontWeight: 600,
                              height: "40px",
                            }}
                          >
                            {isPaid ? "Chưa trả" : "Đánh dấu Đã trả"}
                          </Button>
                        </Card>
                      </Col>
                    );
                  })}
                </Row>
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
                <span style={{ fontWeight: 700, fontSize: isMobile ? "14px" : "16px" }}>
                  Đi vay ({loans.filter((l) => l.status !== "paid").length})
                </span>
              ),
              children: loadingLoans ? (
                <div style={{ textAlign: "center", padding: "40px" }}><Spin size="large" /></div>
              ) : filteredLoans.length === 0 ? (
                <div style={{ textAlign: "center", padding: "40px 16px", color: "#64748b" }}>
                  Chưa có khoản đi vay nào. Bấm nút '+' bên dưới để thêm.
                </div>
              ) : currentViewMode === "card" ? (
                /* MOBILE FIRST TOUCHABLE CARD LIST FOR ĐI VAY */
                <Row gutter={[12, 12]}>
                  {filteredLoans.map((item) => {
                    const isPaid = item.status === "paid";
                    return (
                      <Col xs={24} sm={12} lg={8} xl={6} key={item.id}>
                        <Card
                          className="vault-card"
                          style={{
                            borderRadius: "14px",
                            border: "1px solid #e2e8f0",
                            background: "#ffffff",
                            boxShadow: "0 2px 6px rgba(0,0,0,0.02)",
                          }}
                          bodyStyle={{ padding: "14px 16px" }}
                        >
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "10px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                              <Avatar size={40} style={{ backgroundColor: "#fee2e2", color: "#b91c1c", fontWeight: 700 }} icon={<UserOutlined />} />
                              <div>
                                <Text strong style={{ fontSize: "16px", color: "#0f172a", display: "block", lineHeight: "1.2" }}>
                                  {item.borrower_name}
                                </Text>
                                <Tag color={isPaid ? "success" : "warning"} style={{ fontSize: "11px", borderRadius: "4px", margin: "2px 0 0 0", fontWeight: 600 }}>
                                  {isPaid ? "Đã thanh toán" : "Chưa thanh toán"}
                                </Tag>
                              </div>
                            </div>

                            <Space size={0}>
                              <Tooltip title="Sửa">
                                <Button
                                  type="text"
                                  size="small"
                                  icon={<EditOutlined style={{ color: "#94a3b8" }} />}
                                  onClick={() => handleOpenEdit(item, "loans")}
                                />
                              </Tooltip>
                              <Popconfirm
                                title="Xóa khoản nợ này?"
                                onConfirm={() => handleDelete(item.id, "loans")}
                                okText="Xóa"
                                cancelText="Hủy"
                                okButtonProps={{ danger: true }}
                              >
                                <Tooltip title="Xóa">
                                  <Button type="text" size="small" icon={<DeleteOutlined style={{ color: "#f87171" }} />} />
                                </Tooltip>
                              </Popconfirm>
                            </Space>
                          </div>

                          {/* Amount Box */}
                          <div style={{ background: "#f8fafc", borderRadius: "10px", padding: "10px 12px", marginBottom: "12px", border: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <div>
                              <div style={{ fontSize: "10px", fontWeight: 700, color: "#94a3b8" }}>SỐ TIỀN BẠN NỢ:</div>
                              <Text strong style={{ fontSize: "18px", color: "#dc2626" }}>
                                {formatMoney(item.amount)}
                              </Text>
                            </div>

                            {item.due_date && (
                              <div style={{ textAlign: "right" }}>
                                <div style={{ fontSize: "10px", fontWeight: 700, color: "#94a3b8" }}>HẠN HẸN TRẢ:</div>
                                <Text type="secondary" style={{ fontSize: "12px" }}>
                                  {dayjs(item.due_date).format("DD/MM/YYYY")}
                                </Text>
                              </div>
                            )}
                          </div>

                          {item.note && (
                            <Text type="secondary" style={{ fontSize: "12px", display: "block", marginBottom: "12px" }}>
                              📝 {item.note}
                            </Text>
                          )}

                          {/* 1-Tap Toggle Button */}
                          <Button
                            type="default"
                            block
                            onClick={() => handleToggleStatus(item, "loans")}
                            style={{
                              borderRadius: "10px",
                              background: isPaid ? "#f1f5f9" : "#fef2f2",
                              borderColor: isPaid ? "#cbd5e1" : "#fecaca",
                              color: isPaid ? "#475569" : "#b91c1c",
                              fontWeight: 600,
                              height: "40px",
                            }}
                          >
                            {isPaid ? "Chưa trả" : "Đánh dấu Đã trả"}
                          </Button>
                        </Card>
                      </Col>
                    );
                  })}
                </Row>
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

      {/* MOBILE FLOATING ACTION BUTTON (FAB) */}
      <Button
        type="primary"
        size="large"
        className="mobile-fab-btn"
        icon={<PlusOutlined style={{ fontSize: "24px" }} />}
        onClick={() => handleOpenAdd(activeTab)}
      />

      {/* Add / Edit Modal (MOBILE FRIENDLY WITH NO TRUNCATED LABELS) */}
      <Modal
        title={
          <span style={{ fontWeight: 700, fontSize: "18px" }}>
            {editingItem
              ? `✏️ Cập nhật khoản ${entryType === "debts" ? "Cho vay" : "Đi vay"}`
              : `Thêm khoản ${entryType === "debts" ? "Cho vay" : "Đi vay"}`}
          </span>
        }
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={handleSave}
        okText={editingItem ? "Lưu thay đổi" : "Tạo ngay"}
        cancelText="Hủy"
        centered
        width={480}
      >
        <Form form={form} layout="vertical" style={{ paddingTop: "10px", paddingBottom: "16px" }}>
          {!editingItem && (
            <Form.Item label="Loại nợ" name="type">
              <Radio.Group
                onChange={(e) => setEntryType(e.target.value)}
                value={entryType}
                optionType="button"
                buttonStyle="solid"
                style={{ width: "100%" }}
              >
                <Radio.Button value="debts" style={{ width: "50%", textAlign: "center", fontWeight: 600 }}>
                  Cho vay
                </Radio.Button>
                <Radio.Button value="loans" style={{ width: "50%", textAlign: "center", fontWeight: 600 }}>
                  Đi vay
                </Radio.Button>
              </Radio.Group>
            </Form.Item>
          )}

          <Form.Item
            label={entryType === "debts" ? "Tên người vay (Nợ bạn)" : "Tên người cho vay (Bạn nợ)"}
            name="person_name"
            rules={[{ required: true, message: "Nhập tên người vay/cho vay" }]}
          >
            <Input size="large" placeholder="Anh Nam, Chị Hoa, Ngân hàng..." prefix={<UserOutlined style={{ color: "#cbd5e1" }} />} />
          </Form.Item>

          <Row gutter={12}>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Số tiền (VND)"
                name="amount"
                rules={[{ required: true, message: "Nhập số tiền" }]}
              >
                <InputNumber
                  size="large"
                  style={{ width: "100%" }}
                  min={0}
                  step={50000}
                  formatter={(val) => `${val}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                  parser={(val: any) => (val ? (val.replace(/,/g, "") as any) : 0)}
                  placeholder="0"
                />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12}>
              <Form.Item label="Trạng thái" name="status">
                <Select
                  size="large"
                  options={[
                    { label: "Chưa thanh toán", value: "pending" },
                    { label: "Đã thanh toán", value: "paid" },
                  ]}
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item label="Hạn hẹn trả" name="due_date">
            <DatePicker size="large" style={{ width: "100%" }} format="DD/MM/YYYY" placeholder="Chọn ngày hẹn trả" />
          </Form.Item>

          <Form.Item label="Ghi chú" name="note">
            <Input.TextArea rows={2} placeholder="Mục đích vay, lãi suất hoặc thỏa thuận thêm..." />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
