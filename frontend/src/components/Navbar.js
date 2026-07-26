import React, { useContext, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Avatar, Button, Drawer, Dropdown, Flex, Grid, Image, Layout, Menu, Space, Typography, message
} from 'antd';
import {
  AppstoreOutlined, ContactsOutlined, HomeOutlined, InfoCircleOutlined,
  LoginOutlined, LogoutOutlined, MenuOutlined, ProfileOutlined,
  UserAddOutlined, UserOutlined
} from '@ant-design/icons';
import { AuthContext } from '../context/AuthContext';
import logoImage from '../assests/logo.png';

const { Header } = Layout;
const { Text } = Typography;
const { useBreakpoint } = Grid;

const publicItems = [
  { key: '/', icon: <HomeOutlined />, label: 'Home' },
  { key: '/about', icon: <InfoCircleOutlined />, label: 'About Us' },
  { key: '/services', icon: <AppstoreOutlined />, label: 'Services' },
  { key: '/contact', icon: <ContactsOutlined />, label: 'Contact Us' }
];

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();
  const screens = useBreakpoint();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const desktop = screens.md;

  const selectedKey = publicItems.some(({ key }) => key === location.pathname)
    ? location.pathname
    : '';

  const openRoute = ({ key }) => {
    navigate(key);
    setDrawerOpen(false);
  };

  const handleLogout = () => {
    logout();
    message.success('You have successfully logged out.');
    setDrawerOpen(false);
    navigate('/', { replace: true });
  };

  const accountItems = user
    ? [
        { key: '/profile', icon: <ProfileOutlined />, label: 'My Profile' },
        { key: '/dashboard', icon: <AppstoreOutlined />, label: 'Dashboard' },
        { type: 'divider' },
        { key: 'logout', icon: <LogoutOutlined />, label: 'Logout', danger: true }
      ]
    : [
        { key: '/login', icon: <LoginOutlined />, label: 'Login' },
        { key: '/register', icon: <UserAddOutlined />, label: 'Register' }
      ];

  const accountClick = ({ key }) => {
    if (key === 'logout') handleLogout();
    else openRoute({ key });
  };

  return (
    <Header
      aria-label="Primary navigation"
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        width: '100%',
        paddingInline: 35,
        padding:7,
        background: '#fff',
        borderBottom: '1px solid #d8dee9'
      }}
    >
      <Flex align="center" justify="space-between" gap={20}>
        <Link to="/" aria-label="ElderlyCare home">
          <Image src={logoImage} alt="ElderlyCare" preview={false} height={52} />
        </Link>

        {desktop ? (
          <>
            <Menu
              mode="horizontal"
              selectedKeys={[selectedKey]}
              items={publicItems}
              onClick={openRoute}
              style={{ flex: 1, justifyContent: 'center', minWidth: 0, borderBottom: 0 }}
            />
            <Dropdown menu={{ items: accountItems, onClick: accountClick }} trigger={['click']} placement="bottomRight">
              <Button type="text" icon={<Avatar size="small" icon={<UserOutlined />} />}>
                {user?.name || 'Account'}
              </Button>
            </Dropdown>
          </>
        ) : (
          <Button
            type="text"
            icon={<MenuOutlined />}
            aria-label="Open navigation menu"
            onClick={() => setDrawerOpen(true)}
          />
        )}
      </Flex>

      <Drawer
        title={
          <Space>
            <Avatar src="/favicon.png" shape="square" />
            <Text strong>ElderlyCare</Text>
          </Space>
        }
        placement="right"
        width={300}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      >
        <Menu
          mode="inline"
          selectedKeys={[selectedKey || location.pathname]}
          items={publicItems}
          onClick={openRoute}
        />
        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          items={accountItems}
          onClick={accountClick}
          style={{ marginTop: 16 }}
        />
      </Drawer>
    </Header>
  );
};

export default Navbar;
