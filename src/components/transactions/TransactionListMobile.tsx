import { List, Typography, Tag } from "antd";
import dayjs from "dayjs";
import { formatCurrency } from "../../services/settings/enum/currency.enum";

const { Text } = Typography;

interface TransactionListMobileProps {
    data: any[];
    loading: boolean;
    categories: any[];
    onEdit: (record: any) => void;
    settings: any;
}

export default function TransactionListMobile({
    data,
    loading,
    categories,
    onEdit,
    settings,
}: TransactionListMobileProps) {
    const getCategoryByName = (name: string) => {
        return categories.find((cat) => cat.name === name);
    };

    return (
        <List
            loading={loading}
            dataSource={data}
            renderItem={(item) => {
                const category = getCategoryByName(item.category);
                const isIncome = item.type === "income";
                const accentColor = isIncome ? "#52c41a" : "#f5222d";

                return (
                    <List.Item
                        key={item.id}
                        style={{
                            padding: "0",
                            marginBottom: "8px",
                            cursor: "pointer",
                            borderRadius: "8px",
                            overflow: "hidden",
                            border: "1px solid #f0f0f0",
                            transition: "all 0.2s ease"
                        }}
                        onClick={() => onEdit(item)}
                    >
                        <div
                            style={{
                                width: "100%",
                                display: "flex",
                                padding: "16px",
                                background: "#fff",
                                borderLeft: `4px solid ${accentColor}`,
                                position: "relative"
                            }}
                            className="hover:bg-gray-50 active:bg-gray-100"
                        >
                            {/* Main Content */}
                            <div style={{ flex: 1, minWidth: 0 }}>
                                {/* Description */}
                                <div
                                    style={{
                                        fontSize: "16px",
                                        fontWeight: 600,
                                        color: "#262626",
                                        marginBottom: "6px",
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                        whiteSpace: "nowrap"
                                    }}
                                >
                                    {item.desc || category?.name || "Giao dịch"}
                                </div>

                                {/* Category & Date */}
                                <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                                    <Tag
                                        color={category?.color || "blue"}
                                        style={{
                                            margin: 0,
                                            fontSize: "12px",
                                            borderRadius: "4px",
                                            padding: "2px 8px"
                                        }}
                                    >
                                        {category?.icon && <span style={{ marginRight: "4px" }}>{category.icon}</span>}
                                        {item.category}
                                    </Tag>
                                    <Text type="secondary" style={{ fontSize: "13px" }}>
                                        {dayjs(item.date).format("DD/MM/YYYY")}
                                    </Text>
                                </div>
                            </div>

                            {/* Amount */}
                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    marginLeft: "12px"
                                }}
                            >
                                <div
                                    style={{
                                        fontSize: "18px",
                                        fontWeight: 700,
                                        color: accentColor,
                                        textAlign: "right",
                                        whiteSpace: "nowrap"
                                    }}
                                >
                                    {isIncome ? "+" : "-"}
                                    {formatCurrency(item.amount, settings?.currency || "VND")}
                                </div>
                            </div>
                        </div>
                    </List.Item>
                );
            }}
        />
    );
}
