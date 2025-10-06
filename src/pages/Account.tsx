import {
  Card,
  List,
  Button,
  Typography,
  Row,
  Col,
  Divider,
  Tag,
  Avatar,
  Modal,
  Form,
  Input,
  Select,
  InputNumber,
  message,
  Spin,
  Popconfirm,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SaveOutlined,
  WalletOutlined,
  CreditCardOutlined,
  BankOutlined,
  DollarOutlined,
} from "@ant-design/icons";
import { useEffect, useState } from "react";
import { useAccounts } from "../services/accounts/useAccounts";
import { AccountType } from "../services/accounts/enum/account-type.enum";
import { useAuth } from "../contexts/AuthContext";
import { formatCurrency } from "../services/settings/enum/currency.enum";
import { useSettings } from "../services/settings/useSettings";
import { useLocation } from "react-router-dom";

const { Title, Text } = Typography;
const { Option } = Select;

export default function Accounts() {
  const { user } = useAuth();
  const { settings } = useSettings();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<string | null>(null);
  const [form] = Form.useForm();
  const location = useLocation();
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="text-center p-8">
          <Title level={4}>Vui lòng đăng nhập để sử dụng tính năng này</Title>
        </Card>
      </div>
    );
  }

  const {
    accounts,
    loading,
    createAccount,
    updateAccount,
    deleteAccount,
    getAccountIcon,
    getAccountColor,
    getTotalBalance,
  } = useAccounts(user.id);
  const totalBalance = getTotalBalance();

  const getTypeTag = (type: AccountType) => {
    const typeMap = {
      [AccountType.CASH]: { label: "Tiền mặt", color: "green" },
      [AccountType.BANK]: { label: "Ngân hàng", color: "blue" },
      [AccountType.CREDIT]: { label: "Tín dụng", color: "red" },
      [AccountType.SAVING]: { label: "Tiết kiệm", color: "gold" },
      [AccountType.WALLET]: { label: "Ví điện tử", color: "purple" },
    };
    return typeMap[type] || { label: "Khác", color: "default" };
  };

  const handleAddAccount = () => {
    setEditingAccount(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const handleEditAccount = (account: any) => {
    setEditingAccount(account.id);
    form.setFieldsValue({
      name: account.name,
      type: account.type,
      amount: account.amount,
      key: account.key,
      logo: account.logo,
    });
    setIsModalOpen(true);
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();

      if (editingAccount) {
        // Update existing account
        const result = await updateAccount(editingAccount, {
          name: values.name,
          type: values.type,
          amount: values.amount,
          key: values.key,
          logo: values.logo || "",
        });

        if (result.error) {
          message.error("Cập nhật tài khoản thất bại!");
          return;
        }
      } else {
        // Create new account
        const result = await createAccount({
          name: values.name,
          type: values.type,
          amount: values.amount || 0,
          key: values.key,
          logo: values.logo || "",
        });

        if (result.error) {
          message.error("Thêm tài khoản thất bại!");
          return;
        }
      }

      setIsModalOpen(false);
      form.resetFields();
      setEditingAccount(null);
    } catch (error) {
      console.error("Validation failed:", error);
    }
  };

  const handleModalCancel = () => {
    setIsModalOpen(false);
    form.resetFields();
    setEditingAccount(null);
  };

  const handleDeleteAccount = async (accountId: string) => {
    const result = await deleteAccount(accountId);
    if (result.error) {
      // Error message đã được hiển thị trong hook
      return;
    }
  };

  useEffect(() => {
    if (location.state?.openModal) {
      setIsModalOpen(true);
      // Xóa state sau khi mở để không lặp lại khi reload
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spin size="large" tip="Đang tải dữ liệu..." />
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen" style={{ padding: "24px" }}>
      {/* Header */}
      <div className="mb-6">
        <Row justify="space-between" align="middle">
          <Col>
            <Title level={2} className="mb-2">
              Quản lý tài khoản
            </Title>
            <Text type="secondary">
              Theo dõi và quản lý các tài khoản tài chính của bạn
            </Text>
          </Col>
          <Col>
            <Button
              type="primary"
              size="large"
              icon={<PlusOutlined />}
              className="shadow-sm"
              onClick={handleAddAccount}
            >
              Thêm tài khoản
            </Button>
          </Col>
        </Row>
      </div>

      {/* Summary Card */}
      <Card className="mb-6 shadow-sm">
        <Row gutter={24} align="middle">
          <Col xs={24} sm={12}>
            <div className="text-center sm:text-left">
              <Text type="secondary" className="text-base">
                Tổng tài sản
              </Text>
              <div
                className={`text-3xl font-bold mt-2 ${
                  totalBalance >= 0 ? "text-green-600" : "text-red-500"
                }`}
              >
                {formatCurrency(totalBalance, settings?.currency || "VND")}
              </div>
            </div>
          </Col>
          <Col xs={24} sm={12}>
            <Row gutter={16} className="mt-4 sm:mt-0">
              <Col span={6} className="text-center">
                <div className="text-xl font-semibold text-blue-600">
                  {accounts.filter((i) => i.type === AccountType.BANK).length}
                </div>
                <Text type="secondary" className="text-sm">
                  Ngân hàng
                </Text>
              </Col>
              <Col span={6} className="text-center">
                <div className="text-xl font-semibold text-green-600">
                  {accounts.filter((i) => i.type === AccountType.CASH).length}
                </div>
                <Text type="secondary" className="text-sm">
                  Tiền mặt
                </Text>
              </Col>
              <Col span={6} className="text-center">
                <div className="text-xl font-semibold text-red-600">
                  {accounts.filter((i) => i.type === AccountType.CREDIT).length}
                </div>
                <Text type="secondary" className="text-sm">
                  Tín dụng
                </Text>
              </Col>
              <Col span={6} className="text-center">
                <div className="text-xl font-semibold text-purple-600">
                  {accounts.filter((i) => i.type === AccountType.WALLET).length}
                </div>
                <Text type="secondary" className="text-sm">
                  Ví điện tử
                </Text>
              </Col>
            </Row>
          </Col>
        </Row>
      </Card>

      {/* Accounts List */}
      {accounts.length > 0 ? (
        <List
          grid={{
            gutter: [16, 16],
            xs: 1,
            sm: 2,
            md: 2,
            lg: 3,
            xl: 4,
          }}
          dataSource={accounts}
          renderItem={(item) => {
            const typeTag = getTypeTag(item.type);
            const Icon = getAccountIcon(item.type);
            const color = getAccountColor(item.type);

            return (
              <List.Item>
                <Card
                  className="hover:shadow-md transition-shadow duration-200 h-full"
                  bodyStyle={{ padding: "20px" }}
                  actions={[
                    <Button
                      type="text"
                      icon={<EditOutlined />}
                      key="edit"
                      onClick={() => handleEditAccount(item)}
                    >
                      Sửa
                    </Button>,
                    <Popconfirm
                      title="Xóa tài khoản"
                      description="Bạn có chắc chắn muốn xóa tài khoản này?"
                      onConfirm={() => handleDeleteAccount(item.id)}
                      okText="Xóa"
                      cancelText="Hủy"
                      okButtonProps={{ danger: true }}
                      key="delete"
                    >
                      <Button type="text" danger icon={<DeleteOutlined />}>
                        Xóa
                      </Button>
                    </Popconfirm>,
                  ]}
                >
                  <div className="flex items-center mb-3">
                    <Avatar
                      size={40}
                      style={{ backgroundColor: color }}
                      icon={<Icon />}
                    />
                    <div className="ml-3 flex-1">
                      <Title level={5} className="mb-1">
                        {item.name}
                      </Title>
                      <Tag color={typeTag.color} className="text-xs">
                        {typeTag.label}
                      </Tag>
                    </div>
                  </div>

                  <Divider className="my-3" />

                  <div className="text-center">
                    <Text type="secondary" className="text-sm block mb-1">
                      Số dư
                    </Text>
                    <div
                      className={`text-xl font-bold ${
                        item.amount >= 0 ? "text-green-600" : "text-red-500"
                      }`}
                    >
                      {formatCurrency(item.amount, settings?.currency || "VND")}
                    </div>
                  </div>
                </Card>
              </List.Item>
            );
          }}
        />
      ) : (
        /* Empty State when no accounts */
        <Card className="text-center py-12">
          {/* <SaveOutlined className="text-6xl text-gray-300 mb-4" /> */}
          <Title level={4} type="secondary">
            Chưa có tài khoản nào
          </Title>
          <Text type="secondary" className="mb-6 block">
            Thêm tài khoản đầu tiên để bắt đầu quản lý tài chính của bạn
          </Text>
          {/* <Button type="primary" size="large" icon={<PlusOutlined />} onClick={handleAddAccount}>
            Thêm tài khoản đầu tiên
          </Button> */}
        </Card>
      )}

      {/* Add/Edit Account Modal */}
      <Modal
        title={editingAccount ? "Chỉnh sửa tài khoản" : "Thêm tài khoản mới"}
        open={isModalOpen}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        okText={editingAccount ? "Cập nhật" : "Thêm tài khoản"}
        cancelText="Hủy"
        width={500}
        destroyOnClose
        maskClosable={false}
      >
        <Form form={form} layout="vertical" autoComplete="off">
          <Form.Item
            label="Tên tài khoản"
            name="name"
            rules={[
              { required: true, message: "Vui lòng nhập tên tài khoản!" },
              { min: 2, message: "Tên tài khoản phải có ít nhất 2 ký tự!" },
            ]}
          >
            <Input placeholder="Ví dụ: Vietcombank, Tiền mặt..." size="large" />
          </Form.Item>

          <Form.Item
            label="Loại tài khoản"
            name="type"
            rules={[
              { required: true, message: "Vui lòng chọn loại tài khoản!" },
            ]}
          >
            <Select placeholder="Chọn loại tài khoản" size="large">
              <Option value={AccountType.CASH}>
                <div className="flex items-center">
                  <DollarOutlined
                    style={{ color: "#52c41a", marginRight: 8 }}
                  />
                  Tiền mặt
                </div>
              </Option>

              <Option value={AccountType.BANK}>
                <div className="flex items-center">
                  <BankOutlined style={{ color: "#1890ff", marginRight: 8 }} />
                  Ngân hàng
                </div>
              </Option>

              <Option value={AccountType.CREDIT}>
                <div className="flex items-center">
                  <CreditCardOutlined
                    style={{ color: "#f5222d", marginRight: 8 }}
                  />
                  Thẻ tín dụng
                </div>
              </Option>

              <Option value={AccountType.SAVING}>
                <div className="flex items-center">
                  <SaveOutlined style={{ color: "#faad14", marginRight: 8 }} />
                  Tiết kiệm
                </div>
              </Option>

              <Option value={AccountType.WALLET}>
                <div className="flex items-center">
                  <WalletOutlined
                    style={{ color: "#722ed1", marginRight: 8 }}
                  />
                  Ví điện tử
                </div>
              </Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="Mã tài khoản (Key)"
            name="key"
            // rules={[
            //   { required: true, message: "Vui lòng nhập mã tài khoản!" },
            //   {
            //     pattern: /^[A-Z0-9_]+$/,
            //     message: "Mã chỉ được chứa chữ in hoa, số và dấu gạch dưới!",
            //   },
            // ]}
          >
            <Input
              placeholder="Ví dụ: VCB, CASH, MOMO..."
              size="large"
              style={{ textTransform: "uppercase" }}
            />
          </Form.Item>

          <Form.Item label="Logo URL (tùy chọn)" name="logo">
            <Input placeholder="https://example.com/logo.png" size="large" />
          </Form.Item>

          <Form.Item
            label="Số dư ban đầu"
            name="amount"
            rules={[
              { required: true, message: "Vui lòng nhập số dư ban đầu!" },
            ]}
          >
            <InputNumber
              placeholder="0"
              size="large"
              style={{ width: "100%" }}
              formatter={(value) =>
                `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
              }
              parser={(value) => value!.replace(/\$\s?|(,*)/g, "")}
              addonAfter={settings?.currency}
            />
          </Form.Item>

          <div className="bg-blue-50 p-3 rounded-lg mt-4">
            <Text type="secondary" className="text-sm">
              💡 <strong>Lưu ý:</strong> Số dư ban đầu có thể là số âm đối với
              thẻ tín dụng (khoản nợ)
            </Text>
          </div>
        </Form>
      </Modal>
    </div>
  );
}
