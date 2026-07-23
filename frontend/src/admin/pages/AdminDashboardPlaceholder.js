import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminAuthContext } from '../context/AdminAuthContext';
import adminApi from '../../services/adminApi';
import '../styles/AdminAuth.css';

const AdminDashboardPlaceholder = () => {
  const { admin, logout } = useContext(AdminAuthContext);
  const [loggingOut, setLoggingOut] = useState(false);
  const [sessionStatus, setSessionStatus] = useState('');
  const navigate = useNavigate();

  const handleLogout = async () => {
    setLoggingOut(true);
    await logout();
    navigate('/admin/login', { replace: true });
  };

  const verifyPermission = async () => {
    setSessionStatus('Checking protected permission…');
    try {
      await adminApi.get('/auth/session-check');
      setSessionStatus('Secure admin session and dashboard permission verified.');
    } catch (error) {
      setSessionStatus('The secure session could not be verified.');
    }
  };

  return (
    <main className="admin-placeholder-page">
      <header className="admin-placeholder-header">
        <div>
          <p className="admin-eyebrow">ElderlyCare Administration</p>
          <h1>Admin dashboard</h1>
          <p>Signed in as {admin?.name} ({admin?.role})</p>
        </div>
        <button className="admin-secondary-button" onClick={handleLogout} disabled={loggingOut}>
          {loggingOut ? 'Logging out…' : 'Logout'}
        </button>
      </header>

      {admin?.mustChangePassword && (
        <div className="admin-alert admin-alert-warning" role="alert">
          This account is using its initial development password. Change it before production use.
        </div>
      )}

      <section className="admin-placeholder-card">
        <h2>Phase 1 security is active</h2>
        <p>
          This temporary landing page confirms that admin authentication, role checks,
          HttpOnly-cookie sessions, and protected routing are working. Dashboard statistics
          and user management will be added in Phase 2.
        </p>
        <button className="admin-primary-button admin-inline-button" onClick={verifyPermission}>
          Verify protected permission
        </button>
        {sessionStatus && <p className="admin-session-status" aria-live="polite">{sessionStatus}</p>}
      </section>
    </main>
  );
};

export default AdminDashboardPlaceholder;
