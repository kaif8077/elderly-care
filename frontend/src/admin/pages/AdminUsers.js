import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { FaChevronLeft, FaChevronRight, FaSearch, FaSyncAlt } from 'react-icons/fa';
import { Link, useSearchParams } from 'react-router-dom';
import adminApi from '../../services/adminApi';
import AdminStatusBadge from '../components/AdminStatusBadge';

const bloodGroups = ['', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const ageFromDob = (dob) => {
  if (!dob) return '—';
  const birth = new Date(dob);
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  if (now < new Date(now.getFullYear(), birth.getMonth(), birth.getDate())) age -= 1;
  return age >= 0 ? age : '—';
};

const AdminUsers = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchInput, setSearchInput] = useState(searchParams.get('search') || '');
  const [data, setData] = useState({ users: [], pagination: { page: 1, pages: 1, total: 0, limit: 10 } });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const query = useMemo(() => Object.fromEntries(searchParams.entries()), [searchParams]);

  const updateQuery = (updates) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, value]) => {
      if (value) next.set(key, value);
      else next.delete(key);
    });
    if (!Object.prototype.hasOwnProperty.call(updates, 'page')) next.set('page', '1');
    setSearchParams(next);
  };

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await adminApi.get('/users', { params: query });
      setData(response.data);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to load users.');
    } finally {
      setLoading(false);
    }
  }, [query]);

  useEffect(() => { load(); }, [load]);

  const submitSearch = (event) => {
    event.preventDefault();
    updateQuery({ search: searchInput.trim() });
  };

  return (
    <div className="admin-users-page">
      <div className="admin-page-actions">
        <div>
          <p>Search and review account readiness without displaying complete medical records.</p>
          <small>{data.pagination.total} matching users</small>
        </div>
        <button className="admin-secondary-button" onClick={load} disabled={loading}>
          <FaSyncAlt aria-hidden="true" /> Refresh
        </button>
      </div>

      <section className="admin-filter-panel" aria-label="User filters">
        <form className="admin-user-search" role="search" onSubmit={submitSearch}>
          <FaSearch aria-hidden="true" />
          <label className="admin-visually-hidden" htmlFor="admin-user-search">Search users</label>
          <input
            id="admin-user-search"
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder="Name, email, or phone"
          />
          <button type="submit">Search</button>
        </form>
        <label>Account
          <select value={query.accountStatus || ''} onChange={(e) => updateQuery({ accountStatus: e.target.value })}>
            <option value="">All statuses</option><option value="active">Active</option>
            <option value="inactive">Inactive</option><option value="suspended">Suspended</option>
            <option value="archived">Archived</option>
          </select>
        </label>
        <label>Profile
          <select value={query.profileStatus || ''} onChange={(e) => updateQuery({ profileStatus: e.target.value })}>
            <option value="">All profiles</option><option value="complete">Complete</option><option value="incomplete">Incomplete</option>
          </select>
        </label>
        <label>Blood group
          <select value={query.bloodGroup || ''} onChange={(e) => updateQuery({ bloodGroup: e.target.value })}>
            {bloodGroups.map((group) => <option key={group || 'all'} value={group}>{group || 'All groups'}</option>)}
          </select>
        </label>
        <label>QR
          <select value={query.qrStatus || ''} onChange={(e) => updateQuery({ qrStatus: e.target.value })}>
            <option value="">All QR states</option><option value="active">Active</option><option value="revoked">Revoked</option>
            <option value="generated">Any generated</option><option value="missing">Missing</option>
          </select>
        </label>
        <label>Sort
          <select value={query.sortBy || 'createdAt'} onChange={(e) => updateQuery({ sortBy: e.target.value })}>
            <option value="createdAt">Registration date</option><option value="name">Name</option><option value="updatedAt">Last updated</option>
          </select>
        </label>
      </section>

      <section className="admin-table-panel" aria-busy={loading}>
        {loading ? (
          <div className="admin-table-loading" aria-live="polite">Loading users…</div>
        ) : error ? (
          <div className="admin-state-card" role="alert"><h2>Users unavailable</h2><p>{error}</p><button onClick={load}>Try again</button></div>
        ) : data.users.length === 0 ? (
          <div className="admin-state-card"><h2>No users found</h2><p>Change or clear the current filters.</p></div>
        ) : (
          <div className="admin-table-scroll">
            <table className="admin-data-table">
              <caption className="admin-visually-hidden">ElderlyCare user directory</caption>
              <thead><tr>
                <th scope="col">User</th><th scope="col">Contact</th><th scope="col">Age / Gender</th>
                <th scope="col">Blood</th><th scope="col">Profile</th><th scope="col">QR</th>
                <th scope="col">Account</th><th scope="col">Registered</th><th scope="col">Actions</th>
              </tr></thead>
              <tbody>
                {data.users.map((user) => (
                  <tr key={user.id}>
                    <td><div className="admin-user-cell"><span className="admin-avatar">{user.name?.charAt(0) || 'U'}</span><span><strong>{user.name}</strong><small>{user.elderlyCareId || 'ID pending'}</small></span></div></td>
                    <td><strong>{user.email}</strong><small>{user.phone || 'No phone'}</small></td>
                    <td>{ageFromDob(user.dob)}<small>{user.gender || 'Not provided'}</small></td>
                    <td>{user.bloodGroup || '—'}</td>
                    <td><AdminStatusBadge status={`${user.profileCompletion}% complete`} /></td>
                    <td><AdminStatusBadge status={user.qrStatus} /></td>
                    <td><AdminStatusBadge status={user.accountStatus} /></td>
                    <td>{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—'}</td>
                    <td><Link className="admin-table-action" to={`/admin/users/${user.id}`}>View</Link></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="admin-pagination">
          <label>Rows
            <select value={query.limit || '10'} onChange={(e) => updateQuery({ limit: e.target.value, page: '1' })}>
              <option value="5">5</option><option value="10">10</option><option value="20">20</option><option value="50">50</option>
            </select>
          </label>
          <span>Page {data.pagination.page} of {data.pagination.pages}</span>
          <div>
            <button aria-label="Previous page" disabled={data.pagination.page <= 1 || loading} onClick={() => updateQuery({ page: String(data.pagination.page - 1) })}><FaChevronLeft /></button>
            <button aria-label="Next page" disabled={data.pagination.page >= data.pagination.pages || loading} onClick={() => updateQuery({ page: String(data.pagination.page + 1) })}><FaChevronRight /></button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AdminUsers;
