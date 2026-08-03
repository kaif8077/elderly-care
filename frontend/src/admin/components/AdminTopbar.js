import React, { useContext, useState } from 'react';
import { Avatar, Button, Dropdown, Input, Space, Typography } from 'antd';
import {
  LogoutOutlined, MenuFoldOutlined, MenuOutlined, MenuUnfoldOutlined,
  SearchOutlined, UserOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { AdminAuthContext } from '../context/AdminAuthContext';

const AdminTopbar = ({ title, onMenu, collapsed, onCollapse }) => {
  const { admin, logout } = useContext(AdminAuthContext);
  const [search, setSearch] = useState('');
  const [loggingOut, setLoggingOut] = useState(false);
  const navigate = useNavigate();

  const searchUsers = () => {
    const query = search.trim();
    navigate(query ? `/admin/users?search=${encodeURIComponent(query)}` : '/admin/users');
  };

  const exit = async () => {
    setLoggingOut(true);
    await logout();
    navigate('/admin/login', { replace: true });
  };

  const accountItems = [{
    key: 'logout',
    label: 'Logout',
    icon: <LogoutOutlined />,
    danger: true,
    onClick: exit
  }];

  return (
    <div className="admin-topbar-inner">
      <div className="admin-topbar-leading">
        <Button
          className="admin-ant-mobile"
          type="text"
          icon={<MenuOutlined />}
          onClick={onMenu}
          aria-label="Open admin navigation"
        />
        <Button
          className="admin-ant-desktop"
          type="text"
          icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          onClick={onCollapse}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        />
        <div className="admin-topbar-heading">
          <Typography.Text>ADMIN PANEL</Typography.Text>
          <Typography.Title level={4}>{title}</Typography.Title>
        </div>
      </div>

      <div className="admin-topbar-tools">
        <Input.Search
          className="admin-topbar-search admin-ant-desktop"
          allowClear
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          onSearch={searchUsers}
          placeholder="Search users"
          enterButton={<SearchOutlined aria-label="Search users" />}
        />
        <Button
          className="admin-ant-mobile"
          type="text"
          icon={<SearchOutlined />}
          onClick={() => navigate('/admin/users')}
          aria-label="Search users"
        />
        <Dropdown menu={{ items: accountItems }} placement="bottomRight" trigger={['click']}>
          <Button className="admin-account-button" type="text" loading={loggingOut}>
            <Space size={8}>
              <Avatar size="small" icon={<UserOutlined />} />
              <span className="admin-account-name">{admin?.name || 'Administrator'}</span>
            </Space>
          </Button>
        </Dropdown>
      </div>
    </div>
  );
};

export default AdminTopbar;
