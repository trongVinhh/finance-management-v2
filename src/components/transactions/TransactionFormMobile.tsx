import { Drawer, Button, Popconfirm, Space, type FormInstance } from "antd";
import { DeleteOutlined } from "@ant-design/icons";
import TransactionForm from "./TransactionForm";

interface TransactionFormMobileProps {
    isOpen: boolean;
    editingTransaction: any | null;
    form: FormInstance;
    type: "income" | "expense" | "suddenly";
    category: string;
    groups: any[];
    categories: any[];
    accounts: any[];
    settings: any;
    creating: boolean;
    updating: boolean;
    deleting: boolean;
    onClose: () => void;
    onSubmit: () => void;
    onDelete: (id: string) => void;
    onFormFinish: (values: any) => void;
}

export default function TransactionFormMobile({
    isOpen,
    editingTransaction,
    form,
    type,
    category,
    groups,
    categories,
    accounts,
    settings,
    creating,
    updating,
    deleting,
    onClose,
    onSubmit,
    onDelete,
    onFormFinish,
}: TransactionFormMobileProps) {
    return (
        <Drawer
            title={editingTransaction ? "Sửa giao dịch" : "Thêm giao dịch mới"}
            open={isOpen}
            onClose={onClose}
            width="100%"
            placement="bottom"
            height="90vh"
            footer={
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    {editingTransaction && (
                        <Popconfirm
                            title="Xóa giao dịch này?"
                            onConfirm={async () => {
                                await onDelete(editingTransaction.id);
                                onClose();
                            }}
                            okText="Xóa"
                            cancelText="Hủy"
                        >
                            <Button danger icon={<DeleteOutlined />} loading={deleting}>
                                Xóa
                            </Button>
                        </Popconfirm>
                    )}
                    <Space style={{ marginLeft: "auto" }}>
                        <Button onClick={onClose}>Hủy</Button>
                        <Button
                            type="primary"
                            onClick={onSubmit}
                            loading={creating || updating}
                        >
                            {editingTransaction ? "Cập nhật" : "Thêm giao dịch"}
                        </Button>
                    </Space>
                </div>
            }
        >
            <TransactionForm
                form={form}
                type={type}
                category={category}
                groups={groups}
                categories={categories}
                accounts={accounts}
                settings={settings}
                onFinish={onFormFinish}
            />
        </Drawer>
    );
}
