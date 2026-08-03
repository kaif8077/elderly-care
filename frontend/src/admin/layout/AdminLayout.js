import React, { useState } from 'react';
import { Drawer, Layout } from 'antd';
import { Outlet, useLocation } from 'react-router-dom';
import AdminSidebar from '../components/AdminSidebar';
import AdminTopbar from '../components/AdminTopbar';
import '../styles/AdminLayout.css';

const { Sider, Header, Content } = Layout;
const titles = {
  '/admin/dashboard': 'Dashboard',
  '/admin/users': 'Users',
  '/admin/audit-logs': 'Audit logs',
  '/admin/contacts': 'Contact messages'
};

const AdminLayout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const title = titles[location.pathname]
    || (location.pathname.startsWith('/admin/users/') ? 'User details' : null)
    || (location.pathname.startsWith('/admin/id-cards/') ? 'ID card' : 'Administration');
  const sidebarWidth = collapsed ? 80 : 260;

  return (
    <Layout className="admin-ant-layout">
      <Sider
        className="admin-ant-sider admin-ant-desktop"
        width={260}
        collapsedWidth={80}
        collapsed={collapsed}
        theme="dark"
        trigger={null}
      >
        <AdminSidebar collapsed={collapsed} />
      </Sider>

      <Drawer
        className="admin-mobile-drawer"
        placement="left"
        width={300}
        title="ElderlyCare Administration"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        styles={{ body: { padding: 0, background: '#001529' } }}
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
          <div className="admin-ant-page"><Outlet /></div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default AdminLayout;
