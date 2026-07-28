import React from 'react';
import { Menu, Typography } from 'antd';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  AuditOutlined, DashboardOutlined, MessageOutlined, UserOutlined
} from '@ant-design/icons';

const entries = [
  { key: '/admin/dashboard', label: 'Dashboard', icon: <DashboardOutlined /> },
  { key: '/admin/users', label: 'Users', icon: <UserOutlined /> },
  { key: '/admin/audit-logs', label: 'Audit Logs', icon: <AuditOutlined /> },
  { key: '/admin/contacts', label: 'Contact Us', icon: <MessageOutlined /> }
];

const AdminSidebar = ({ collapsed, onClose }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const selected = location.pathname.startsWith('/admin/users') ? '/admin/users' : location.pathname;

  return (
    <>
      <div className="admin-ant-brand">
        <span className="admin-ant-brand-mark">EC</span>
        {!collapsed && <span>ElderlyCare<br /><Typography.Text style={{ color: '#dbe8ff', fontSize: 12 }}>ADMINISTRATION</Typography.Text></span>}
      </div>
      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={[selected]}
        items={entries}
        onClick={({ key }) => {
          navigate(key);
          onClose?.();
        }}
      />
    </>
  );
};

export default AdminSidebar;
