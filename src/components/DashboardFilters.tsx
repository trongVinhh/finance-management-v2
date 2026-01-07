import { useState } from "react";
import { Select, DatePicker, Row, Col, Grid } from "antd";
import dayjs, { Dayjs } from "dayjs";

const { Option } = Select;
const { useBreakpoint } = Grid;

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
  const screens = useBreakpoint();

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

  // On mobile (xs) width is 100%, otherwise fixed 150px
  const inputStyle = {
    width: !screens.sm ? "100%" : 150,
  };

  return (
    <Row gutter={[8, 8]} style={{ marginTop: 12 }}>
      <Col xs={24} sm="auto">
        <Select<FilterMode>
          value={filterMode}
          onChange={handleFilterChange}
          style={inputStyle}
          size="middle"
        >
          <Option value="month">Theo tháng</Option>
          <Option value="year">Theo năm</Option>
          <Option value="all">Toàn bộ</Option>
        </Select>
      </Col>

      <Col xs={24} sm="auto">
        {filterMode !== "all" && (
          <DatePicker
            picker={filterMode}
            value={selectedDate}
            onChange={handleDateChange}
            format={filterMode === "month" ? "MM/YYYY" : "YYYY"}
            allowClear={false}
            size="middle"
            style={inputStyle}
          />
        )}
      </Col>
    </Row>
  );
}
