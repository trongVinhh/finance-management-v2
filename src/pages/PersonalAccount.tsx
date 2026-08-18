import { useState } from "react";
import {
  Button,
  Input,
  Select,
  Table,
  Modal,
  Space,
  Typography,
  Card,
  Row,
  Col,
  Statistic,
  Tag,
  Form,
  Popconfirm,
  Tooltip,
  Segmented,
  Spin,
  Divider,
  message,
  Grid,
} from "antd";
import {
  SearchOutlined,
  UserOutlined,
  KeyOutlined,
  EditOutlined,
  DeleteOutlined,
  CopyOutlined,
  CheckOutlined,
  AppstoreOutlined,
  UnorderedListOutlined,
  GlobalOutlined,
  LockOutlined,
  MailOutlined,
  PhoneOutlined,
  BankOutlined,
  LaptopOutlined,
  PlaySquareOutlined,
  ReadOutlined,
  DollarOutlined,
  SafetyCertificateOutlined,
  SafetyOutlined,
  LockTwoTone,
  ApiOutlined,
} from "@ant-design/icons";
import {
  usePersonalAccounts,
  type PersonalAccount,
} from "../services/personal-accounts/usePersonalAccounts";
import { useAuth } from "../contexts/AuthContext";
import { useNotify } from "../contexts/NotifycationContext";

const { Title, Text } = Typography;
const { useBreakpoint } = Grid;

export default function PersonalAccountPage() {
  const { user } = useAuth();
  const notify = useNotify();
  const screens = useBreakpoint();
  const isMobile = !screens.md;

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen p-8">
        <Card className="text-center modern-card p-6">
          <Title level={4}>Vui lòng đăng nhập để quản lý tài khoản</Title>
        </Card>
      </div>
    );
  }

  const {
    accounts,
    loading,
    addAccount,
    updateAccount,
    deleteAccount,
    fetchAccountPassword,
    refresh,
  } = usePersonalAccounts(user.id);

  const [viewMode, setViewMode] = useState<"card" | "table">("card");
  const currentViewMode = isMobile ? "card" : viewMode;
  const [filters, setFilters] = useState({
    searchText: "",
    selectedType: undefined as string | undefined,
  });

  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Security Password Modal States
  const [selectedAccount, setSelectedAccount] = useState<PersonalAccount | null>(null);
  const [showSecurityModal, setShowSecurityModal] = useState(false);
  const [confirmPass, setConfirmPass] = useState("");
  const [fetchedPassword, setFetchedPassword] = useState<string | null>(null);
  const [fetchingPassword, setFetchingPassword] = useState(false);

  // Add / Edit Modal States
  const [showFormModal, setShowFormModal] = useState(false);
  const [form] = Form.useForm<PersonalAccount>();
  const [editingAccount, setEditingAccount] = useState<PersonalAccount | null>(null);

  // 🏷️ CATEGORIES
  const accountTypes = [
    { label: "Mạng xã hội", value: "SOCIAL", color: "#0284c7", bg: "#e0f2fe", textColor: "#0369a1", icon: <GlobalOutlined /> },
    { label: "Công nghệ", value: "TECH", color: "#16a34a", bg: "#dcfce7", textColor: "#15803d", icon: <LaptopOutlined /> },
    { label: "Giải trí", value: "ENTERTAINMENT", color: "#db2777", bg: "#fce7f3", textColor: "#be185d", icon: <PlaySquareOutlined /> },
    { label: "Công việc", value: "WORK", color: "#ea580c", bg: "#ffedd5", textColor: "#c2410c", icon: <UserOutlined /> },
    { label: "Ngân hàng", value: "BANK", color: "#9333ea", bg: "#f3e8ff", textColor: "#6b21a8", icon: <BankOutlined /> },
    { label: "Tài chính", value: "FINANCE", color: "#ca8a04", bg: "#fef9c3", textColor: "#a16207", icon: <DollarOutlined /> },
    { label: "Học tập", value: "STUDY", color: "#0891b2", bg: "#cffafe", textColor: "#0e7490", icon: <ReadOutlined /> },
    { label: "Thông tin", value: "INFORMATION", color: "#4f46e5", bg: "#e0e7ff", textColor: "#3730a3", icon: <SafetyCertificateOutlined /> },
    { label: "Khác", value: "OTHER", color: "#64748b", bg: "#f1f5f9", textColor: "#475569", icon: <SafetyCertificateOutlined /> },
  ];

  const getTypeMeta = (type?: string) => {
    const uppercaseType = (type || "").toUpperCase();
    const found = accountTypes.find((t) => t.value === uppercaseType);
    return found || { label: type || "Khác", color: "#64748b", bg: "#f1f5f9", textColor: "#475569", icon: <SafetyCertificateOutlined /> };
  };

  const handleCopyText = (text?: string | null, label: string = "dữ liệu", fieldKey?: string) => {
    if (!text) {
      notify("warning", "Thông báo", `Không có ${label} để sao chép`);
      return;
    }
    navigator.clipboard.writeText(text);
    if (fieldKey) {
      setCopiedField(fieldKey);
      setTimeout(() => setCopiedField(null), 2000);
    }
    message.success(`Đã sao chép ${label}!`);
  };

  // 🔒 ON-DEMAND API PASSWORD FETCH CALL
  const handleVerifyAndFetchPassword = async () => {
    if (!confirmPass.trim()) {
      notify("warning", "Bảo mật", "Vui lòng nhập mật khẩu xác nhận");
      return;
    }

    if (!selectedAccount?.id) return;

    setFetchingPassword(true);
    message.loading({ content: "Đang tải mật khẩu từ hệ thống...", key: "pass-api" });
    
    const pwd = await fetchAccountPassword(selectedAccount.id);
    setFetchingPassword(false);

    if (pwd !== null) {
      setFetchedPassword(pwd || "(Chưa đặt mật khẩu)");
      message.success({ content: "Đã tải mật khẩu thành công!", key: "pass-api" });
    } else {
      message.error({ content: "Không thể lấy mật khẩu từ máy chủ", key: "pass-api" });
    }
  };

  const filteredAccounts = accounts.filter((a) => {
    const name = a.name?.toLowerCase() || "";
    const username = a.username?.toLowerCase() || "";
    const email = a.email?.toLowerCase() || "";
    const search = filters.searchText.toLowerCase();

    const matchSearch =
      !filters.searchText ||
      name.includes(search) ||
      username.includes(search) ||
      email.includes(search);

    const matchType = !filters.selectedType || a.type?.toUpperCase() === filters.selectedType;
    return matchSearch && matchType;
  });

  const totalAccounts = accounts.length;

  const handleAdd = () => {
    form.resetFields();
    setEditingAccount(null);
    setShowFormModal(true);
  };

  const handlePresetSelect = (presetName: string, presetType: string) => {
    form.setFieldsValue({
      name: presetName,
      type: presetType,
    });
  };

  const handleEdit = (record: PersonalAccount) => {
    setEditingAccount(record);
    form.setFieldsValue({
      type: record.type,
      name: record.name,
      username: record.username,
      email: record.email,
      phone: record.phone,
      note: record.note,
      password: "",
    });
    setShowFormModal(true);
  };

  const handleDelete = async (record: PersonalAccount) => {
    await deleteAccount(record.id!);
    notify("success", "Đã xóa", `Đã xóa tài khoản "${record.name}"`);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      if (editingAccount) {
        const payload: any = {
          id: editingAccount.id,
          name: values.name,
          type: values.type,
          username: values.username || "",
          email: values.email || "",
          phone: values.phone || "",
          note: values.note || "",
        };

        if (values.password) {
          payload.password = values.password;
        }

        await updateAccount(payload);
        notify("success", "Cập nhật thành công", values.name);
      } else {
        await addAccount({
          ...values,
          id: crypto.randomUUID(),
          user_id: user.id,
        });
        notify("success", "Thêm mới thành công", values.name);
      }

      setShowFormModal(false);
      setEditingAccount(null);
      form.resetFields();
      refresh();
    } catch (err) {
      console.error("Validation error:", err);
    }
  };

  // Clean Table View Column Mapping
  const columns = [
    {
      title: "Dịch vụ",
      key: "service",
      render: (_: any, record: PersonalAccount) => {
        const meta = getTypeMeta(record.type);
        return (
          <Space size="middle">
            <Avatar style={{ backgroundColor: meta.bg, color: meta.textColor }} icon={meta.icon} />
            <div>
              <Text strong style={{ fontSize: "15px", color: "#0f172a", display: "block" }}>{record.name}</Text>
              <span style={{ fontSize: "11px", fontWeight: 600, color: meta.textColor, background: meta.bg, padding: "2px 8px", borderRadius: "10px" }}>
                {meta.label}
              </span>
            </div>
          </Space>
        );
      },
    },
    {
      title: "Tên đăng nhập / Email",
      key: "user_identifier",
      render: (_: any, record: PersonalAccount) => (
        <Space direction="vertical" size={2}>
          {record.username && (
            <Space size={4}>
              <Text style={{ fontWeight: 500, color: "#334155" }}>{record.username}</Text>
              <Button
                type="text"
                size="small"
                icon={copiedField === `user-${record.id}` ? <CheckOutlined style={{ color: "#16a34a" }} /> : <CopyOutlined style={{ color: "#64748b" }} />}
                onClick={() => handleCopyText(record.username, "tên đăng nhập", `user-${record.id}`)}
              />
            </Space>
          )}
          {record.email && (
            <Text type="secondary" style={{ fontSize: "12px" }}>
              <MailOutlined /> {record.email}
            </Text>
          )}
          {!record.username && !record.email && <Text type="secondary">—</Text>}
        </Space>
      ),
    },
    {
      title: "Mật khẩu & Thao tác",
      key: "actions",
      render: (_: any, record: PersonalAccount) => (
        <Space>
          <Button
            type="default"
            size="small"
            onClick={() => {
              setSelectedAccount(record);
              setShowSecurityModal(true);
              setConfirmPass("");
              setFetchedPassword(null);
            }}
            style={{ borderRadius: "8px", background: "#f0f9ff", borderColor: "#bae6fd", color: "#0369a1", fontWeight: 600 }}
          >
            Lấy mật khẩu
          </Button>
          <Tooltip title="Chỉnh sửa">
            <Button
              icon={<EditOutlined style={{ color: "#94a3b8" }} />}
              type="text"
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          <Popconfirm
            title="Xóa tài khoản này?"
            onConfirm={() => handleDelete(record)}
            okText="Xóa"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}
          >
            <Tooltip title="Xóa">
              <Button icon={<DeleteOutlined style={{ color: "#f87171" }} />} type="text" danger />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: "20px", maxWidth: "1280px", margin: "0 auto" }}>
      {/* Top Vault Header */}
      <div style={{ marginBottom: "20px" }}>
        <Row justify="space-between" align="middle" gutter={[12, 12]}>
          <Col xs={16} md={16}>
            <Space align="center" size="middle">
              <div
                style={{
                  width: "46px",
                  height: "46px",
                  borderRadius: "14px",
                  background: "linear-gradient(135deg, #0284c7 0%, #0369a1 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 6px 16px rgba(2, 132, 199, 0.25)",
                }}
              >
                <SafetyOutlined style={{ fontSize: "26px", color: "#fff" }} />
              </div>
              <div>
                <Title level={3} style={{ margin: 0, fontWeight: 700, color: "#0f172a", fontSize: "22px" }}>
                  Kho Mật Khẩu
                </Title>
                <Text type="secondary" style={{ fontSize: "13px" }}>
                  Bảo mật mã hóa On-Demand • Bitwarden Standard
                </Text>
              </div>
            </Space>
          </Col>

          <Col xs={8} md={8} style={{ textAlign: "right" }}>
            <Button
              type="primary"
              size="large"
              onClick={handleAdd}
              style={{
                borderRadius: "10px",
                background: "linear-gradient(135deg, #0284c7 0%, #0369a1 100%)",
                boxShadow: "0 4px 14px rgba(2, 132, 199, 0.3)",
                height: "44px",
                fontWeight: 600,
              }}
            >
              + Thêm mới
            </Button>
          </Col>
        </Row>
      </div>

      {/* Summary Statistics */}
      <Row gutter={[12, 12]} style={{ marginBottom: "20px" }}>
        <Col xs={12} sm={6}>
          <Card className="modern-card" bodyStyle={{ padding: "14px 16px" }}>
            <Statistic
              title={<Text type="secondary" style={{ fontSize: "12px" }}>Tổng tài khoản trong kho</Text>}
              value={totalAccounts}
              prefix={<KeyOutlined style={{ color: "#0284c7" }} />}
              valueStyle={{ fontWeight: 700, fontSize: "22px", color: "#0f172a" }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card className="modern-card" bodyStyle={{ padding: "14px 16px" }}>
            <Statistic
              title={<Text type="secondary" style={{ fontSize: "12px" }}>Số loại dịch vụ</Text>}
              value={new Set(accounts.map((a) => a.type)).size}
              prefix={<AppstoreOutlined style={{ color: "#16a34a" }} />}
              valueStyle={{ fontWeight: 700, fontSize: "22px", color: "#0f172a" }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card className="modern-card" bodyStyle={{ padding: "14px 16px" }}>
            <Statistic
              title={<Text type="secondary" style={{ fontSize: "12px" }}>Mạng & Giải trí</Text>}
              value={accounts.filter((a) => a.type?.toUpperCase() === "SOCIAL" || a.type?.toUpperCase() === "ENTERTAINMENT").length}
              prefix={<GlobalOutlined style={{ color: "#d97706" }} />}
              valueStyle={{ fontWeight: 700, fontSize: "22px", color: "#0f172a" }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card className="modern-card" bodyStyle={{ padding: "14px 16px" }}>
            <Statistic
              title={<Text type="secondary" style={{ fontSize: "12px" }}>Công việc & Ngân hàng</Text>}
              value={accounts.filter((a) => a.type?.toUpperCase() === "WORK" || a.type?.toUpperCase() === "BANK" || a.type?.toUpperCase() === "FINANCE").length}
              prefix={<BankOutlined style={{ color: "#9333ea" }} />}
              valueStyle={{ fontWeight: 700, fontSize: "22px", color: "#0f172a" }}
            />
          </Card>
        </Col>
      </Row>

      {/* SEARCH BAR & SLEEK CHIP PILLS (NO ICONS IN CHIPS) */}
      <div style={{ marginBottom: "20px" }}>
        <Row gutter={[12, 12]} align="middle" justify="space-between" style={{ marginBottom: "12px" }}>
          <Col xs={24} md={18}>
            <Input
              placeholder="Tìm kiếm tài khoản, username, email..."
              prefix={<SearchOutlined style={{ color: "#94a3b8", fontSize: "18px" }} />}
              allowClear
              size="large"
              value={filters.searchText}
              style={{
                borderRadius: "12px",
                border: "1px solid #cbd5e1",
                boxShadow: "0 2px 6px rgba(0,0,0,0.02)",
                height: "48px",
              }}
              onChange={(e) => setFilters((f) => ({ ...f, searchText: e.target.value }))}
            />
          </Col>
          {!isMobile && (
            <Col md={6} style={{ textAlign: "right" }}>
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
            </Col>
          )}
        </Row>

        {/* ELEGANT HORIZONTAL CHIP PILLS (TEXT ONLY) */}
        <div className="mobile-chip-scroll">
          <button
            className="chip-btn"
            style={{
              background: filters.selectedType === undefined ? "#0284c7" : "#f1f5f9",
              color: filters.selectedType === undefined ? "#ffffff" : "#475569",
            }}
            onClick={() => setFilters((f) => ({ ...f, selectedType: undefined }))}
          >
            Tất cả ({accounts.length})
          </button>

          {accountTypes.map((t) => {
            const count = accounts.filter((a) => a.type?.toUpperCase() === t.value).length;
            const isSelected = filters.selectedType === t.value;
            return (
              <button
                key={t.value}
                className="chip-btn"
                style={{
                  background: isSelected ? "#0284c7" : t.bg,
                  color: isSelected ? "#ffffff" : t.textColor,
                  border: isSelected ? "none" : `1px solid ${t.bg}`,
                }}
                onClick={() => setFilters((f) => ({ ...f, selectedType: isSelected ? undefined : t.value }))}
              >
                {t.label} {count > 0 && <span style={{ opacity: 0.85, marginLeft: "4px" }}>({count})</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* MAIN VAULT CARD GRID VIEW */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "60px 0" }}>
          <Spin size="large" />
          <div style={{ marginTop: "16px", color: "#64748b" }}>Đang tải danh sách tài khoản...</div>
        </div>
      ) : filteredAccounts.length === 0 ? (
        <Card className="modern-card text-center" style={{ padding: "40px" }}>
          <UserOutlined style={{ fontSize: "48px", color: "#cbd5e1", marginBottom: "16px" }} />
          <Title level={4} style={{ color: "#64748b" }}>Không tìm thấy tài khoản nào</Title>
          <Text type="secondary">
            {filters.searchText || filters.selectedType
              ? "Hãy thử tìm kiếm từ khóa khác hoặc chọn xem Tất cả."
              : "Bấm '+ Thêm mới' để bắt đầu lưu trữ thông tin đăng nhập."}
          </Text>
          <div style={{ marginTop: "20px" }}>
            <Button type="primary" onClick={handleAdd}>
              Thêm tài khoản ngay
            </Button>
          </div>
        </Card>
      ) : currentViewMode === "card" ? (
        /* HIGH-END CARD GRID (NO EMBEDDED BUTTON ICONS) */
        <Row gutter={[16, 16]}>
          {filteredAccounts.map((account) => {
            const meta = getTypeMeta(account.type);
            const userKey = account.username || account.email || account.phone || "—";

            return (
              <Col xs={24} sm={12} lg={8} xl={6} key={account.id}>
                <Card
                  className="vault-card"
                  style={{
                    borderRadius: "16px",
                    border: "1px solid #e2e8f0",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.02)",
                    background: "#ffffff",
                  }}
                  bodyStyle={{ padding: "18px" }}
                >
                  {/* Top Row: Service Avatar (Has Icon) + Title + Actions */}
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "14px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", overflow: "hidden" }}>
                      <div
                        style={{
                          width: "42px",
                          height: "42px",
                          borderRadius: "12px",
                          background: meta.bg,
                          color: meta.textColor,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "18px",
                          flexShrink: 0,
                        }}
                      >
                        {meta.icon}
                      </div>
                      <div style={{ overflow: "hidden" }}>
                        <Text strong style={{ fontSize: "16px", color: "#0f172a", display: "block", lineHeight: "1.2" }} ellipsis>
                          {account.name}
                        </Text>
                        <span
                          style={{
                            fontSize: "11px",
                            fontWeight: 600,
                            color: meta.textColor,
                            background: meta.bg,
                            padding: "2px 8px",
                            borderRadius: "12px",
                            display: "inline-block",
                            marginTop: "4px",
                          }}
                        >
                          {meta.label}
                        </span>
                      </div>
                    </div>

                    <Space size={0}>
                      <Tooltip title="Sửa">
                        <Button
                          type="text"
                          size="small"
                          icon={<EditOutlined style={{ color: "#94a3b8" }} />}
                          onClick={() => handleEdit(account)}
                        />
                      </Tooltip>
                      <Popconfirm
                        title="Xóa tài khoản này?"
                        onConfirm={() => handleDelete(account)}
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

                  {/* Middle Row: Clean Username Container */}
                  <div
                    style={{
                      background: "#f8fafc",
                      borderRadius: "10px",
                      padding: "10px 12px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: "14px",
                      border: "1px solid #f1f5f9",
                    }}
                  >
                    <div style={{ overflow: "hidden", marginRight: "8px" }}>
                      <div style={{ fontSize: "10px", fontWeight: 700, color: "#94a3b8", letterSpacing: "0.5px", marginBottom: "2px" }}>
                        USERNAME / EMAIL
                      </div>
                      <Text style={{ fontSize: "14px", fontWeight: 500, color: "#334155" }} ellipsis>
                        {userKey}
                      </Text>
                    </div>

                    {userKey !== "—" && (
                      <Tooltip title="Sao chép tên đăng nhập">
                        <Button
                          type="text"
                          size="small"
                          icon={copiedField === `user-${account.id}` ? <CheckOutlined style={{ color: "#16a34a" }} /> : <CopyOutlined style={{ color: "#64748b" }} />}
                          onClick={() => handleCopyText(userKey, "tên đăng nhập", `user-${account.id}`)}
                          style={{ background: "#ffffff", borderRadius: "6px", border: "1px solid #e2e8f0" }}
                        />
                      </Tooltip>
                    )}
                  </div>

                  {/* Bottom Row: Clean Button (NO Lock Icon) */}
                  <Button
                    type="default"
                    block
                    onClick={() => {
                      setSelectedAccount(account);
                      setShowSecurityModal(true);
                      setConfirmPass("");
                      setFetchedPassword(null);
                    }}
                    style={{
                      borderRadius: "10px",
                      background: "#f0f9ff",
                      borderColor: "#bae6fd",
                      color: "#0369a1",
                      fontWeight: 600,
                      height: "40px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    Lấy mật khẩu
                  </Button>
                </Card>
              </Col>
            );
          })}
        </Row>
      ) : (
        /* TABLE VIEW */
        <Card className="modern-card" bodyStyle={{ padding: 0 }}>
          <Table
            dataSource={filteredAccounts}
            columns={columns}
            rowKey="id"
            pagination={{ pageSize: 12 }}
          />
        </Card>
      )}

      {/* MOBILE FAB FLOATING BUTTON */}
      <Button
        type="primary"
        size="large"
        className="mobile-fab-btn"
        onClick={handleAdd}
      >
        +
      </Button>

      {/* SECURITY VERIFICATION MODAL */}
      <Modal
        title={
          <Space align="center">
            <LockTwoTone twoToneColor="#0284c7" style={{ fontSize: "22px" }} />
            <span style={{ fontWeight: 700 }}>Xác Thực Tải Mật Khẩu</span>
          </Space>
        }
        open={showSecurityModal}
        onCancel={() => {
          setShowSecurityModal(false);
          setFetchedPassword(null);
          setConfirmPass("");
        }}
        footer={null}
        centered
        width={480}
      >
        {selectedAccount && (
          <div style={{ paddingTop: "8px" }}>
            <Card style={{ background: "#f8fafc", borderRadius: "12px", marginBottom: "16px" }}>
              <Row gutter={[12, 10]}>
                <Col span={12}>
                  <Text type="secondary" style={{ fontSize: "12px" }}>Tên dịch vụ:</Text>
                  <div style={{ fontWeight: 700, fontSize: "16px", color: "#0f172a" }}>{selectedAccount.name}</div>
                </Col>
                <Col span={12}>
                  <Text type="secondary" style={{ fontSize: "12px" }}>Phân loại:</Text>
                  <div>
                    <Tag color={getTypeMeta(selectedAccount.type).color}>
                      {getTypeMeta(selectedAccount.type).label}
                    </Tag>
                  </div>
                </Col>
                <Col span={24}>
                  <Divider style={{ margin: "4px 0" }} />
                </Col>
                <Col span={12}>
                  <Text type="secondary" style={{ fontSize: "12px" }}>Username:</Text>
                  <div style={{ fontWeight: 500 }}>
                    {selectedAccount.username || "—"}
                  </div>
                </Col>
                <Col span={12}>
                  <Text type="secondary" style={{ fontSize: "12px" }}>Email:</Text>
                  <div style={{ fontWeight: 500 }}>
                    {selectedAccount.email || "—"}
                  </div>
                </Col>
                {selectedAccount.note && (
                  <Col span={24}>
                    <Text type="secondary" style={{ fontSize: "12px" }}>Ghi chú:</Text>
                    <div style={{ background: "#fff", padding: "6px 10px", borderRadius: "6px", border: "1px solid #e2e8f0", marginTop: "2px", fontSize: "13px" }}>
                      {selectedAccount.note}
                    </div>
                  </Col>
                )}
              </Row>
            </Card>

            {/* ON-DEMAND PASSWORD REVEAL BOX */}
            <Card
              title={
                <Space>
                  <ApiOutlined style={{ color: "#0284c7" }} />
                  <span style={{ fontSize: "14px" }}>Tải mật khẩu từ máy chủ</span>
                </Space>
              }
              size="small"
              style={{ borderRadius: "12px" }}
            >
              {fetchedPassword !== null ? (
                <div style={{ textAlign: "center", padding: "12px 4px" }}>
                  <Text type="secondary" style={{ fontSize: "13px" }}>
                    Mật khẩu đã được tải an toàn từ Server:
                  </Text>
                  <div
                    style={{
                      fontSize: "22px",
                      fontWeight: 700,
                      letterSpacing: "1px",
                      color: "#16a34a",
                      margin: "10px 0",
                      background: "#f0fdf4",
                      padding: "10px 16px",
                      borderRadius: "8px",
                      border: "1px solid #bbf7d0",
                    }}
                  >
                    {fetchedPassword}
                  </div>
                  <Button
                    type="primary"
                    size="large"
                    onClick={() => handleCopyText(fetchedPassword, "mật khẩu")}
                    style={{ background: "#16a34a", borderRadius: "8px", width: "100%", height: "46px" }}
                  >
                    Sao chép mật khẩu
                  </Button>
                </div>
              ) : (
                <Space direction="vertical" style={{ width: "100%", padding: "4px 0" }}>
                  <Text type="secondary" style={{ fontSize: "13px" }}>
                    Nhập mật khẩu xác nhận để tải mật khẩu:
                  </Text>
                  <Input.Password
                    size="large"
                    placeholder="Mật khẩu xác nhận"
                    value={confirmPass}
                    onChange={(e) => setConfirmPass(e.target.value)}
                    onPressEnter={handleVerifyAndFetchPassword}
                    style={{ borderRadius: "8px", height: "46px" }}
                  />
                  <Button
                    type="primary"
                    size="large"
                    loading={fetchingPassword}
                    onClick={handleVerifyAndFetchPassword}
                    block
                    style={{ background: "#0284c7", borderRadius: "8px", fontWeight: 600, height: "46px" }}
                  >
                    Xác thực & Tải mật khẩu
                  </Button>
                </Space>
              )}
            </Card>
          </div>
        )}
      </Modal>

      {/* ADD / EDIT FORM MODAL */}
      <Modal
        title={
          <span style={{ fontWeight: 700, fontSize: "18px" }}>
            {editingAccount ? "✏️ Cập nhật tài khoản" : "➕ Thêm tài khoản dịch vụ"}
          </span>
        }
        open={showFormModal}
        onCancel={() => setShowFormModal(false)}
        onOk={handleSubmit}
        okText={editingAccount ? "Lưu thay đổi" : "Tạo ngay"}
        cancelText="Hủy"
        width={540}
      >
        <Form form={form} layout="vertical" style={{ paddingTop: "8px" }}>
          {/* Quick presets */}
          {!editingAccount && (
            <div style={{ marginBottom: "16px" }}>
              <Text type="secondary" style={{ fontSize: "12px", display: "block", marginBottom: "6px" }}>
                Gợi ý nhanh dịch vụ phổ biến:
              </Text>
              <Space wrap size={[6, 6]}>
                <Tag color="blue" style={{ cursor: "pointer" }} onClick={() => handlePresetSelect("Facebook", "SOCIAL")}>+ Facebook</Tag>
                <Tag color="green" style={{ cursor: "pointer" }} onClick={() => handlePresetSelect("Google / Gmail", "TECH")}>+ Google</Tag>
                <Tag color="magenta" style={{ cursor: "pointer" }} onClick={() => handlePresetSelect("Netflix", "ENTERTAINMENT")}>+ Netflix</Tag>
                <Tag color="purple" style={{ cursor: "pointer" }} onClick={() => handlePresetSelect("Vietcombank", "BANK")}>+ Vietcombank</Tag>
                <Tag color="geekblue" style={{ cursor: "pointer" }} onClick={() => handlePresetSelect("iCloud / Apple", "INFORMATION")}>+ iCloud</Tag>
                <Tag color="dark" style={{ cursor: "pointer" }} onClick={() => handlePresetSelect("Tiktok", "SOCIAL")}>+ TikTok</Tag>
              </Space>
            </div>
          )}

          <Row gutter={12}>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Phân loại dịch vụ"
                name="type"
                rules={[{ required: true, message: "Chọn loại dịch vụ" }]}
              >
                <Select
                  size="large"
                  placeholder="Chọn phân loại"
                  options={accountTypes.map((t) => ({ label: t.label, value: t.value }))}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Tên dịch vụ / Ứng dụng"
                name="name"
                rules={[{ required: true, message: "Nhập tên dịch vụ" }]}
              >
                <Input size="large" placeholder="ví dụ: Facebook, Gmail, TikTok..." />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={12}>
            <Col xs={24} sm={12}>
              <Form.Item label="Tên đăng nhập / Username" name="username">
                <Input size="large" placeholder="Username đăng nhập" prefix={<UserOutlined style={{ color: "#cbd5e1" }} />} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item label="Địa chỉ Email" name="email">
                <Input size="large" type="email" placeholder="example@gmail.com" prefix={<MailOutlined style={{ color: "#cbd5e1" }} />} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={12}>
            <Col xs={24} sm={12}>
              <Form.Item label="Số điện thoại" name="phone">
                <Input size="large" placeholder="0901..." prefix={<PhoneOutlined style={{ color: "#cbd5e1" }} />} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label={editingAccount ? "Mật khẩu (Bỏ trống nếu giữ nguyên)" : "Mật khẩu"}
                name="password"
                rules={[{ required: !editingAccount, message: "Nhập mật khẩu" }]}
              >
                <Input.Password size="large" placeholder="Mật khẩu bảo mật" prefix={<LockOutlined style={{ color: "#cbd5e1" }} />} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item label="Ghi chú thêm" name="note">
            <Input.TextArea rows={2} placeholder="Mã khôi phục 2FA, câu hỏi bảo mật, ngày hết hạn..." />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
