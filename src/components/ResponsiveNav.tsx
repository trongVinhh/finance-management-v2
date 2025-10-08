import React, { useState } from 'react';
import { Layout, Menu, Button, Drawer, Typography } from 'antd';
import {
  MenuOutlined,
  DashboardOutlined,
  TransactionOutlined,
  SettingOutlined,
  WalletOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  LogoutOutlined,
  TagsOutlined,
  CreditCardOutlined,
  MoneyCollectOutlined,
  AccountBookOutlined,
} from '@ant-design/icons';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const { Sider, Content } = Layout;
const { Title } = Typography;

interface ResponsiveNavProps {
  children: React.ReactNode;
}

export default function ResponsiveNav({ children }: ResponsiveNavProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
    setMobileMenuOpen(false);
  };

  const menuItems = [
    { key: '/', label: <Link to="/">Dashboard</Link>, icon: <DashboardOutlined /> },
    { key: '/transactions', label: <Link to="/transactions">Giao dịch</Link>, icon: <TransactionOutlined /> },
    { key: '/accounts', label: <Link to="/accounts">Tài khoản</Link>, icon: <WalletOutlined /> },
    { key: '/categories', label: <Link to="/categories">Danh mục</Link>, icon: <TagsOutlined /> },
    { key: '/income', label: <Link to="/income">Thu</Link>, icon: <ArrowUpOutlined /> },
    { key: '/expense', label: <Link to="/expense">Chi</Link>, icon: <ArrowDownOutlined /> },
    { key: '/debts', label: <Link to="/debts">Quản lí nợ</Link>, icon: <MoneyCollectOutlined /> },
    { key: '/loans', label: <Link to="/loans">Quản lí vay</Link>, icon: <CreditCardOutlined  /> },
    { key: '/personal-accounts', label: <Link to="/personal-accounts">Tài khoản cá nhân</Link>, icon: <AccountBookOutlined  /> },
    { key: '/settings', label: <Link to="/settings">Cài đặt</Link>, icon: <SettingOutlined /> },
    {
      key: 'logout',
      label: <span onClick={handleLogout}>Đăng xuất</span>,
      icon: <LogoutOutlined />,
    },
  ];

  const handleMenuClick = () => {
    setMobileMenuOpen(false);
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* Desktop Sidebar */}
      <Sider
        theme="dark"
        width={200}
        style={{
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
          zIndex: 1000,
        }}
        className="desktop-sidebar"
      >
        <div style={{ 
          color: 'white', 
          padding: '16px', 
          fontWeight: 'bold',
          fontSize: '16px',
          textAlign: 'center',
          borderBottom: '1px solid #303030'
        }}>
          Quản lí tài chính
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          style={{ border: 'none' }}
        />
      </Sider>

      {/* Mobile Header */}
      <div className="mobile-header">
        <Button
          type="text"
          icon={<MenuOutlined />}
          onClick={() => setMobileMenuOpen(true)}
          style={{
            color: 'white',
            fontSize: '18px',
            height: '48px',
            width: '48px',
          }}
        />
        <Title level={4} style={{ color: 'white', margin: 0 }}>
          Quản lí tài chính
        </Title>
        <div style={{ width: '48px' }} />
      </div>

      {/* Mobile Drawer */}
      <Drawer
        title="Menu"
        placement="left"
        onClose={() => setMobileMenuOpen(false)}
        open={mobileMenuOpen}
        width={250}
        bodyStyle={{ padding: 0 }}
        headerStyle={{ backgroundColor: '#001529', color: 'white' }}
      >
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={handleMenuClick}
          style={{ border: 'none', height: '100%' }}
        />
      </Drawer>

      {/* Main Content */}
      <Layout style={{ marginLeft: '200px' }} className="main-layout">
        <Content style={{ background: '#f5f5f5', minHeight: '100vh' }}>
          {children}
        </Content>
      </Layout>

    </Layout>
  );
}
