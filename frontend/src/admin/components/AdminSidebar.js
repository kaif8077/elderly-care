import { useContext, useState } from 'react';
import { Button, Menu, message } from 'antd';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  AlertOutlined, AuditOutlined, DashboardOutlined, LogoutOutlined,
  MessageOutlined, UserOutlined
} from '@ant-design/icons';
import { AdminAuthContext } from '../context/AdminAuthContext';
import logo from '../../assests/logo.png';

const entries = [
  { key: '/admin/dashboard', label: 'Dashboard', icon: <DashboardOutlined /> },
  { key: '/admin/users', label: 'Users', icon: <UserOutlined /> },
  { key: '/admin/emergency-alerts', label: 'Emergency Alerts', icon: <AlertOutlined /> },
  { key: '/admin/audit-logs', label: 'Audit Logs', icon: <AuditOutlined /> },
  { key: '/admin/contacts', label: 'Contact Us', icon: <MessageOutlined /> }
];

const AdminSidebar = ({ collapsed = false, onClose }) => {
  const { logout } = useContext(AdminAuthContext);
  const location = useLocation();
  const navigate = useNavigate();
  const [loggingOut, setLoggingOut] = useState(false);
  const selected = location.pathname.startsWith('/admin/users') || location.pathname.startsWith('/admin/id-cards')
    ? '/admin/users' : location.pathname;

  const exit = async () => {
    setLoggingOut(true);
    try {
      await logout();
      message.success('Administrator logged out.');
      navigate('/', { replace: true });
    } finally {
      setLoggingOut(false);
      onClose?.();
    }
  };

  return (
    <div className="admin-portal-sidebar-inner">
      <Button type="text" className="admin-portal-brand" onClick={() => navigate('/admin/dashboard')} aria-label="ElderlyCare administration dashboard">
        <img src={collapsed ? '/favicon.png' : logo} alt="ElderlyCare" />
      </Button>
      <nav aria-label="Administration navigation">
        <Menu
          mode="inline"
          selectedKeys={[selected]}
          items={entries}
          onClick={({ key }) => { navigate(key); onClose?.(); }}
        />
      </nav>
      <Button type="text" danger icon={<LogoutOutlined />} className="admin-portal-logout" loading={loggingOut} onClick={exit}>
        {!collapsed && 'Logout'}
      </Button>
    </div>
  );
};

export default AdminSidebar;
