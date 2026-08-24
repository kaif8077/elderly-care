import React, { useState } from 'react';
import { Drawer, Layout } from 'antd';
import { Outlet, useLocation } from 'react-router-dom';
import AdminSidebar from '../components/AdminSidebar';
import AdminTopbar from '../components/AdminTopbar';
import '../styles/AdminLayout.css';
import '../styles/AdminPortal.css';
import logo from '../../assests/logo.png';

const { Sider, Header, Content } = Layout;
const titles = {
  '/admin/dashboard': 'Dashboard',
  '/admin/users': 'Users',
  '/admin/emergency-alerts': 'Emergency alerts',
  '/admin/audit-logs': 'Audit logs',
  '/admin/contacts': 'Contact messages'
};

const AdminLayout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const title =
    titles[location.pathname] ||
    (location.pathname.startsWith('/admin/users/') ? 'User details' : null) ||
    (location.pathname.startsWith('/admin/id-cards/') ? 'ID card' : 'Administration');
  const sidebarWidth = collapsed ? 76 : 250;

  return (
    <Layout className="admin-ant-layout">
      <Sider
        className="admin-ant-sider admin-ant-desktop"
        width={250}
        collapsedWidth={76}
        collapsed={collapsed}
        theme="light"
        trigger={null}
      >
        <AdminSidebar collapsed={collapsed} />
      </Sider>

      <Drawer
        className="admin-mobile-drawer"
        placement="left"
        width={286}
        title={<img className="admin-drawer-logo" src={logo} alt="ElderlyCare" />}
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        styles={{ body: { padding: 0, background: '#ffffff' } }}
      >
        <AdminSidebar onClose={() => setMobileOpen(false)} />
      </Drawer>

      <Layout className="admin-ant-main" style={{ marginLeft: sidebarWidth }}>
        <Header className="admin-ant-header">
          <AdminTopbar
            title={title}
            onMenu={() => setMobileOpen(true)}
            collapsed={collapsed}
            onCollapse={() => setCollapsed((value) => !value)}
          />
        </Header>
        <Content className="admin-ant-content">
          <div className="admin-ant-page">
            <Outlet />
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default AdminLayout;
