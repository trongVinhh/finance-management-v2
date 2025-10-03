import { Card, List, Button, Typography, Row, Col, Space, Divider, Tag, Avatar, Modal, Form, Input, Select, InputNumber, message } from 'antd'
import { PlusOutlined, BankOutlined, WalletOutlined, CreditCardOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import { useState } from 'react'

const { Title, Text } = Typography
const { Option } = Select

export default function Accounts() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [form] = Form.useForm()
  const [accounts, setAccounts] = useState([
    { 
      id: 1, 
      name: 'Tiền mặt', 
      balance: 2000000, 
      type: 'cash',
      icon: <WalletOutlined />,
      color: '#52c41a'
    },
    { 
      id: 2, 
      name: 'Vietcombank', 
      balance: 15000000, 
      type: 'bank',
      icon: <BankOutlined />,
      color: '#1890ff'
    },
    { 
      id: 3, 
      name: 'Thẻ tín dụng', 
      balance: -500000, 
      type: 'credit',
      icon: <CreditCardOutlined />,
      color: '#f5222d'
    },
    { 
      id: 4, 
      name: 'Agribank', 
      balance: 8500000, 
      type: 'bank',
      icon: <BankOutlined />,
      color: '#722ed1'
    }
  ])
  const items = accounts

  const totalBalance = items.reduce((sum, item) => sum + item.balance, 0)

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount)
  }

  const getTypeTag = (type: string) => {
    const typeMap = {
      cash: { label: 'Tiền mặt', color: 'green' },
      bank: { label: 'Ngân hàng', color: 'blue' },
      credit: { label: 'Tín dụng', color: 'red' }
    }
    return typeMap[type as keyof typeof typeMap] || { label: 'Khác', color: 'default' }
  }

  const getAccountIcon = (type: string) => {
    const iconMap = {
      cash: <WalletOutlined />,
      bank: <BankOutlined />,
      credit: <CreditCardOutlined />
    }
    return iconMap[type as keyof typeof iconMap] || <WalletOutlined />
  }

  const getAccountColor = (type: string) => {
    const colorMap = {
      cash: '#52c41a',
      bank: '#1890ff',
      credit: '#f5222d'
    }
    return colorMap[type as keyof typeof colorMap] || '#666666'
  }

  const handleAddAccount = () => {
    console.log('Button clicked, opening modal')
    setIsModalOpen(true)
  }

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields()
      const newAccount = {
        id: Date.now(), // Simple ID generation
        name: values.name,
        balance: values.balance || 0,
        type: values.type,
        icon: getAccountIcon(values.type),
        color: getAccountColor(values.type)
      }
      
      setAccounts([...accounts, newAccount])
      setIsModalOpen(false)
      form.resetFields()
      message.success('Thêm tài khoản thành công!')
    } catch (error) {
      console.error('Validation failed:', error)
    }
  }

  const handleModalCancel = () => {
    setIsModalOpen(false)
    form.resetFields()
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen" style={{ padding: "24px" }}>
      {/* Header */}
      <div className="mb-6">
        <Row justify="space-between" align="middle">
          <Col>
            <Title level={2} className="mb-2">Quản lý tài khoản</Title>
            <Text type="secondary">Theo dõi và quản lý các tài khoản tài chính của bạn</Text>
          </Col>
          <Col>
            <Button 
              type="primary" 
              size="large"
              icon={<PlusOutlined />}
              className="shadow-sm"
              onClick={handleAddAccount}
            >
              Thêm tài khoản
            </Button>
          </Col>
        </Row>
      </div>

      {/* Summary Card */}
      <Card className="mb-6 shadow-sm">
        <Row gutter={24} align="middle">
          <Col xs={24} sm={12}>
            <div className="text-center sm:text-left">
              <Text type="secondary" className="text-base">Tổng tài sản</Text>
              <div className={`text-3xl font-bold mt-2 ${totalBalance >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                {formatCurrency(totalBalance)}
              </div>
            </div>
          </Col>
          <Col xs={24} sm={12}>
            <Row gutter={16} className="mt-4 sm:mt-0">
              <Col span={8} className="text-center">
                <div className="text-xl font-semibold text-blue-600">{items.filter(i => i.type === 'bank').length}</div>
                <Text type="secondary" className="text-sm">Ngân hàng</Text>
              </Col>
              <Col span={8} className="text-center">
                <div className="text-xl font-semibold text-green-600">{items.filter(i => i.type === 'cash').length}</div>
                <Text type="secondary" className="text-sm">Tiền mặt</Text>
              </Col>
              <Col span={8} className="text-center">
                <div className="text-xl font-semibold text-red-600">{items.filter(i => i.type === 'credit').length}</div>
                <Text type="secondary" className="text-sm">Tín dụng</Text>
              </Col>
            </Row>
          </Col>
        </Row>
      </Card>

      {/* Accounts List */}
      <List
        grid={{ 
          gutter: [16, 16], 
          xs: 1, 
          sm: 2, 
          md: 2, 
          lg: 3, 
          xl: 4 
        }}
        dataSource={items}
        renderItem={(item) => {
          const typeTag = getTypeTag(item.type)
          return (
            <List.Item>
              <Card 
                className="hover:shadow-md transition-shadow duration-200 h-full"
                bodyStyle={{ padding: '20px' }}
                actions={[
                  <Button type="text" icon={<EditOutlined />} key="edit">
                    Sửa
                  </Button>,
                  <Button type="text" danger icon={<DeleteOutlined />} key="delete">
                    Xóa
                  </Button>
                ]}
              >
                <div className="flex items-center mb-3">
                  <Avatar 
                    size={40} 
                    style={{ backgroundColor: item.color }}
                    icon={item.icon}
                  />
                  <div className="ml-3 flex-1">
                    <Title level={5} className="mb-1">{item.name}</Title>
                    <Tag color={typeTag.color} className="text-xs">
                      {typeTag.label}
                    </Tag>
                  </div>
                </div>
                
                <Divider className="my-3" />
                
                <div className="text-center">
                  <Text type="secondary" className="text-sm block mb-1">Số dư</Text>
                  <div className={`text-xl font-bold ${item.balance >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                    {formatCurrency(item.balance)}
                  </div>
                </div>
              </Card>
            </List.Item>
          )
        }}
      />

      {/* Empty State when no accounts */}
      {items.length === 0 && (
        <Card className="text-center py-12">
          <WalletOutlined className="text-6xl text-gray-300 mb-4" />
          <Title level={4} type="secondary">Chưa có tài khoản nào</Title>
          <Text type="secondary" className="mb-6 block">
            Thêm tài khoản đầu tiên để bắt đầu quản lý tài chính của bạn
          </Text>
          <Button type="primary" size="large" icon={<PlusOutlined />} onClick={handleAddAccount}>
            Thêm tài khoản đầu tiên
          </Button>
        </Card>
      )}

      {/* Add Account Modal */}
      <Modal
        title="Thêm tài khoản mới"
        open={isModalOpen}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        okText="Thêm tài khoản"
        cancelText="Hủy"
        width={500}
        destroyOnClose
        maskClosable={false}
      >
        <Form
          form={form}
          layout="vertical"
          autoComplete="off"
        >
          <Form.Item
            label="Tên tài khoản"
            name="name"
            rules={[
              { required: true, message: 'Vui lòng nhập tên tài khoản!' },
              { min: 2, message: 'Tên tài khoản phải có ít nhất 2 ký tự!' }
            ]}
          >
            <Input 
              placeholder="Ví dụ: Vietcombank, Tiền mặt..."
              size="large"
            />
          </Form.Item>

          <Form.Item
            label="Loại tài khoản"
            name="type"
            rules={[{ required: true, message: 'Vui lòng chọn loại tài khoản!' }]}
          >
            <Select 
              placeholder="Chọn loại tài khoản"
              size="large"
            >
              <Option value="cash">
                <Space>
                  <WalletOutlined style={{ color: '#52c41a' }} />
                  Tiền mặt
                </Space>
              </Option>
              <Option value="bank">
                <Space>
                  <BankOutlined style={{ color: '#1890ff' }} />
                  Ngân hàng
                </Space>
              </Option>
              <Option value="credit">
                <Space>
                  <CreditCardOutlined style={{ color: '#f5222d' }} />
                  Thẻ tín dụng
                </Space>
              </Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="Số dư ban đầu"
            name="balance"
            rules={[
              { required: true, message: 'Vui lòng nhập số dư ban đầu!' }
            ]}
          >
            <InputNumber
              placeholder="0"
              size="large"
              style={{ width: '100%' }}
              formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={(value) => value!.replace(/\$\s?|(,*)/g, '')}
              addonAfter="VND"
            />
          </Form.Item>

          <div className="bg-blue-50 p-3 rounded-lg mt-4">
            <Text type="secondary" className="text-sm">
              💡 <strong>Lưu ý:</strong> Số dư ban đầu có thể là số âm đối với thẻ tín dụng (khoản nợ)
            </Text>
          </div>
        </Form>
      </Modal>
    </div>
  )
}