import { useContext, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  Avatar, Badge, Button, Drawer, Dropdown, Grid, Layout, Menu, Space, message
} from 'antd';
import {
  AlertOutlined, BellOutlined, FileProtectOutlined, HeartOutlined, HomeOutlined,
  LogoutOutlined, MenuOutlined, ProfileOutlined, QrcodeOutlined,
  SafetyCertificateOutlined, UserOutlined
} from '@ant-design/icons';
import { AuthContext } from '../context/AuthContext';
import logo from '../assests/logo.png';
import './MemberPortalLayout.css';

const { Header, Sider, Content } = Layout;
const { useBreakpoint } = Grid;

const portalItems = [
  { key: '/dashboard', icon: <HomeOutlined />, label: 'Overview' },
  { key: '/profile', icon: <ProfileOutlined />, label: 'My Profile' },
  { key: '/medical-profile', icon: <SafetyCertificateOutlined />, label: 'Medical Profile' },
  { key: '/recommendations', icon: <HeartOutlined />, label: 'Recommendations' },
  { key: '/emergency', icon: <QrcodeOutlined />, label: 'Emergency' },
  { key: '/documents', icon: <FileProtectOutlined />, label: 'Documents' },
  { key: '/emergency-alerts', icon: <AlertOutlined />, label: 'Emergency Alerts' },
];

const MemberPortalLayout = () => {
  const { user, logout } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();
  const screens = useBreakpoint();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const desktop = screens.lg;
  const selectedKey = portalItems.find(({ key }) => key === location.pathname)?.key || '/dashboard';

  const openRoute = ({ key }) => {
    navigate(key);
    setDrawerOpen(false);
  };

  const handleLogout = () => {
    logout();
    message.success('You have successfully logged out.');
    navigate('/', { replace: true });
  };

  const menu = <Menu mode="inline" selectedKeys={[selectedKey]} items={portalItems} onClick={openRoute} />;
  const accountItems = [
    { key: 'profile', icon: <ProfileOutlined />, label: 'My profile' },
    { type: 'divider' },
    { key: 'logout', icon: <LogoutOutlined />, label: 'Logout', danger: true }
  ];

  return (
    <Layout className="member-portal-shell">
      {desktop && (
        <Sider width={236} theme="light" className="member-portal-sider">
          <button type="button" className="member-brand" onClick={() => navigate('/dashboard')} aria-label="ElderlyCare dashboard">
            <img src={logo} alt="ElderlyCare" />
          </button>
          <nav aria-label="Member navigation">{menu}</nav>
          <Button type="text" danger icon={<LogoutOutlined />} className="member-logout" onClick={handleLogout}>Logout</Button>
        </Sider>
      )}

      <Layout className="member-portal-main">
        <Header className="member-portal-header">
          {!desktop && <Button type="text" icon={<MenuOutlined />} aria-label="Open member menu" onClick={() => setDrawerOpen(true)} />}
          {!desktop && <img className="member-mobile-logo" src={logo} alt="ElderlyCare" />}
          <Space className="member-header-actions">
            <Badge dot color="#ff6b00"><Button type="text" icon={<BellOutlined />} aria-label="Notifications" onClick={() => navigate('/emergency-alerts')} /></Badge>
            <Dropdown
              trigger={['click']}
              menu={{ items: accountItems, onClick: ({ key }) => key === 'logout' ? handleLogout() : navigate('/profile') }}
            >
              <Button type="text" className="member-account-button">
                <Avatar size="small" icon={<UserOutlined />} />
                <span>{user?.name || 'Member'}</span>
              </Button>
            </Dropdown>
          </Space>
        </Header>
        <Content className="member-portal-content"><Outlet /></Content>
      </Layout>

      <Drawer title="ElderlyCare" placement="left" width={286} open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        {menu}
        <Button type="text" danger block icon={<LogoutOutlined />} onClick={handleLogout}>Logout</Button>
      </Drawer>

      {!desktop && (
        <nav className="member-bottom-nav" aria-label="Mobile member navigation">
          {portalItems.filter(({ key }) => key !== '/medical-profile' && key !== '/emergency-alerts').map((item) => (
            <button key={item.key} type="button" className={selectedKey === item.key ? 'active' : ''} onClick={() => openRoute(item)}>
              {item.icon}<span>{item.label.replace('Emergency ', '')}</span>
            </button>
          ))}
        </nav>
      )}
    </Layout>
  );
};

export default MemberPortalLayout;
