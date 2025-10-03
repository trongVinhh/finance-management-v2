import { Card, Row, Col, DatePicker, Select, Button, Space, Typography } from 'antd';
import { FilterOutlined, ReloadOutlined, DownloadOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;
const { Option } = Select;
const { Text } = Typography;

interface FilterProps {
  dateRange: [dayjs.Dayjs, dayjs.Dayjs];
  onDateRangeChange: (dates: [dayjs.Dayjs, dayjs.Dayjs]) => void;
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  onFilter: () => void;
  onRefresh: () => void;
  onExport?: () => void;
}

export default function FilterPanel({
  dateRange,
  onDateRangeChange,
  selectedCategory,
  onCategoryChange,
  onFilter,
  onRefresh,
  onExport,
}: FilterProps) {
  const categories = [
    { value: 'all', label: 'Tất cả' },
    { value: 'income', label: 'Thu nhập' },
    { value: 'expense', label: 'Chi tiêu' },
    { value: 'food', label: 'Ăn uống' },
    { value: 'housing', label: 'Nhà ở' },
    { value: 'shopping', label: 'Mua sắm' },
    { value: 'transport', label: 'Giao thông' },
    { value: 'entertainment', label: 'Giải trí' },
  ];

  const quickDateRanges = [
    { label: 'Hôm nay', value: [dayjs(), dayjs()] },
    { label: 'Tuần này', value: [dayjs().startOf('week'), dayjs().endOf('week')] },
    { label: 'Tháng này', value: [dayjs().startOf('month'), dayjs().endOf('month')] },
    { label: '3 tháng', value: [dayjs().subtract(3, 'month'), dayjs()] },
    { label: '6 tháng', value: [dayjs().subtract(6, 'month'), dayjs()] },
    { label: 'Năm nay', value: [dayjs().startOf('year'), dayjs().endOf('year')] },
  ];

  return (
    <Card style={{ marginBottom: '24px' }}>
      <Row gutter={[16, 16]} align="middle">
        <Col xs={24} sm={12} md={6}>
          <Space direction="vertical" size={4} style={{ width: '100%' }}>
            <Text strong>Khoảng thời gian</Text>
            <RangePicker
              value={dateRange}
              onChange={(dates) => onDateRangeChange(dates as [dayjs.Dayjs, dayjs.Dayjs])}
              format="DD/MM/YYYY"
              style={{ width: '100%' }}
              size="large"
            />
          </Space>
        </Col>
        
        <Col xs={24} sm={12} md={4}>
          <Space direction="vertical" size={4} style={{ width: '100%' }}>
            <Text strong>Danh mục</Text>
            <Select
              value={selectedCategory}
              onChange={onCategoryChange}
              style={{ width: '100%' }}
              placeholder="Chọn danh mục"
              size="large"
            >
              {categories.map((cat) => (
                <Option key={cat.value} value={cat.value}>
                  {cat.label}
                </Option>
              ))}
            </Select>
          </Space>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Space direction="vertical" size={4} style={{ width: '100%' }}>
            <Text strong>Khoảng thời gian nhanh</Text>
            <Select
              placeholder="Chọn khoảng thời gian"
              style={{ width: '100%' }}
              onChange={(value) => onDateRangeChange(value)}
              size="large"
            >
              {quickDateRanges.map((range) => (
                <Option key={range.label} value={range.value}>
                  {range.label}
                </Option>
              ))}
            </Select>
          </Space>
        </Col>

        <Col xs={24} sm={12} md={8}>
          <Space direction="vertical" size={4} style={{ width: '100%' }}>
            <Text strong>Thao tác</Text>
            <Space wrap style={{ width: '100%' }}>
              <Button 
                type="primary" 
                icon={<FilterOutlined />} 
                onClick={onFilter}
                size="large"
                style={{ minWidth: '80px' }}
              >
                Lọc
              </Button>
              <Button 
                icon={<ReloadOutlined />} 
                onClick={onRefresh}
                size="large"
                style={{ minWidth: '80px' }}
              >
                Làm mới
              </Button>
              {onExport && (
                <Button 
                  icon={<DownloadOutlined />} 
                  onClick={onExport}
                  size="large"
                  style={{ minWidth: '80px' }}
                >
                  Xuất báo cáo
                </Button>
              )}
            </Space>
          </Space>
        </Col>
      </Row>
    </Card>
  );
}
