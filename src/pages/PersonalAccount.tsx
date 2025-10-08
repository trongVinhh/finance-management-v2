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
} from "antd";
import {
  EyeOutlined,
  FilterOutlined,
  SearchOutlined,
  UserOutlined,
  KeyOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import {
  usePersonalAccounts,
  type PersonalAccount,
} from "../services/personal-accounts/usePersonalAccounts";
import { useAuth } from "../contexts/AuthContext";
import { useNotify } from "../contexts/NotifycationContext";

const { Title, Text } = Typography;

export default function PersonalAccountPage() {
  const { user } = useAuth();
  const {
    accounts,
    loading,
    addAccount,
    updateAccount,
    deleteAccount,
    refresh,
  } = usePersonalAccounts(user.id);
  const notify = useNotify();

  const [filters, setFilters] = useState({
    searchText: "",
    selectedType: undefined as string | undefined,
  });

  const [selectedAccount, setSelectedAccount] =
    useState<PersonalAccount | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [confirmPass, setConfirmPass] = useState("");
  const [viewPassword, setViewPassword] = useState<string | null>(null);

  const [showFormModal, setShowFormModal] = useState(false);
  const [form] = Form.useForm<PersonalAccount>();
  const [editing, setEditing] = useState<boolean>(false);

  const accountTypes = [
    { label: "ENTERTAINMENT", value: "ENTERTAINMENT" },
    { label: "INFORMATION", value: "INFORMATION" },
    { label: "TECH", value: "TECH" },
    { label: "STUDY", value: "STUDY" },
    { label: "WORK", value: "WORK" },
    { label: "FINANCE", value: "FINANCE" },
    { label: "BANK", value: "BANK" },
    { label: "SOCIAL", value: "SOCIAL" },
    { label: "OTHER", value: "OTHER" },
  ];

  const handleViewPassword = () => {
    if (confirmPass === "888888") {
      setViewPassword(selectedAccount?.password || "");
    } else {
      notify("error", "Thất bại!", "Mật khẩu không chính xác!");
    }
  };

  const filteredAccounts = accounts.filter((a) => {
    const name = a.name?.toLowerCase() || "";
    const username = a.username?.toLowerCase() || "";
    const search = filters.searchText.toLowerCase();

    const matchSearch =
      !filters.searchText || name.includes(search) || username.includes(search);

    const matchType = !filters.selectedType || a.type === filters.selectedType;
    return matchSearch && matchType;
  });
  const [editingAccount, setEditingAccount] = useState<PersonalAccount | null>(null);

  const totalAccounts = accounts.length;

  const handleAdd = () => {
    form.resetFields();
    setEditing(false);
    setShowFormModal(true);
  };

  const handleEdit = (record: PersonalAccount) => {
    setEditingAccount(record);
    form.setFieldsValue(record);
    setEditing(true);
    setShowFormModal(true);
  };

  const handleDelete = async (record: PersonalAccount) => {
    await deleteAccount(record.id!);
    notify("success", "Đã xoá", `Đã xoá tài khoản "${record.name}"`);
  };

  const handleSubmit = async () => {
    const values = await form.validateFields();

    if (editingAccount) {
      // ✅ Truyền id của account đang chỉnh sửa
      await updateAccount({ ...values, id: editingAccount.id });
      notify("success", "Cập nhật thành công", values.name);
    } else {
      await addAccount({
        ...values,
        id: crypto.randomUUID(), // gán id mới
        user_id: user.id,
      });
      notify("success", "Thêm mới thành công", values.name);
    }

    setShowFormModal(false);
    setEditingAccount(null);
    form.resetFields();
    refresh();
  };

//   const handleSubmit = async () => {
//     const values = await form.validateFields();
//     if (editing) {
//       await updateAccount(values);
//       notify("success", "Cập nhật thành công", values.name);
//     } else {
//       await addAccount({ ...values, user_id: user.id });
//       notify("success", "Thêm mới thành công", values.name);
//     }
//     setShowFormModal(false);
//     refresh();
//   };

  const columns = [
    {
      title: "Loại",
      dataIndex: "type",
      render: (v: string) => <Tag color="blue">{v}</Tag>,
    },
    { title: "Tên", dataIndex: "name", ellipsis: true },
    { title: "Tên đăng nhập", dataIndex: "username", ellipsis: true },
    { title: "Email", dataIndex: "email", ellipsis: true },
    { title: "Số điện thoại", dataIndex: "phone", ellipsis: true },
    {
      title: "Thao tác",
      render: (_: any, record: PersonalAccount) => (
        <Space>
          <Button
            icon={<EyeOutlined />}
            type="link"
            onClick={() => {
              setSelectedAccount(record);
              setShowModal(true);
              setConfirmPass("");
              setViewPassword(null);
            }}
          >
            Xem
          </Button>
          <Button
            icon={<EditOutlined />}
            type="link"
            onClick={() => handleEdit(record)}
          >
            Sửa
          </Button>
          <Popconfirm
            title="Xoá tài khoản này?"
            onConfirm={() => handleDelete(record)}
          >
            <Button icon={<DeleteOutlined />} type="link" danger>
              Xoá
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-4 max-w-6xl mx-auto" style={{ padding: "16px" }}>
      {/* Header */}
      <div className="mb-6 text-center">
        <Title level={2}>Quản Lý Tài Khoản Cá Nhân</Title>
        <Text type="secondary">
          Lưu trữ, quản lý và bảo mật thông tin đăng nhập của bạn
        </Text>
      </div>

      {/* Summary */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={12}>
          <Card>
            <Statistic
              title="Tổng số tài khoản"
              value={totalAccounts}
              prefix={<UserOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12}>
          <Card>
            <Statistic
              title="Số loại tài khoản"
              value={new Set(accounts.map((a) => a.type)).size}
            />
          </Card>
        </Col>
      </Row>

      {/* Bộ lọc */}
      <Card style={{ marginBottom: "24px" }}>
        <Space wrap style={{ width: "100%" }}>
          <Input
            placeholder="Tìm kiếm theo tên hoặc username..."
            prefix={<SearchOutlined />}
            allowClear
            value={filters.searchText}
            style={{ width: 240 }}
            onChange={(e) =>
              setFilters((f) => ({ ...f, searchText: e.target.value }))
            }
          />

          <Select
            placeholder="Chọn loại tài khoản"
            allowClear
            style={{ width: 200 }}
            options={accountTypes}
            value={filters.selectedType}
            onChange={(val) => setFilters((f) => ({ ...f, selectedType: val }))}
          />

          <Button
            icon={<FilterOutlined />}
            onClick={() =>
              setFilters({ searchText: "", selectedType: undefined })
            }
          >
            Xóa bộ lọc
          </Button>

          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAdd}
            style={{ marginLeft: "auto" }}
          >
            Thêm tài khoản
          </Button>
        </Space>
      </Card>

      {/* Bảng */}
      <Card title="📑 Danh sách tài khoản">
        <div className="overflow-x-auto">
          <Table
            loading={loading}
            dataSource={filteredAccounts}
            columns={columns}
            rowKey="id"
            pagination={{ pageSize: 10 }}
          />
        </div>
      </Card>

      {/* Modal chi tiết */}
      <Modal
        title="Chi tiết tài khoản"
        open={showModal}
        onCancel={() => setShowModal(false)}
        footer={null}
        centered
        width={window.innerWidth < 600 ? "90%" : 600}
      >
        {selectedAccount && (
          <Space direction="vertical" style={{ width: "100%" }}>
            <Row gutter={[12, 12]}>
              <Col span={12}>
                <Text strong>Loại:</Text> {selectedAccount.type}
              </Col>
              <Col span={12}>
                <Text strong>Tên:</Text> {selectedAccount.name}
              </Col>
              <Col span={12}>
                <Text strong>Tên đăng nhập:</Text> {selectedAccount.username}
              </Col>
              <Col span={12}>
                <Text strong>Email:</Text> {selectedAccount.email}
              </Col>
              <Col span={12}>
                <Text strong>Số điện thoại:</Text> {selectedAccount.phone}
              </Col>
              <Col span={24}>
                <Text strong>Ghi chú:</Text> {selectedAccount.note || "—"}
              </Col>
            </Row>

            <Card size="small" style={{ background: "#fafafa" }}>
              {viewPassword ? (
                <Text strong>
                  <KeyOutlined /> Mật khẩu: {viewPassword}
                </Text>
              ) : (
                <Space direction="vertical" style={{ width: "100%" }}>
                  <Input.Password
                    placeholder="Nhập mật khẩu xác nhận"
                    value={confirmPass}
                    onChange={(e) => setConfirmPass(e.target.value)}
                  />
                  <Button type="primary" onClick={handleViewPassword} block>
                    Xem mật khẩu
                  </Button>
                </Space>
              )}
            </Card>
          </Space>
        )}
      </Modal>

      {/* Modal thêm/sửa */}
      <Modal
        title={editing ? "Cập nhật tài khoản" : "Thêm tài khoản"}
        open={showFormModal}
        onCancel={() => setShowFormModal(false)}
        onOk={handleSubmit}
        okText={editing ? "Lưu thay đổi" : "Thêm mới"}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="Loại"
            name="type"
            rules={[{ required: true, message: "Chọn loại tài khoản" }]}
          >
            <Select options={accountTypes} placeholder="Chọn loại" />
          </Form.Item>
          <Form.Item
            label="Tên"
            name="name"
            rules={[{ required: true, message: "Nhập tên tài khoản" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item label="Tên đăng nhập" name="username">
            <Input />
          </Form.Item>
          <Form.Item label="Email" name="email">
            <Input type="email" />
          </Form.Item>
          <Form.Item label="Số điện thoại" name="phone">
            <Input />
          </Form.Item>
          <Form.Item label="Mật khẩu" name="password">
            <Input.Password />
          </Form.Item>
          <Form.Item label="Ghi chú" name="note">
            <Input.TextArea rows={2} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
