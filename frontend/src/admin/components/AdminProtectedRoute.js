import React, { useContext } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { AdminAuthContext } from '../context/AdminAuthContext';

const AdminProtectedRoute = ({ children }) => {
  const { admin, loading } = useContext(AdminAuthContext);
  const location = useLocation();

  if (loading) {
    return (
      <main className="admin-session-loading" aria-live="polite">
        <div className="admin-spinner" aria-hidden="true" />
        <p>Checking your secure admin session…</p>
      </main>
    );
  }

  if (!admin || !['admin', 'super_admin'].includes(admin.role)) {
    return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />;
  }

  return children;
};

export default AdminProtectedRoute;
