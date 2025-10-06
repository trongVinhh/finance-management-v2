import { useState } from "react";
import { Select, DatePicker, Row, Col } from "antd";
import dayjs, { Dayjs } from "dayjs";

const { Option } = Select;

type FilterMode = "month" | "year" | "all";

interface DashboardFiltersProps {
  filterMode: FilterMode;
  setFilterMode: (mode: FilterMode) => void;
  onFilterChange: (date: Dayjs | null, mode: FilterMode) => void;
}

export default function DashboardFilters({
  filterMode,
  setFilterMode,
  onFilterChange,
}: DashboardFiltersProps) {
  const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs());

  const handleFilterChange = (value: FilterMode) => {
    setFilterMode(value);
    if (value === "month" || value === "year") {
      onFilterChange(selectedDate, value);
    } else {
      onFilterChange(null, value);
    }
  };

  const handleDateChange = (value: Dayjs | null) => {
    const newDate = value || dayjs();
    setSelectedDate(newDate);
    onFilterChange(newDate, filterMode);
  };

  return (
    <Row gutter={[8, 8]}>
      <Col>
        <Select<FilterMode>
          value={filterMode}
          onChange={handleFilterChange}
          style={{ width: 160 }}
        >
          <Option value="month">Theo tháng</Option>
          <Option value="year">Theo năm</Option>
          <Option value="all">Toàn bộ</Option>
        </Select>
      </Col>

      <Col>
        {filterMode !== "all" && (
          <DatePicker
            picker={filterMode}
            value={selectedDate}
            onChange={handleDateChange}
            format={filterMode === "month" ? "MM/YYYY" : "YYYY"}
            allowClear={false}
          />
        )}
      </Col>
    </Row>
  );
}
