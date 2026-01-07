import {
    Form,
    Input,
    Select,
    DatePicker,
    Space,
    Row,
    Col,
    InputNumber,
    Radio,
    type FormInstance,
} from "antd";
import { UpOutlined, DownOutlined } from "@ant-design/icons";
import { useEffect, useMemo } from "react";

const { Option } = Select;

interface TransactionFormProps {
    form: FormInstance;
    type: "income" | "expense" | "suddenly";
    category: string;
    groups: any[];
    categories: any[];
    accounts: any[];
    settings: any;
    onFinish?: (values: any) => void;
}

export default function TransactionForm({
    form,
    type,
    category,
    groups,
    categories,
    accounts,
    settings,
    onFinish,
}: TransactionFormProps) {
    const categoriesByGroup = useMemo(() => {
        return {
            income: categories.filter((cat) => cat.group === "THU_NHAP"),
            expense: categories.filter((cat) => cat.group === "CHI_TIEU"),
            saving: categories.filter((cat) => cat.group === "SAVE_AND_SHARE"),
            suddenly: categories.filter((cat) => cat.group === "BAT_NGO"),
        };
    }, [categories]);

    const selectedGroup = Form.useWatch("group", form);
    const groupMap: Record<string, keyof typeof categoriesByGroup> = {
        THU_NHAP: "income",
        CHI_TIEU: "expense",
        SAVE_AND_SHARE: "saving",
        BAT_NGO: "suddenly",
    };

    const currentGroup =
        categoriesByGroup[groupMap[selectedGroup as keyof typeof groupMap]] || [];

    useEffect(() => {
        if (type === "income") {
            form.setFieldValue("group", "THU_NHAP");
            form.setFieldValue("category", "Lương");
        } else if (type === "expense") {
            // form.setFieldValue("group", "CHI_TIEU");
            // form.setFieldValue("category", undefined);
        }
    }, [type, form]);

    useEffect(() => {
        if (!(type === "income" && category === "Lương")) {
            form.setFieldValue("account_id", settings?.default_account_id);
        }
    }, [type, category, settings, form]);

    return (
        <Form form={form} layout="vertical" autoComplete="off" onFinish={onFinish}>
            <Row gutter={16}>
                <Col xs={24} sm={12}>
                    <Form.Item
                        label="Loại giao dịch"
                        name="type"
                        rules={[
                            { required: true, message: "Vui lòng chọn loại giao dịch!" },
                        ]}
                    >
                        <Select placeholder="Chọn loại giao dịch" size="large">
                            <Option value="income">
                                <Space>
                                    <UpOutlined style={{ color: "#52c41a" }} />
                                    Thu nhập
                                </Space>
                            </Option>
                            <Option value="expense">
                                <Space>
                                    <DownOutlined style={{ color: "#f5222d" }} />
                                    Chi tiêu
                                </Space>
                            </Option>
                        </Select>
                    </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                    <Form.Item
                        label="Ngày"
                        name="date"
                        rules={[{ required: true, message: "Vui lòng chọn ngày!" }]}
                    >
                        <DatePicker
                            placeholder="Chọn ngày"
                            size="large"
                            className="w-full"
                            format="DD/MM/YYYY"
                        />
                    </Form.Item>
                </Col>
            </Row>

            {type === "income" ? (
                <Form.Item
                    name="group"
                    label="Nhóm danh mục"
                    rules={[{ required: true, message: "Vui lòng chọn nhóm!" }]}
                >
                    <Radio.Group optionType="button" buttonStyle="solid">
                        {groups
                            .filter((g) => g.key === "THU_NHAP")
                            .map((g) => (
                                <Radio key={g.id} value={g.key}>
                                    {g.name}
                                </Radio>
                            ))}
                    </Radio.Group>
                </Form.Item>
            ) : (
                <Form.Item
                    name="group"
                    label="Nhóm danh mục"
                    rules={[{ required: true, message: "Vui lòng chọn nhóm!" }]}
                >
                    <Radio.Group optionType="button" buttonStyle="solid">
                        {groups
                            .filter((g) => g.key !== "THU_NHAP")
                            .map((g) => (
                                <Radio key={g.id} value={g.key}>
                                    {g.name}
                                </Radio>
                            ))}
                    </Radio.Group>
                </Form.Item>
            )}

            <Row gutter={16}>
                <Col xs={24} sm={12}>
                    <Form.Item
                        label="Danh mục"
                        name="category"
                        rules={[{ required: true, message: "Vui lòng chọn danh mục!" }]}
                    >
                        <Select
                            placeholder="Chọn danh mục"
                            size="large"
                            showSearch
                            optionFilterProp="children"
                        >
                            {currentGroup.map((cat) => (
                                <Option key={cat.id} value={cat.name}>
                                    {cat.icon && <span className="mr-1">{cat.icon}</span>}
                                    {cat.name}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>
                </Col>
                {type === "income" && category === "Lương" ? null : (
                    <Col xs={24} sm={12}>
                        <Form.Item
                            label="Tài khoản"
                            name="account_id"
                            rules={[{ required: true, message: "Vui lòng chọn tài khoản!" }]}
                        >
                            <Select placeholder="Chọn tài khoản" size="large">
                                {accounts.map((acc) => (
                                    <Option key={acc.id} value={acc.id}>
                                        {acc.name}
                                    </Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </Col>
                )}
            </Row>

            <Form.Item
                label="Số tiền"
                name="amount"
                rules={[
                    { required: true, message: "Vui lòng nhập số tiền!" },
                    { type: "number", min: 1, message: "Số tiền phải lớn hơn 0!" },
                ]}
            >
                <InputNumber
                    placeholder="0"
                    size="large"
                    className="w-full"
                    formatter={(value) =>
                        `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                    }
                    addonAfter={settings?.currency}
                    min={0}
                />
            </Form.Item>

            <Form.Item
                label="Mô tả"
                name="desc"
                rules={[
                    { required: true, message: "Vui lòng nhập mô tả!" },
                    { min: 3, message: "Mô tả phải có ít nhất 3 ký tự!" },
                ]}
            >
                <Input placeholder="Ví dụ: Ăn trưa tại nhà hàng..." size="large" />
            </Form.Item>
        </Form>
    );
}
