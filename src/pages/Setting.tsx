import { useState } from "react";
import {
  Card,
  Form,
  Select,
  Button,
  Typography,
  Row,
  Col,
  message,
  InputNumber,
  Table,
  Empty,
} from "antd";
import { SaveOutlined, PlusOutlined } from "@ant-design/icons";
import { currencyUnits } from "../utils/system-constants";

const { Title, Text } = Typography;

type Account = {
  id: string;
  name: string;
};

export default function SettingsPage() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  // Giả lập tài khoản từ DB
  const [accounts, setAccounts] = useState<Account[]>([
    { id: "1", name: "Tiền mặt" },
    { id: "2", name: "Ngân hàng" },
  ]);

  const handleSave = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();

      // Validate tổng phân bổ
      const allocations = values.allocations || [];
      const total = allocations.reduce((sum: number, a: any) => sum + (a.percent || 0), 0);
      if (total !== 100) {
        message.error("Tổng phân bổ phải bằng 100%");
        setLoading(false);
        return;
      }

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      message.success("Cài đặt đã được lưu thành công!");
    } catch (error) {
      message.error("Có lỗi xảy ra khi lưu cài đặt");
    } finally {
      setLoading(false);
    }
  };

  // Cột cho bảng phân bổ
  const columns = [
    {
      title: "Tài khoản",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Số tiền",
      dataIndex: "amount",
      key: "amount",
      render: (_: any, record: Account, index: number) => (
        <Form.Item
          name={["allocations", index, "amount"]}
          initialValue={0}
          rules={[{ required: true, message: "Nhập số tiền" }]}
        >
          <InputNumber />
        </Form.Item>
      ),
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
                <Col xs={24} sm={8}>
                  <Form.Item label="Tài khoản mặc định">
                    <Select size="large" defaultValue="cash">
                      <Select.Option value="cash">Tiền mặt</Select.Option>
                      <Select.Option value="bank">Ngân hàng</Select.Option>
                      <Select.Option value="credit">Thẻ tín dụng</Select.Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col xs={24} sm={8}>
                  <Form.Item label="Đơn vị tiền tệ" name="currency">
                    <Select
                      size="large"
                      defaultValue={currencyUnits[0].value}
                      options={currencyUnits}
                    />
                  </Form.Item>
                </Col>
              </Row>

              {/* <Form.Item label="Ngân sách hàng tháng" name="monthlyBudget">
                <InputNumber
                  size="large"
                  style={{ width: "30%" }}
                  defaultValue={10000000}
                  formatter={(value) =>
                    `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                  }
                  addonAfter="VND"
                />
              </Form.Item> */}
            </Form>
          </Card>

          {/* Phân bổ thu nhập */}
          <Card title="Phân bổ thu nhập vào tài khoản">
            {accounts.length > 0 ? (
              <Form form={form} layout="vertical">
                <Table
                  dataSource={accounts}
                  columns={columns}
                  rowKey="id"
                  pagination={false}
                />
              </Form>
            ) : (
              <Empty
                description="Chưa có tài khoản nào"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              >
                <Button type="primary" icon={<PlusOutlined />}>
                  Tạo tài khoản mới
                </Button>
              </Empty>
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
          loading={loading}
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
