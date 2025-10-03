import { 
  Table, 
  Button, 
  Card, 
  Input, 
  Select, 
  DatePicker, 
  Space, 
  Tag, 
  Tooltip, 
  Typography, 
  Row, 
  Col, 
  Statistic, 
  Modal, 
  Form, 
  InputNumber, 
  message, 
  Popconfirm
} from 'antd'
import { 
  PlusOutlined, 
  SearchOutlined, 
  FilterOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  ExportOutlined,
  ImportOutlined,
  UpOutlined,
  DownOutlined,
  SwapOutlined,
  ArrowUpOutlined, 
  ArrowDownOutlined,
  CalendarOutlined
} from '@ant-design/icons'
import { useState } from 'react'
import dayjs, { Dayjs } from 'dayjs'
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter'
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore'
import type { ColumnsType } from 'antd/es/table'
dayjs.extend(isSameOrAfter)
dayjs.extend(isSameOrBefore)

const { Search } = Input
const { RangePicker } = DatePicker
const { Title, Text } = Typography
const { Option } = Select

interface Transaction {
  key: number
  id: number
  date: string
  desc: string
  amount: number
  type: 'income' | 'expense'
  category: string
  account: string
}

export default function Transactions() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)
  const [form] = Form.useForm()
  const [searchText, setSearchText] = useState('')
  const [selectedType, setSelectedType] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [dateRange, setDateRange] = useState<[Dayjs, Dayjs] | []>([])
  
  const [transactions, setTransactions] = useState<Transaction[]>([
    { 
      key: 1, 
      date: '2025-09-27', 
      desc: 'Ăn trưa tại nhà hàng ABC', 
      amount: -120000,
      type: 'expense',
      category: 'Ăn uống',
      account: 'Tiền mặt',
      id: 1
    },
    { 
      key: 2, 
      date: '2025-09-26', 
      desc: 'Lương tháng 9', 
      amount: 15000000,
      type: 'income',
      category: 'Lương',
      account: 'Vietcombank',
      id: 2
    },
    { 
      key: 3, 
      date: '2025-09-25', 
      desc: 'Mua xăng xe máy', 
      amount: -150000,
      type: 'expense',
      category: 'Đi lại',
      account: 'Thẻ tín dụng',
      id: 3
    },
    { 
      key: 4, 
      date: '2025-09-24', 
      desc: 'Tiền thưởng dự án', 
      amount: 2000000,
      type: 'income',
      category: 'Thưởng',
      account: 'Agribank',
      id: 4
    },
    { 
      key: 5, 
      date: '2025-09-23', 
      desc: 'Mua sắm tạp hóa', 
      amount: -85000,
      type: 'expense',
      category: 'Mua sắm',
      account: 'Tiền mặt',
      id: 5
    }
  ])

  const categories = {
    income: ['Lương', 'Thưởng', 'Đầu tư', 'Kinh doanh', 'Khác'],
    expense: ['Ăn uống', 'Đi lại', 'Mua sắm', 'Giải trí', 'Y tế', 'Giáo dục', 'Nhà cửa', 'Khác']
  }

  const accounts = ['Tiền mặt', 'Vietcombank', 'Agribank', 'Thẻ tín dụng']

  // Statistics calculations
  const totalIncome = transactions.filter(t => t.amount > 0).reduce((sum, t) => sum + t.amount, 0)
  const totalExpense = transactions.filter(t => t.amount < 0).reduce((sum, t) => sum + Math.abs(t.amount), 0)
  const netAmount = totalIncome - totalExpense

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(Math.abs(amount))
  }

  const getTypeIcon = (type: 'income' | 'expense') => {
    return type === 'income' ? 
      <UpOutlined style={{ color: '#52c41a' }} /> : 
      <DownOutlined style={{ color: '#f5222d' }} />
  }

  const getTypeColor = (amount: number): string => {
    return amount > 0 ? '#52c41a' : '#f5222d'
  }

  const handleAddTransaction = () => {
    setEditingTransaction(null)
    form.resetFields()
    setIsModalOpen(true)
  }

  const handleEditTransaction = (record: Transaction) => {
    setEditingTransaction(record)
    form.setFieldsValue({
      ...record,
      date: dayjs(record.date),
      amount: Math.abs(record.amount)
    })
    setIsModalOpen(true)
  }

  const handleDeleteTransaction = (id: number) => {
    setTransactions(transactions.filter(t => t.id !== id))
    message.success('Xóa giao dịch thành công!')
  }

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields()
      const uniqueId = Date.now() + Math.random()

      const transactionData: Transaction = {
        ...values,
        date: values.date.format('YYYY-MM-DD'),
        amount: values.type === 'expense' ? -Math.abs(values.amount) : Math.abs(values.amount),
        id: editingTransaction ? editingTransaction.id : uniqueId,
        key: editingTransaction ? editingTransaction.key : uniqueId
      }

      if (editingTransaction) {
        setTransactions(transactions.map(t => 
          t.id === editingTransaction.id ? transactionData : t
        ))
        message.success('Cập nhật giao dịch thành công!')
      } else {
        setTransactions([transactionData, ...transactions])
        message.success('Thêm giao dịch thành công!')
      }

      setIsModalOpen(false)
      form.resetFields()
    } catch (error) {
      console.error('Validation failed:', error)
    }
  }

  const handleModalCancel = () => {
    setIsModalOpen(false)
    form.resetFields()
  }

  // Filter data
  const filteredData = transactions.filter((item: Transaction) => {
    const matchSearch = !searchText || item.desc.toLowerCase().includes(searchText.toLowerCase())
    const matchType = !selectedType || item.type === selectedType
    const matchCategory = !selectedCategory || item.category === selectedCategory
    const matchDate = !dateRange.length || (
      dayjs(item.date).isSameOrAfter(dateRange[0], 'day') &&
      dayjs(item.date).isSameOrBefore(dateRange[1], 'day')
    )
    return matchSearch && matchType && matchCategory && matchDate
  })

  const columns: ColumnsType<Transaction> = [
    {
      title: 'Ngày',
      dataIndex: 'date',
      key: 'date',
      width: 120,
      sorter: (a: Transaction, b: Transaction) => new Date(a.date).getTime() - new Date(b.date).getTime(),
      render: (date: string) => (
        <div className="flex items-center">
          <CalendarOutlined className="mr-2 text-gray-400" />
          {dayjs(date).format('DD/MM/YYYY')}
        </div>
      )
    },
    {
      title: 'Loại',
      dataIndex: 'type',
      key: 'type',
      width: 80,
      filters: [
        { text: 'Thu nhập', value: 'income' },
        { text: 'Chi tiêu', value: 'expense' }
      ],
      onFilter: (value, record: Transaction) => {
        return record.type === value
      },
      render: (type: 'income' | 'expense') => (
        <Tooltip title={type === 'income' ? 'Thu nhập' : 'Chi tiêu'}>
          {getTypeIcon(type)}
        </Tooltip>
      )
    },
    {
      title: 'Mô tả',
      dataIndex: 'desc',
      key: 'desc',
      ellipsis: { showTitle: false },
      render: (desc: string, record: Transaction) => (
        <div>
          <div className="font-medium">{desc}</div>
          <div className="flex items-center mt-1">
            <Tag color="blue">{record.category}</Tag>
            <Text type="secondary" className="text-xs ml-2">{record.account}</Text>
          </div>
        </div>
      )
    },
    {
      title: 'Số tiền',
      dataIndex: 'amount',
      key: 'amount',
      width: 150,
      align: 'right' as const,
      sorter: (a: Transaction, b: Transaction) => Math.abs(a.amount) - Math.abs(b.amount),
      render: (amount: number) => (
        <div className="text-right">
          <div 
            className="font-bold text-lg"
            style={{ color: getTypeColor(amount) }}
          >
            {amount > 0 ? '+' : ''}{formatCurrency(amount)}
          </div>
        </div>
      )
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 120,
      render: (_: any, record: Transaction) => (
        <Space size="small">
          <Tooltip title="Sửa">
            <Button 
              type="text" 
              icon={<EditOutlined />} 
              onClick={() => handleEditTransaction(record)}
              className="text-blue-500"
            />
          </Tooltip>
          <Tooltip title="Xóa">
            <Popconfirm
              title="Bạn có chắc muốn xóa giao dịch này?"
              onConfirm={() => handleDeleteTransaction(record.id)}
              okText="Có"
              cancelText="Không"
            >
              <Button 
                type="text" 
                danger 
                icon={<DeleteOutlined />}
              />
            </Popconfirm>
          </Tooltip>
        </Space>
      )
    }
  ]

  return (
    <div className="p-6 bg-gray-50 min-h-screen" style={{ padding: "24px" }}>
      {/* Header */}
      <div className="mb-6">
        <Row justify="space-between" align="middle">
          <Col>
            <Title level={2} className="mb-2">Quản lý giao dịch</Title>
            <Text type="secondary">Theo dõi thu chi và quản lý tài chính cá nhân</Text>
          </Col>
          <Col>
            <Space>
              <Button icon={<ImportOutlined />} className="hidden sm:inline-flex">
                Nhập Excel
              </Button>
              <Button icon={<ExportOutlined />} className="hidden sm:inline-flex">
                Xuất Excel
              </Button>
              <Button 
                type="primary" 
                icon={<PlusOutlined />}
                onClick={handleAddTransaction}
                size="middle"
              >
                Thêm giao dịch
              </Button>
            </Space>
          </Col>
        </Row>
      </div>

      {/* Statistics Cards */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={8}>
          <Card className="text-center">
            <Statistic
              title="Thu nhập"
              value={totalIncome}
              formatter={(value) => formatCurrency(Number(value))}
              valueStyle={{ color: '#52c41a' }}
              prefix={<ArrowUpOutlined  />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card className="text-center">
            <Statistic
              title="Chi tiêu"
              value={totalExpense}
              formatter={(value) => formatCurrency(Number(value))}
              valueStyle={{ color: '#f5222d' }}
              prefix={<ArrowDownOutlined  />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card className="text-center">
            <Statistic
              title="Số dư ròng"
              value={netAmount}
              formatter={(value) => formatCurrency(Number(value))}
              valueStyle={{ color: netAmount >= 0 ? '#52c41a' : '#f5222d' }}
              prefix={<SwapOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* Filters */}
      <Card className="mb-6">
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={6}>
            <Search
              placeholder="Tìm kiếm mô tả..."
              allowClear
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              prefix={<SearchOutlined />}
            />
          </Col>
          
          <Col xs={24} sm={4}>
            <Select
              placeholder="Danh mục"
              allowClear
              // value={selectedCategory}
              onChange={setSelectedCategory}
              className="w-full"
              style={{width: '200px'}}
            >
              {[...categories.income, ...categories.expense].map(cat => (
                <Option key={cat} value={cat}>{cat}</Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} sm={6}>
            <RangePicker
              placeholder={['Từ ngày', 'Đến ngày']}
              onChange={(dates) => setDateRange(dates as [Dayjs, Dayjs] | [])}
              className="w-full"
              format="DD/MM/YYYY"
            />
          </Col>
          <Col xs={24} sm={4}>
            <Button 
              icon={<FilterOutlined />}
              onClick={() => {
                setSearchText('')
                setSelectedType('')
                setSelectedCategory('')
                setDateRange([])
              }}
              className="w-full"
            >
              Xóa bộ lọc
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Transactions Table */}
      <Card>
        <Table 
          columns={columns} 
          dataSource={filteredData}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => 
              `${range[0]}-${range[1]} của ${total} giao dịch`,
          }}
          scroll={{ x: 800 }}
          className="transaction-table"
        />
      </Card>

      {/* Add/Edit Transaction Modal */}
      <Modal
        title={editingTransaction ? "Sửa giao dịch" : "Thêm giao dịch mới"}
        open={isModalOpen}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        okText={editingTransaction ? "Cập nhật" : "Thêm giao dịch"}
        cancelText="Hủy"
        width={600}
        destroyOnClose
      >
        <Form form={form} layout="vertical" autoComplete="off">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Loại giao dịch"
                name="type"
                rules={[{ required: true, message: 'Vui lòng chọn loại giao dịch!' }]}
              >
                <Select placeholder="Chọn loại giao dịch" size="large">
                  <Option value="income">
                    <Space>
                      <UpOutlined style={{ color: '#52c41a' }} />
                      Thu nhập
                    </Space>
                  </Option>
                  <Option value="expense">
                    <Space>
                      <DownOutlined style={{ color: '#f5222d' }} />
                      Chi tiêu
                    </Space>
                  </Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Ngày"
                name="date"
                rules={[{ required: true, message: 'Vui lòng chọn ngày!' }]}
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

          <Form.Item
            label="Mô tả"
            name="desc"
            rules={[
              { required: true, message: 'Vui lòng nhập mô tả!' },
              { min: 3, message: 'Mô tả phải có ít nhất 3 ký tự!' }
            ]}
          >
            <Input 
              placeholder="Ví dụ: Ăn trưa tại nhà hàng..."
              size="large"
            />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Danh mục"
                name="category"
                rules={[{ required: true, message: 'Vui lòng chọn danh mục!' }]}
              >
                <Select placeholder="Chọn danh mục" size="large">
                  {Form.useWatch('type', form) === 'income' ? 
                    categories.income.map(cat => (
                      <Option key={cat} value={cat}>{cat}</Option>
                    )) :
                    categories.expense.map(cat => (
                      <Option key={cat} value={cat}>{cat}</Option>
                    ))
                  }
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Tài khoản"
                name="account"
                rules={[{ required: true, message: 'Vui lòng chọn tài khoản!' }]}
              >
                <Select placeholder="Chọn tài khoản" size="large">
                  {accounts.map(acc => (
                    <Option key={acc} value={acc}>{acc}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label="Số tiền"
            name="amount"
            rules={[
              { required: true, message: 'Vui lòng nhập số tiền!' },
              { type: 'number', min: 1, message: 'Số tiền phải lớn hơn 0!' }
            ]}
          >
            <InputNumber
              placeholder="0"
              size="large"
              className="w-full"
              formatter={(value) => 
                `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
              }
              // parser={(value) => value ? value.replace(/\$\s?|(,*)/g, '') : ''}
              addonAfter="VND"
              min={0}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}