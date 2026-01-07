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
} from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { useLoans } from "../services/loans/useLoans";
import { useNotify } from "../contexts/NotifycationContext";

const { Title, Text } = Typography;
const { Option } = Select;

interface Loan {
  id: string;
  borrower_name: string;
  amount: number;
  status: "unpaid" | "paid";
  note?: string;
}

export default function Loans() {
  const notify = useNotify();
  const { loans, addLoan, updateLoan, deleteLoan } = useLoans();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLoan, setEditingLoan] = useState<Loan | null>(null);
  const [form] = Form.useForm();

  const totalPaid = loans?.reduce(
    (acc, curr) => (curr.status === "paid" ? acc + curr.amount : acc),
    0
  ) || 0;
  const totalUnpaid = loans?.reduce(
    (acc, curr) => (curr.status === "pending" ? acc + curr.amount : acc),
    0
  ) || 0;

  const handleSave = async (values: any) => {
    try {
      if (editingLoan) {
        await updateLoan(editingLoan.id, {
          borrower_name: values.borrower_name,
          amount: values.amount,
          status: values.status,
          note: values.note,
        });
        notify("success", "Thành công!", "Cập nhật khoản vay thành công!");
      } else {
        await addLoan({
          borrower_name: values.borrower_name,
          amount: values.amount,
          status: values.status,
          note: values.note,
          due_date: null,
        } as any);
        notify("success", "Thành công!", "Thêm khoản vay mới thành công!");
      }
      setIsModalOpen(false);
      form.resetFields();
      setEditingLoan(null);
    } catch (err) {
      console.error(err);
      notify("error", "Thất bại!", "Đã có lỗi xảy ra!");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteLoan(id);
      notify("success", "Thành công!", "Xóa khoản vay thành công!");
    } catch {
      notify("error", "Thất bại!", "Đã có lỗi xảy ra!");
    }
  };

  const columns = [
    { title: "Tên người cho vay", dataIndex: "borrower_name", key: "borrower_name" },
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
          <Tag color="green">Đã trả</Tag>
        ) : (
          <Tag color="red">Chưa trả</Tag>
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
              setEditingLoan(record);
              setIsModalOpen(true);
              form.setFieldsValue(record);
            }}
          />
          <Popconfirm
            title="Xóa khoản vay này?"
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
              Quản lý vay
            </Title>
            <Text type="secondary">Theo dõi các khoản bạn vay người khác</Text>
          </Col>
          <Col xs={24} sm={12} style={{ textAlign: "right" }}>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => {
                setIsModalOpen(true);
                setEditingLoan(null);
                form.resetFields();
              }}
            >
              Thêm khoản vay
            </Button>
          </Col>
        </Row>
        <Row gutter={16} style={{ marginTop: 24 }}>
          <Col span={12}>
            <Statistic
              title="Tổng đã trả"
              value={totalPaid}
              precision={0}
              suffix="₫"
              valueStyle={{ color: "#3f8600" }}
            />
          </Col>
          <Col span={12}>
            <Statistic
              title="Tổng chưa trả"
              value={totalUnpaid}
              precision={0}
              suffix="₫"
              valueStyle={{ color: "#cf1322" }}
            />
          </Col>
        </Row>
      </Card>

      <Table
        columns={columns}
        dataSource={loans}
        rowKey="id"
        pagination={{ pageSize: 100 }}
        scroll={{ x: true }}
      />

      <Modal
        title={editingLoan ? "Chỉnh sửa khoản vay" : "Thêm khoản vay"}
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false);
          setEditingLoan(null);
          form.resetFields();
        }}
        onOk={() => form.submit()}
        okText="Lưu"
      >
        <Form form={form} layout="vertical" onFinish={handleSave}>
          <Form.Item
            name="borrower_name"
            label="Tên người cho vay"
            rules={[{ required: true }]}
          >
            <Input placeholder="Nhập tên người cho vay" />
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
              <Option value="unpaid">Chưa trả</Option>
              <Option value="paid">Đã trả</Option>
            </Select>
          </Form.Item>
          <Form.Item name="note" label="Ghi chú">
            <Input.TextArea rows={3} placeholder="Nhập ghi chú (nếu có)" />
          </Form.Item>
        </Form>
      </Modal>
    </div >
  );
}
