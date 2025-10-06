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
} from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { useDebts } from "../services/debts/useDebts";
import { useNotify } from "../contexts/NotifycationContext";

const { Title, Text } = Typography;
const { Option } = Select;

interface Debt {
  id: string;
  name: string;
  amount: number;
  status: "unpaid" | "paid";
  note?: string;
}

export default function Debts() {
  const notify = useNotify();
  const { debts, addDebt, updateDebt, deleteDebt } = useDebts();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDebt, setEditingDebt] = useState<Debt | null>(null);
  const [form] = Form.useForm();

  const handleSave = async (values: any) => {
    try {
      if (editingDebt) {
        await updateDebt(editingDebt.id, {
          lender_name: values.name,
          amount: values.amount,
          status: values.status,
          note: values.note,
        });
        notify("success", "Thành công!", "Cập nhật thành công!");
      } else {
        await addDebt({
          lender_name: values.name,
          amount: values.amount,
          status: values.status,
          note: values.note,
          due_date: null,
        } as any);
        notify("success", "Thành công!", "Tạo mới thành công!");
      }
      setIsModalOpen(false);
      form.resetFields();
      setEditingDebt(null);
    } catch (err) {
      console.error(err);
      notify("error", "Thất bại!", "Đã có lỗi xảy ra!");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDebt(id);
      notify("success", "Thành công!", "Xóa thành công!");
    } catch {
      notify("error", "Thất bại!", "Đã có lỗi xảy ra!");
    }
  };

  const columns = [
    { title: "Tên người nợ", dataIndex: "lender_name", key: "lender_name" },
    {
      title: "Số tiền",
      dataIndex: "amount",
      key: "amount",
      render: (a: number) => a.toLocaleString("vi-VN") + " ₫",
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (s: string) =>
        s === "paid" ? (
          <Tag color="green">Đã thu</Tag>
        ) : (
          <Tag color="red">Chưa thu</Tag>
        ),
    },
    {
      title: "Hành động",
      key: "actions",
      render: (_: any, record: any) => (
        <Space>
          <Button
            icon={<EditOutlined />}
            onClick={() => {
              setEditingDebt(record);
              setIsModalOpen(true);
              form.setFieldsValue(record);
            }}
          />
          <Popconfirm
            title="Xóa khoản này?"
            onConfirm={() => handleDelete(record.id)}
          >
            <Button danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: "16px" }}>
      <Card style={{ marginBottom: 16 }}>
        <Row justify="space-between" align="middle" gutter={[16, 16]}>
          <Col xs={24} sm={12}>
            <Title level={3} style={{ margin: 0 }}>
              Quản lý nợ
            </Title>
            <Text type="secondary">Theo dõi các khoản người khác nợ bạn</Text>
          </Col>
          <Col xs={24} sm={12} style={{ textAlign: "right" }}>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => {
                setIsModalOpen(true);
                setEditingDebt(null);
                form.resetFields();
              }}
            >
              Thêm khoản nợ
            </Button>
          </Col>
        </Row>
      </Card>

      <Table
        columns={columns}
        dataSource={debts}
        rowKey="id"
        pagination={{ pageSize: 5 }}
        scroll={{ x: true }}
      />

      <Modal
        title={editingDebt ? "Chỉnh sửa khoản nợ" : "Thêm khoản nợ"}
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false);
          setEditingDebt(null);
          form.resetFields();
        }}
        onOk={() => form.submit()}
        okText="Lưu"
      >
        <Form form={form} layout="vertical" onFinish={handleSave}>
          <Form.Item
            name="name"
            label="Tên người nợ"
            rules={[{ required: true }]}
          >
            <Input placeholder="Nhập tên người nợ" />
          </Form.Item>
          <Form.Item name="amount" label="Số tiền" rules={[{ required: true }]}>
            <InputNumber
              style={{ width: "100%" }}
              placeholder="Nhập số tiền"
              min={0}
              step={1000}
              formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
            />
          </Form.Item>
          <Form.Item
            name="status"
            label="Trạng thái"
            rules={[{ required: true }]}
          >
            <Select placeholder="Chọn trạng thái">
              <Option value="unpaid">Chưa thu</Option>
              <Option value="paid">Đã thu</Option>
            </Select>
          </Form.Item>
          <Form.Item name="note" label="Ghi chú">
            <Input.TextArea rows={3} placeholder="Nhập ghi chú (nếu có)" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
