import { Collapse, Input, Select, DatePicker, Button } from "antd";
import { FilterOutlined, SearchOutlined } from "@ant-design/icons";
import { Dayjs } from "dayjs";

const { Search } = Input;
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
            style={{ background: "transparent" }}
        >
            <Collapse.Panel
                header={
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "4px 0" }}>
                        <FilterOutlined style={{ fontSize: "14px", color: "#1890ff" }} />
                        <span style={{ fontWeight: 500, fontSize: "14px" }}>Bộ lọc</span>
                    </div>
                }
                key="1"
                style={{ padding: 0 }}
            >
                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "12px",
                        paddingTop: "8px",
                    }}
                >
                    <Search
                        placeholder="Tìm kiếm mô tả..."
                        allowClear
                        value={searchText}
                        onChange={(e) => onSearchChange(e.target.value)}
                        prefix={<SearchOutlined />}
                        size="middle"
                    />

                    <Select
                        placeholder="Chọn danh mục"
                        allowClear
                        value={selectedCategory || undefined}
                        onChange={onCategoryChange}
                        className="w-full"
                        size="large"
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
                    />

                    <Button
                        block
                        icon={<FilterOutlined />}
                        onClick={onClearFilters}
                        size="large"
                    >
                        Xóa bộ lọc
                    </Button>
                </div>
            </Collapse.Panel>
        </Collapse>
    );
}
