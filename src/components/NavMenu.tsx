import { Menu } from 'antd'
import {
  AppstoreOutlined,
  SettingOutlined,
  WalletOutlined,
  UserOutlined,
  DollarOutlined,
  LogoutOutlined,
  TagsOutlined,
} from '@ant-design/icons'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

const items = [
  { label: <Link to="/">Dashboard</Link>, key: '/', icon: <AppstoreOutlined /> },
  { label: <Link to="/transactions">Giao dịch</Link>, key: '/transactions', icon: <WalletOutlined /> },
  { label: <Link to="/accounts">Tài khoản</Link>, key: '/accounts', icon: <UserOutlined /> },
  { label: <Link to="/categories">Danh mục</Link>, key: '/categories', icon: <TagsOutlined /> },
  { label: <Link to="/income">Thu</Link>, key: '/income', icon: <DollarOutlined /> },
  { label: <Link to="/expenses">Chi</Link>, key: '/expenses', icon: <DollarOutlined /> },
  { label: <Link to="/settings">Cài đặt</Link>, key: '/settings', icon: <SettingOutlined /> },
]

export default function NavMenu() {
  const location = useLocation()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/login')
  }

  return (
    <Menu
      theme="dark"
      mode="inline"
      selectedKeys={[location.pathname]}
      items={[
        ...items,
        {
          label: <span onClick={handleLogout}>Đăng xuất</span>,
          key: 'logout',
          icon: <LogoutOutlined />,
        },
      ]}
    />
  )
}
