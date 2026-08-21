import { useContext, useEffect, useRef, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Avatar, Button, Drawer, Grid, Input, Layout, Menu, Space, message } from 'antd';
import {
  AlertOutlined,
  FileProtectOutlined,
  HeartOutlined,
  HomeOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuOutlined,
  MenuUnfoldOutlined,
  ProfileOutlined,
  QrcodeOutlined,
  SafetyCertificateOutlined,
  SearchOutlined,
  UserOutlined
} from '@ant-design/icons';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import logo from '../assests/logo.png';
import './MemberPortalLayout.css';

const { Header, Sider, Content } = Layout;
const { useBreakpoint } = Grid;

const portalItems = [
  { key: '/dashboard', icon: <HomeOutlined />, label: 'Overview' },
  { key: '/profile', icon: <ProfileOutlined />, label: 'My Profile' },
  { key: '/medical-profile', icon: <SafetyCertificateOutlined />, label: 'Medical Profile' },
  { key: '/recommendations', icon: <HeartOutlined />, label: 'Recommendations' },
  { key: '/emergency', icon: <QrcodeOutlined />, label: 'ID Card' },
  { key: '/documents', icon: <FileProtectOutlined />, label: 'Documents' },
  { key: '/emergency-alerts', icon: <AlertOutlined />, label: 'Emergency Alerts' }
];

const MemberPortalLayout = () => {
  const { user, logout } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();
  const screens = useBreakpoint();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const photoUrlRef = useRef('');
  const desktop = screens.lg;
  const selectedKey = portalItems.find(({ key }) => key === location.pathname)?.key || '/dashboard';

  useEffect(() => {
    if (!user?._id) return undefined;
    let active = true;
    api
      .get(`/api/medical/${user._id}/photo`, { responseType: 'blob' })
      .then(({ data }) => {
        if (!active || !data?.size) return;
        const nextUrl = URL.createObjectURL(data);
        if (photoUrlRef.current) URL.revokeObjectURL(photoUrlRef.current);
        photoUrlRef.current = nextUrl;
        setPhotoUrl(nextUrl);
      })
      .catch(() => {
        if (active) setPhotoUrl('');
      });
    return () => {
      active = false;
      if (photoUrlRef.current) URL.revokeObjectURL(photoUrlRef.current);
      photoUrlRef.current = '';
    };
  }, [user?._id]);

  const openRoute = ({ key }) => {
    navigate(key);
    setDrawerOpen(false);
  };

  const handleLogout = () => {
    logout();
    message.success('You have successfully logged out.');
    navigate('/', { replace: true });
  };

  const handleSearch = (value) => {
    const query = value.trim().toLowerCase();
    const match = portalItems.find(({ label }) => label.toLowerCase().includes(query));
    if (match) navigate(match.key);
    else if (query) message.info('No matching portal page found.');
  };

  const menu = (
    <Menu mode="inline" selectedKeys={[selectedKey]} items={portalItems} onClick={openRoute} />
  );
  return (
    <Layout className="member-portal-shell">
      {desktop && (
        <Sider
          width={250}
          collapsedWidth={76}
          collapsed={collapsed}
          trigger={null}
          theme="light"
          className="member-portal-sider"
        >
          <Button
            type="text"
            className="member-brand"
            onClick={() => navigate('/dashboard')}
            aria-label="ElderlyCare dashboard"
          >
            <img src={collapsed ? '/favicon.png' : logo} alt="ElderlyCare" />
          </Button>
          <nav aria-label="Member navigation">{menu}</nav>
          <Button
            type="text"
            danger
            icon={<LogoutOutlined />}
            className="member-logout"
            onClick={handleLogout}
          >
            {!collapsed && 'Logout'}
          </Button>
        </Sider>
      )}

      <Layout
        className={`member-portal-main${collapsed && desktop ? ' member-portal-main-collapsed' : ''}`}
      >
        <Header className="member-portal-header">
          {!desktop && (
            <Button
              type="text"
              icon={<MenuOutlined />}
              aria-label="Open member menu"
              onClick={() => setDrawerOpen(true)}
            />
          )}
          {!desktop && <img className="member-mobile-logo" src={logo} alt="ElderlyCare" />}
          {desktop && (
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              aria-label={collapsed ? 'Show sidebar' : 'Hide sidebar'}
              onClick={() => setCollapsed((value) => !value)}
            />
          )}
          {desktop && (
            <Space.Compact className="member-global-search">
              <Input
                value={searchText}
                onChange={(event) => setSearchText(event.target.value)}
                prefix={<SearchOutlined />}
                placeholder="Search anything..."
                allowClear
                onPressEnter={() => handleSearch(searchText)}
              />
              <Button type="primary" onClick={() => handleSearch(searchText)}>
                Search
              </Button>
            </Space.Compact>
          )}
          <Space className="member-header-actions">
            <Button
              type="text"
              className="member-account-summary"
              aria-label="Open profile"
              onClick={() => navigate('/profile')}
            >
              <Avatar size="small" src={photoUrl || undefined} icon={<UserOutlined />} />
            </Button>
          </Space>
        </Header>
        <Content className="member-portal-content">
          <Outlet />
        </Content>
      </Layout>

      <Drawer
        title="ElderlyCare"
        placement="left"
        width={286}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      >
        {menu}
        <Button type="text" danger block icon={<LogoutOutlined />} onClick={handleLogout}>
          Logout
        </Button>
      </Drawer>

      {!desktop && (
        <nav className="member-bottom-nav" aria-label="Mobile member navigation">
          {portalItems
            .filter(({ key }) => key !== '/medical-profile' && key !== '/emergency-alerts')
            .map((item) => (
              <button
                key={item.key}
                type="button"
                className={selectedKey === item.key ? 'active' : ''}
                onClick={() => openRoute(item)}
              >
                {item.icon}
                <span>{item.label.replace('Emergency ', '')}</span>
              </button>
            ))}
        </nav>
      )}
    </Layout>
  );
};

export default MemberPortalLayout;
