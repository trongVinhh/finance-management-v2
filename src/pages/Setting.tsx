import { useState, useEffect } from "react";
import {
  Card,
  Form,
  Select,
  Button,
  Typography,
  Row,
  Col,
  InputNumber,
  Table,
  Empty,
  Spin,
} from "antd";
import { SaveOutlined } from "@ant-design/icons";
import { currencyUnits } from "../utils/system-constants";
import { useAccounts } from "../services/accounts/useAccounts";
import { useAuth } from "../contexts/AuthContext";
import { useSettings } from "../services/settings/useSettings";
import { formatCurrency } from "../services/settings/enum/currency.enum";
import { useNavigate } from "react-router-dom";
import { useNotify } from "../contexts/NotifycationContext";

const { Title, Text } = Typography;

type Account = {
  id: string;
  name: string;
};

export default function Settings() {
  const notify = useNotify();
  const [form] = Form.useForm();
  const { user } = useAuth();
  const { accounts } = useAccounts(user.id);
  const [selectedAccount, setSelectedAccount] = useState<string | undefined>(
    undefined
  );
  console.log("selected Account:", selectedAccount)
  const { settings, loading, saving, saveSettings } = useSettings();
  const navigate = useNavigate();
  // Sync settings to form when loaded
  useEffect(() => {
    if (settings) {
      setSelectedAccount(settings.default_account_id);
      form.setFieldsValue({
        currency: settings.currency,
      });

      // Load allocations vào form
      if (settings.allocations && settings.allocations.length > 0) {
        const allocationsFormData = settings.allocations.map((alloc) => ({
          amount: alloc.amount,
        }));
        form.setFieldsValue({
          allocations: allocationsFormData,
        });
      }
    } else {
      // Set default values if no settings
      form.setFieldsValue({
        currency: currencyUnits[0].value,
      });
    }
  }, [settings, form]);

  const handleSave = async () => {
    try {
      const values = await form.validateFields();

      // if (!selectedAccount) {
      //   message.warning("Vui lòng chọn tài khoản mặc định");
      //   return;
      // }

      // Lấy allocations từ form và map với accountId
      const allocations = accounts.map((account, index) => ({
        accountId: account.id,
        amount: values.allocations?.[index]?.amount || 0,
      }));

      await saveSettings({
        default_account_id: selectedAccount,
        currency: values.currency,
        allocations: allocations,
      });

      notify("success", "Thành công!", "Cài đặt thành công!");
    } catch (error) {
      console.error("Validation failed:", error);
      notify("error", "Thất bại!", "Cài đặt thất bại, vui lòng kiểm tra!");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spin size="large" />
      </div>
    );
  }

  // Cột cho bảng phân bổ
  const columns = [
    {
      title: "Tài khoản",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Số tiền phân bổ",
      dataIndex: "amount",
      key: "amount",
      render: (_: any, record: Account, index: number) => {
        // Tìm allocation cho account này
        const existingAllocation = settings?.allocations?.find(
          (alloc) => alloc.accountId === record.id
        );

        return (
          <Form.Item
            name={["allocations", index, "amount"]}
            initialValue={existingAllocation?.amount || 0}
            rules={[
              { required: true, message: "Nhập số tiền" },
              { type: "number", min: 0, message: "Số tiền phải >= 0" },
            ]}
            style={{ marginBottom: 0 }}
          >
            <InputNumber
              style={{ width: "100%" }}
              min={0}
              formatter={(value) =>
                `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
              }
              addonAfter={settings?.currency}
            />
          </Form.Item>
        );
      },
    },
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen" style={{ padding: "24px" }}>
      {/* Header */}
      <div className="mb-6">
        <Title level={2} className="mb-2">
          Cài đặt
        </Title>
        <Text type="secondary">
          Cấu hình thông tin cá nhân và tùy chỉnh ứng dụng
        </Text>
      </div>

      <Row gutter={24}>
        <Col xs={24} lg={24}>
          {/* Giá trị mặc định */}
          <Card title="Giá trị mặc định" className="mb-6">
            <Form layout="vertical" form={form}>
              <Row gutter={16}>
                {accounts.length === 0 ? (
                  <Col xs={24} sm={8}>
                    <Form.Item
                      label="Tài khoản mặc định"
                      rules={[
                        { required: true, message: "Vui lòng chọn tài khoản" },
                      ]}
                    >
                      <label style={{ color: "red", display: "block", marginBottom: 4 }}>
                        *Vui lòng tạo tài khoản để thực hiện cài đặt
                      </label>
                      <Button
                        type="link"
                        style={{ padding: 0 }}
                        onClick={() => navigate("/accounts", { state: { openModal: true } })}
                      >
                        ➕ Tạo tài khoản
                      </Button>
                    </Form.Item>
                  </Col>
                ) : (
                  <Col xs={24} sm={8}>
                    <Form.Item
                      label="Tài khoản mặc định"
                      rules={[
                        { required: true, message: "Vui lòng chọn tài khoản" },
                      ]}
                    >
                      <Select
                        size="large"
                        placeholder="Chọn tài khoản"
                        value={selectedAccount}
                        onChange={(value) => setSelectedAccount(value)}
                      >
                        {accounts.map((a) => (
                          <Select.Option key={a.id} value={a.id}>
                            {a.name}
                          </Select.Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                )}

                <Col xs={24} sm={8}>
                  <Form.Item
                    label="Đơn vị tiền tệ"
                    name="currency"
                    rules={[
                      {
                        required: true,
                        message: "Vui lòng chọn đơn vị tiền tệ",
                      },
                    ]}
                  >
                    <Select
                      size="large"
                      placeholder="Chọn đơn vị tiền tệ"
                      options={currencyUnits}
                    />
                  </Form.Item>
                </Col>
              </Row>
            </Form>
          </Card>

          {/* Phân bổ thu nhập */}
          <Card
            title="Phân bổ thu nhập vào tài khoản"
            extra={
              <Text type="secondary" style={{ fontSize: "14px" }}>
                Tự động phân bổ khi có thu nhập
              </Text>
            }
          >
            {accounts.length > 0 ? (
              <Form form={form} layout="vertical">
                <Table
                  dataSource={accounts}
                  columns={columns}
                  rowKey="id"
                  pagination={false}
                  summary={(pageData) => {
                    const values = form.getFieldsValue();
                    const total = pageData.reduce((sum, _, index) => {
                      return sum + (values.allocations?.[index]?.amount || 0);
                    }, 0);

                    return (
                      <Table.Summary.Row>
                        <Table.Summary.Cell index={0}>
                          <strong>Tổng</strong>
                        </Table.Summary.Cell>
                        <Table.Summary.Cell index={1}>
                          <strong>
                            {formatCurrency(total, settings?.currency || "VND")}
                          </strong>
                        </Table.Summary.Cell>
                      </Table.Summary.Row>
                    );
                  }}
                />
              </Form>
            ) : (
              <Empty
                description="Chưa có tài khoản nào"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              ></Empty>
            )}
          </Card>
        </Col>
      </Row>

      {/* Save Button */}
      <div className="mt-6 text-center">
        <Button
          type="primary"
          size="large"
          icon={<SaveOutlined />}
          loading={saving}
          onClick={handleSave}
          className="px-8"
          style={{ marginTop: "10px" }}
        >
          Lưu cài đặt
        </Button>
      </div>
    </div>
  );
}
