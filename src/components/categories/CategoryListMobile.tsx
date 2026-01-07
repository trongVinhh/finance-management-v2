import { List, Card, Tag, Button, Typography, Popconfirm } from "antd";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";

const { Text, Title } = Typography;

interface CategoryGroup {
    id: string;
    key: string;
    name: string;
}

interface Category {
    id: string;
    name: string;
    type: "income" | "expense" | "suddenly" | "saveAndShare";
    color: string;
    group?: string;
}

interface CategoryListMobileProps {
    data: Category[];
    groups: CategoryGroup[];
    loading?: boolean;
    onEdit: (item: Category) => void;
    onDelete: (id: string) => void;
}

export default function CategoryListMobile({
    data,
    groups,
    loading,
    onEdit,
    onDelete,
}: CategoryListMobileProps) {

    const getGroupName = (key?: string) => {
        if (!key) return "-";
        const group = groups.find((g) => g.key === key);
        return group ? group.name : key;
    };

    const getTypeTag = (type: string) => {
        switch (type) {
            case "income":
                return <Tag color="green">Thu nhập</Tag>;
            case "expense":
                return <Tag color="red">Chi tiêu</Tag>;
            case "suddenly":
                return <Tag color="cyan">Bất ngờ</Tag>;
            default:
                return <Tag color="gray">Save & Share</Tag>;
        }
    };

    return (
        <List
            loading={loading}
            dataSource={data}
            renderItem={(item) => (
                <List.Item>
                    <Card
                        style={{ width: "100%", marginBottom: 8 }}
                        bodyStyle={{ padding: "12px" }}
                        actions={[
                            <Button
                                type="text"
                                icon={<EditOutlined />}
                                key="edit"
                                onClick={() => onEdit(item)}
                            >
                                Sửa
                            </Button>,
                            <Popconfirm
                                title="Xóa danh mục này?"
                                onConfirm={() => onDelete(item.id)}
                                okText="Xóa"
                                cancelText="Hủy"
                            >
                                <Button type="text" danger icon={<DeleteOutlined />} key="delete">
                                    Xóa
                                </Button>
                            </Popconfirm>,
                        ]}
                    >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                            <div>
                                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                                    <div
                                        style={{
                                            width: 16,
                                            height: 16,
                                            borderRadius: "50%",
                                            backgroundColor: item.color,
                                        }}
                                    />
                                    <Title level={5} style={{ margin: 0 }}>
                                        {item.name}
                                    </Title>
                                </div>
                                <Text type="secondary" style={{ fontSize: "12px" }}>
                                    Nhóm: {getGroupName(item.group)}
                                </Text>
                            </div>
                            <div>
                                {getTypeTag(item.type)}
                            </div>
                        </div>
                    </Card>
                </List.Item>
            )}
        />
    );
}
