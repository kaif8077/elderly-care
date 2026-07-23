import React, { useContext, useState } from 'react';
import { FaBars, FaBell, FaChevronLeft, FaChevronRight, FaSearch } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { AdminAuthContext } from '../context/AdminAuthContext';

const AdminTopbar = ({ title, onMenu, collapsed, onCollapse }) => {
  const { admin, logout } = useContext(AdminAuthContext);
  const [search, setSearch] = useState('');
  const [loggingOut, setLoggingOut] = useState(false);
  const navigate = useNavigate();

  const submitSearch = (event) => {
    event.preventDefault();
    const query = search.trim();
    navigate(query ? `/admin/users?search=${encodeURIComponent(query)}` : '/admin/users');
  };

  const handleLogout = async () => {
    setLoggingOut(true);
    await logout();
    navigate('/admin/login', { replace: true });
  };

  return (
    <header className="admin-topbar">
      <div className="admin-topbar-title">
        <button className="admin-icon-button admin-mobile-menu" onClick={onMenu} aria-label="Open navigation">
          <FaBars />
        </button>
        <button
          className="admin-icon-button admin-collapse-button"
          onClick={onCollapse}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <FaChevronRight /> : <FaChevronLeft />}
        </button>
        <div>
          <p className="admin-topbar-eyebrow">Admin workspace</p>
          <h1>{title}</h1>
        </div>
      </div>

      <form className="admin-global-search" role="search" onSubmit={submitSearch}>
        <FaSearch aria-hidden="true" />
        <label className="admin-visually-hidden" htmlFor="admin-global-search">Search users</label>
        <input
          id="admin-global-search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search users"
        />
      </form>

      <div className="admin-topbar-actions">
        <button className="admin-icon-button" aria-label="Notifications unavailable" disabled>
          <FaBell />
        </button>
        <div className="admin-profile-summary">
          <span className="admin-avatar" aria-hidden="true">{admin?.name?.charAt(0) || 'A'}</span>
          <span><strong>{admin?.name}</strong><small>{admin?.role}</small></span>
        </div>
        <button className="admin-text-button" onClick={handleLogout} disabled={loggingOut}>
          {loggingOut ? 'Logging out…' : 'Logout'}
        </button>
      </div>
    </header>
  );
};

export default AdminTopbar;
