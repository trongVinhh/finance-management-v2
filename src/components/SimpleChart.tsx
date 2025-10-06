import React from 'react';
import { Card, Row, Col, Progress, Typography, Space } from 'antd';

const { Text } = Typography;

interface ChartData {
  category: string;
  amount: number;
  percentage: number;
  color: string;
}

interface SimpleChartProps {
  title: string;
  data: ChartData[];
  icon?: React.ReactNode;
}

export default function SimpleChart({ title, data, icon }: SimpleChartProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  return (
    <Card title={title} extra={icon}>
      <div className="chart-container-mobile" style={{ height: '300px', overflowY: 'auto' }}>
        {data.map((item, index) => (
          <div key={index} style={{ marginBottom: '16px' }}>
            <Row justify="space-between" align="middle" style={{ marginBottom: '8px' }}>
              <Col xs={16}>
                <Space>
                  <div
                    style={{
                      width: '12px',
                      height: '12px',
                      backgroundColor: item.color,
                      borderRadius: '50%',
                    }}
                  />
                  <Text strong style={{ fontSize: '14px' }}>{item.category}</Text>
                </Space>
              </Col>
              <Col xs={8}>
                <Text style={{ fontSize: '12px', textAlign: 'right' }}>{formatCurrency(item.amount)}</Text>
              </Col>
            </Row>
            <Progress
              percent={item.percentage}
              strokeColor={item.color}
              size="small"
              showInfo={false}
            />
            <Text type="secondary" style={{ fontSize: '12px' }}>
              {item.percentage.toFixed(1)}%
            </Text>
          </div>
        ))}
      </div>
    </Card>
  );
}
