import { Collapse, Input, Select, DatePicker, Button } from "antd";
import { FilterOutlined, SearchOutlined } from "@ant-design/icons";
import { Dayjs } from "dayjs";

const { RangePicker } = DatePicker;
const { Option } = Select;

interface TransactionFilterMobileProps {
    searchText: string;
    selectedCategory: string;
    dateRange: [Dayjs, Dayjs] | [];
    allCategories: string[];
    onSearchChange: (value: string) => void;
    onCategoryChange: (value: string) => void;
    onDateRangeChange: (dates: [Dayjs, Dayjs] | []) => void;
    onClearFilters: () => void;
}

export default function TransactionFilterMobile({
    searchText,
    selectedCategory,
    dateRange,
    allCategories,
    onSearchChange,
    onCategoryChange,
    onDateRangeChange,
    onClearFilters,
}: TransactionFilterMobileProps) {
    return (
        <Collapse
            ghost
            bordered={false}
            expandIconPosition="end"
            className="bg-white rounded-lg"
        >
            <Collapse.Panel
                header={
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "4px 0" }}>
                        <FilterOutlined style={{ fontSize: "16px", color: "#1890ff" }} />
                        <span style={{ fontWeight: 600, fontSize: "15px", color: "#1f1f1f" }}>Bộ lọc tìm kiếm</span>
                    </div>
                }
                key="1"
                style={{ padding: 0 }}
            >
                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "16px",
                        padding: "0 0 12px 0",
                    }}
                >
                    <Input
                        placeholder="Tìm kiếm mô tả..."
                        allowClear
                        value={searchText}
                        onChange={(e) => onSearchChange(e.target.value)}
                        prefix={<SearchOutlined className="text-gray-400" />}
                        size="large"
                        className="rounded-md"
                    />

                    <Select
                        placeholder="Chọn danh mục"
                        allowClear
                        value={selectedCategory || undefined}
                        onChange={onCategoryChange}
                        className="w-full"
                        size="large"
                        style={{ width: "100%" }}
                    >
                        {allCategories.map((cat) => (
                            <Option key={cat} value={cat}>
                                {cat}
                            </Option>
                        ))}
                    </Select>

                    <RangePicker
                        placeholder={["Từ ngày", "Đến ngày"]}
                        value={dateRange.length ? dateRange : null}
                        onChange={(dates) =>
                            onDateRangeChange(dates ? (dates as [Dayjs, Dayjs]) : [])
                        }
                        className="w-full"
                        format="DD/MM/YYYY"
                        size="large"
                        style={{ width: "100%" }}
                    />

                    <Button
                        block
                        type="default"
                        danger
                        icon={<FilterOutlined />}
                        onClick={onClearFilters}
                        size="large"
                        className="mt-2"
                    >
                        Xóa bộ lọc
                    </Button>
                </div>
            </Collapse.Panel>
        </Collapse>
    );
}
