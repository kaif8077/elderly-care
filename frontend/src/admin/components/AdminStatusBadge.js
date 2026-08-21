import React from 'react';

const AdminStatusBadge = ({ status }) => {
  const normalized = String(status || 'unknown')
    .toLowerCase()
    .replace(/\s+/g, '-');
  const label = String(status || 'Unknown').replace(/_/g, ' ');
  return <span className={`admin-status-badge status-${normalized}`}>{label}</span>;
};

export default AdminStatusBadge;
