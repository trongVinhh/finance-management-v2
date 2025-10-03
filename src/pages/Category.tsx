import { useEffect, useState } from "react";
import {
  Card,
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  Space,
  Tag,
  Popconfirm,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  TagsOutlined,
} from "@ant-design/icons";
import { useAuth } from "../contexts/AuthContext";
import { useCategories } from "../services/categories/useCategories";

type Category = {
  id: string;
  name: string;
  type: "income" | "expense" | "suddenly";
  color: string;
};

// const initialData: Category[] = [
//   { id: 1, name: "Lương", type: "income", color: "green" },
//   { id: 2, name: "Ăn uống", type: "expense", color: "red" },
//   { id: 3, name: "Nhà ở", type: "expense", color: "blue" },
//   { id: 4, name: "Freelance", type: "income", color: "cyan" },
// ];

export default function Category() {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [form] = Form.useForm();
  const { user } = useAuth();
  const { categories, addCategory, updateCategory, deleteCategory} = useCategories(user?.id);
  useEffect(() => {
    if (!user) return;
  }, []);

  const showModal = (category?: Category) => {
    if (category) {
      setEditingCategory(category);
      form.setFieldsValue(category);
    } else {
      setEditingCategory(null);
      form.resetFields();
    }
    setIsModalVisible(true);
  };

  const handleOk = () => {
    form.validateFields().then((values) => {
      if (editingCategory) {
        updateCategory(editingCategory.id, values)
      } else {
        addCategory(values);
      }
      setIsModalVisible(false);
      form.resetFields();
    });
  };

  const handleDelete = (id: string) => {
    deleteCategory(id)
  };

  const columns = [
    {
      title: "Tên danh mục",
      dataIndex: "name",
      key: "name",
      render: (text: string, record: Category) => (
        <Tag color={record.color}>{text}</Tag>
      ),
    },
    {
      title: "Loại",
      dataIndex: "type",
      key: "type",
      render: (type: string) =>
        type === "income" ? (
          <Tag color="green">Thu nhập</Tag>
        ) : type=== "expense" ? (
          <Tag color="red">Chi tiêu</Tag>
        ) :  (
          <Tag color="cyan">Bất ngờ</Tag>
        ),
    },
    {
      title: "Thao tác",
      key: "actions",
      render: (_: any, record: Category) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => showModal(record)}
          >
            Sửa
          </Button>
          <Popconfirm
            title="Xóa danh mục này?"
            okText="Có"
            cancelText="Không"
            onConfirm={() => handleDelete(record.id)}
          >
            <Button type="link" danger icon={<DeleteOutlined />}>
              Xóa
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: "24px" }}>
      <Card
        title={
          <Space>
            <TagsOutlined />
            Quản lý danh mục
          </Space>
        }
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={() => showModal()}>
            Thêm danh mục
          </Button>
        }
      >
        <Table
          dataSource={categories as Category[]}
          columns={columns}
          rowKey="id"
          pagination={{ pageSize: 20 }}
        />
      </Card>

      {/* Modal thêm/sửa danh mục */}
      <Modal
        title={editingCategory ? "Sửa danh mục" : "Thêm danh mục"}
        open={isModalVisible}
        onOk={handleOk}
        onCancel={() => setIsModalVisible(false)}
        okText="Lưu"
        cancelText="Hủy"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="Tên danh mục"
            rules={[{ required: true, message: "Nhập tên danh mục!" }]}
          >
            <Input placeholder="Ví dụ: Ăn uống, Lương..." />
          </Form.Item>
          <Form.Item
            name="type"
            label="Loại"
            rules={[{ required: true, message: "Chọn loại danh mục!" }]}
          >
            <Select>
              <Select.Option value="income">Thu nhập</Select.Option>
              <Select.Option value="expense">Chi tiêu</Select.Option>
              <Select.Option value="suddenly">Bất ngờ</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="color"
            label="Màu hiển thị"
            rules={[{ required: true, message: "Chọn màu!" }]}
          >
            <Input type="color" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
