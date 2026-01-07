import { List, Card, Tag, Button, Typography, Popconfirm } from "antd";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";

const { Text, Title } = Typography;

interface Debt {
    id: string;
    lender_name: string;
    amount: number;
    status: "unpaid" | "paid";
    note?: string;
    created_at?: string;
}

interface DebtListMobileProps {
    data: Debt[];
    loading?: boolean;
    onEdit: (item: Debt) => void;
    onDelete: (id: string) => void;
}

export default function DebtListMobile({
    data,
    loading,
    onEdit,
    onDelete,
}: DebtListMobileProps) {
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
                                title="Bạn có chắc muốn xóa?"
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
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                            <div>
                                <Title level={5} style={{ margin: 0 }}>
                                    {item.lender_name}
                                </Title>
                                <Text type="secondary" style={{ fontSize: "12px" }}>
                                    {item.note || "(Không có ghi chú)"}
                                </Text>
                            </div>
                            <div style={{ textAlign: "right" }}>
                                <Title
                                    level={5}
                                    style={{
                                        margin: 0,
                                        color: item.status === "paid" ? "#52c41a" : "#f5222d",
                                    }}
                                >
                                    {item.amount.toLocaleString("vi-VN")} ₫
                                </Title>
                                <Tag color={item.status === "paid" ? "green" : "red"}>
                                    {item.status === "paid" ? "Đã thu" : "Chưa thu"}
                                </Tag>
                            </div>
                        </div>
                    </Card>
                </List.Item>
            )}
        />
    );
}
