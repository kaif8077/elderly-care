import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import AdminSidebar from '../components/AdminSidebar';
import AdminTopbar from '../components/AdminTopbar';
import '../styles/AdminLayout.css';

const titles = {
  '/admin/dashboard': 'Dashboard',
  '/admin/users': 'Users'
};

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const title = titles[location.pathname] || 'Administration';

  return (
    <div className={`admin-shell ${collapsed ? 'sidebar-collapsed' : ''}`}>
      <AdminSidebar
        open={sidebarOpen}
        collapsed={collapsed}
        onClose={() => setSidebarOpen(false)}
      />
      <div className="admin-shell-main">
        <AdminTopbar
          title={title}
          onMenu={() => setSidebarOpen(true)}
          collapsed={collapsed}
          onCollapse={() => setCollapsed((value) => !value)}
        />
        <div className="admin-page-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
