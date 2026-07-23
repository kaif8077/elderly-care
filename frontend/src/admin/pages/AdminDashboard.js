import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaAddressCard, FaCheckCircle, FaClock, FaQrcode, FaUserCheck, FaUserPlus, FaUsers
} from 'react-icons/fa';
import adminApi from '../../services/adminApi';

const cards = (data) => [
  { label: 'Registered users', value: data.users.total, icon: FaUsers, to: '/admin/users' },
  { label: 'Active users', value: data.users.active, icon: FaUserCheck, to: '/admin/users?accountStatus=active' },
  { label: 'Inactive users', value: data.users.inactive, icon: FaClock, to: '/admin/users?accountStatus=inactive' },
  { label: 'Registered today', value: data.users.registeredToday, icon: FaUserPlus, to: '/admin/users?sortBy=createdAt' },
  { label: 'Complete profiles', value: data.profiles.complete, icon: FaCheckCircle, to: '/admin/users?profileStatus=complete' },
  { label: 'Incomplete profiles', value: data.profiles.incomplete, icon: FaAddressCard, to: '/admin/users?profileStatus=incomplete' },
  { label: 'Generated QR records', value: data.qrCodes.generated, icon: FaQrcode, to: '/admin/users?qrStatus=generated' },
  { label: 'Active secure QR', value: data.qrCodes.active, icon: FaQrcode, to: '/admin/users?qrStatus=active' }
];

const DashboardSkeleton = () => (
  <div className="admin-stat-grid" aria-label="Loading dashboard statistics">
    {Array.from({ length: 8 }, (_, index) => <div className="admin-stat-card skeleton" key={index} />)}
  </div>
);

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await adminApi.get('/dashboard');
      setData(response.data);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to load dashboard statistics.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading) return <DashboardSkeleton />;
  if (error) return (
    <div className="admin-state-card" role="alert">
      <h2>Dashboard unavailable</h2><p>{error}</p>
      <button className="admin-primary-button admin-inline-button" onClick={load}>Try again</button>
    </div>
  );

  const maxRegistration = Math.max(...data.registrationsByMonth.map((item) => item.count), 1);

  return (
    <div className="admin-dashboard-page">
      {data && (
        <>
          <div className="admin-page-actions">
            <div>
              <p>Operational overview without exposing complete medical information.</p>
              <small>Last refreshed: {new Date(data.refreshedAt).toLocaleString()}</small>
            </div>
            <button className="admin-secondary-button" onClick={load}>Refresh</button>
          </div>

          <section className="admin-stat-grid" aria-label="Dashboard statistics">
            {cards(data).map(({ label, value, icon: Icon, to }) => (
              <button className="admin-stat-card" key={label} onClick={() => navigate(to)}>
                <span className="admin-stat-icon"><Icon aria-hidden="true" /></span>
                <span><small>{label}</small><strong>{value}</strong></span>
              </button>
            ))}
          </section>

          <div className="admin-dashboard-columns">
            <section className="admin-panel" aria-labelledby="registration-chart-title">
              <div className="admin-panel-heading">
                <div><p className="admin-eyebrow">Registration activity</p><h2 id="registration-chart-title">Last six months</h2></div>
                <span>{data.users.registeredThisMonth} this month</span>
              </div>
              <div className="admin-bar-chart">
                {data.registrationsByMonth.map((item) => (
                  <div className="admin-bar-column" key={item.key}>
                    <span className="admin-bar-value">{item.count}</span>
                    <div className="admin-bar-track">
                      <div className="admin-bar-fill" style={{ height: `${(item.count / maxRegistration) * 100}%` }} />
                    </div>
                    <small>{item.label}</small>
                  </div>
                ))}
              </div>
            </section>

            <section className="admin-panel" aria-labelledby="capabilities-title">
              <div className="admin-panel-heading"><div><p className="admin-eyebrow">System readiness</p><h2 id="capabilities-title">Upcoming capabilities</h2></div></div>
              <ul className="admin-capability-list">
                <li><span>Medical reports</span><strong>Not implemented</strong></li>
                <li><span>Emergency alert tracking</span><strong>Not implemented</strong></li>
                <li><span>Versioned ID cards</span><strong>Not implemented</strong></li>
                <li><span>QR revocation</span><strong>Available for secure tokens</strong></li>
                {data.qrCodes.legacy > 0 && <li><span>Legacy QR migrations</span><strong>{data.qrCodes.legacy} remaining</strong></li>}
              </ul>
            </section>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminDashboard;
