import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  FaBell, FaClipboardList, FaFileMedical, FaHistory, FaHospitalUser,
  FaIdCard, FaQrcode, FaSlidersH, FaTimes, FaUsers
} from 'react-icons/fa';

const items = [
  { label: 'Dashboard', to: '/admin/dashboard', icon: FaSlidersH, available: true },
  { label: 'Users', to: '/admin/users', icon: FaUsers, available: true },
  { label: 'Medical Profiles', icon: FaHospitalUser },
  { label: 'Reports', to: '/admin/reports', icon: FaFileMedical, available: true },
  { label: 'ID Cards', icon: FaIdCard },
  { label: 'QR Management', icon: FaQrcode },
  { label: 'Emergency Alerts', icon: FaBell },
  { label: 'Documents', icon: FaClipboardList },
  { label: 'Audit Logs', to: '/admin/audit-logs', icon: FaHistory, available: true }
];

const AdminSidebar = ({ open, collapsed, onClose }) => (
  <>
    {open && <button className="admin-sidebar-backdrop" aria-label="Close navigation" onClick={onClose} />}
    <aside className={`admin-sidebar ${open ? 'is-open' : ''} ${collapsed ? 'is-collapsed' : ''}`}>
      <div className="admin-sidebar-brand">
        <span className="admin-sidebar-logo" aria-hidden="true">EC</span>
        {!collapsed && <span>ElderlyCare<br /><small>Administration</small></span>}
        <button className="admin-sidebar-close" onClick={onClose} aria-label="Close navigation">
          <FaTimes />
        </button>
      </div>

      <nav aria-label="Admin navigation">
        {items.map(({ label, to, icon: Icon, available }) => (
          available ? (
            <NavLink
              key={label}
              to={to}
              onClick={onClose}
              className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}
              title={collapsed ? label : undefined}
            >
              <Icon aria-hidden="true" />
              {!collapsed && <span>{label}</span>}
            </NavLink>
          ) : (
            <div
              key={label}
              className="admin-nav-item is-disabled"
              aria-disabled="true"
              title={`${label} will be available in a later phase`}
            >
              <Icon aria-hidden="true" />
              {!collapsed && <><span>{label}</span><small>Soon</small></>}
            </div>
          )
        ))}
      </nav>
    </aside>
  </>
);

export default AdminSidebar;
