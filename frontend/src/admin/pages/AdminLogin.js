import React, { useContext, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AdminAuthContext } from '../context/AdminAuthContext';
import '../styles/AdminAuth.css';

const AdminLogin = () => {
  const { admin, login, sessionMessage } = useContext(AdminAuthContext);
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (admin) navigate('/admin/dashboard', { replace: true });
  }, [admin, navigate]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(formData);
      const destination = location.state?.from?.startsWith('/admin/')
        ? location.state.from
        : '/admin/dashboard';
      navigate(destination, { replace: true });
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to log in. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="admin-auth-page">
      <section className="admin-login-card" aria-labelledby="admin-login-title">
        <div className="admin-brand-mark" aria-hidden="true">EC</div>
        <p className="admin-eyebrow">ElderlyCare Administration</p>
        <h1 id="admin-login-title">Admin sign in</h1>
        <p className="admin-login-intro">Use your authorized administrator account to continue.</p>

        {(error || sessionMessage) && (
          <div className="admin-alert admin-alert-error" role="alert">
            {error || sessionMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="admin-login-form">
          <div className="admin-field">
            <label htmlFor="admin-email">Email address</label>
            <input
              id="admin-email"
              name="email"
              type="email"
              autoComplete="username"
              value={formData.email}
              onChange={(event) => setFormData((current) => ({ ...current, email: event.target.value }))}
              required
              disabled={loading}
            />
          </div>

          <div className="admin-field">
            <label htmlFor="admin-password">Password</label>
            <div className="admin-password-input">
              <input
                id="admin-password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                value={formData.password}
                onChange={(event) => setFormData((current) => ({ ...current, password: event.target.value }))}
                required
                disabled={loading}
              />
              <button
                type="button"
                className="admin-password-toggle"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                aria-pressed={showPassword}
                onClick={() => setShowPassword((current) => !current)}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          <button className="admin-primary-button" type="submit" disabled={loading}>
            {loading ? 'Signing in…' : 'Sign in securely'}
          </button>
        </form>
      </section>
    </main>
  );
};

export default AdminLogin;
