import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { FaChevronLeft, FaChevronRight, FaSearch, FaSyncAlt } from 'react-icons/fa';
import { useSearchParams } from 'react-router-dom';
import adminApi from '../../services/adminApi';
import AdminStatusBadge from '../components/AdminStatusBadge';

const AdminAuditLogs = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [data, setData] = useState({ logs: [], pagination: { page: 1, pages: 1, total: 0, limit: 20 } });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const query = useMemo(() => Object.fromEntries(searchParams.entries()), [searchParams]);

  const updateQuery = (updates) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, item]) => item ? next.set(key, item) : next.delete(key));
    if (!Object.prototype.hasOwnProperty.call(updates, 'page')) next.set('page', '1');
    setSearchParams(next);
  };

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await adminApi.get('/audit-logs', { params: query });
      setData(response.data);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to load audit logs.');
    } finally {
      setLoading(false);
    }
  }, [query]);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="admin-audit-page">
      <div className="admin-page-actions">
        <div><p>Security and administrative activity. Medical records, passwords, and tokens are not stored here.</p><small>{data.pagination.total} matching events</small></div>
        <button className="admin-secondary-button" onClick={load} disabled={loading}><FaSyncAlt /> Refresh</button>
      </div>
      <section className="admin-filter-panel admin-audit-filters" aria-label="Audit filters">
        <form className="admin-user-search" onSubmit={(event) => { event.preventDefault(); updateQuery({ search: search.trim() }); }}>
          <FaSearch aria-hidden="true" /><label className="admin-visually-hidden" htmlFor="audit-search">Search audit logs</label>
          <input id="audit-search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Action, resource, or reason" />
          <button>Search</button>
        </form>
        <label>Result
          <select value={query.success || ''} onChange={(event) => updateQuery({ success: event.target.value })}>
            <option value="">All results</option><option value="true">Succeeded</option><option value="false">Failed</option>
          </select>
        </label>
        <label>Rows
          <select value={query.limit || '20'} onChange={(event) => updateQuery({ limit: event.target.value })}>
            <option value="10">10</option><option value="20">20</option><option value="50">50</option><option value="100">100</option>
          </select>
        </label>
      </section>
      <section className="admin-table-panel" aria-busy={loading}>
        {loading ? <div className="admin-table-loading">Loading audit events…</div>
          : error ? <div className="admin-state-card" role="alert"><h2>Audit logs unavailable</h2><p>{error}</p></div>
            : !data.logs.length ? <div className="admin-state-card"><h2>No audit events found</h2><p>Try changing the current filters.</p></div>
              : <div className="admin-table-scroll"><table className="admin-data-table admin-audit-table">
                <caption className="admin-visually-hidden">Administrative audit events</caption>
                <thead><tr><th>Date</th><th>Admin</th><th>Action</th><th>Resource</th><th>Affected user</th><th>Result</th><th>Reason / description</th></tr></thead>
                <tbody>{data.logs.map((log) => <tr key={log.id}>
                  <td>{new Date(log.createdAt).toLocaleString()}</td>
                  <td>{log.actor?.name || 'System'}<small>{log.actor?.email || log.actorRole || 'Unknown'}</small></td>
                  <td><strong>{log.action.replaceAll('_', ' ')}</strong></td>
                  <td>{log.resourceType}<small>{log.resourceId || '—'}</small></td>
                  <td>{log.affectedUser?.name || '—'}<small>{log.affectedUser?.email || ''}</small></td>
                  <td><AdminStatusBadge status={log.success ? 'success' : 'failed'} /></td>
                  <td>{log.reason || log.description}<small>{log.ipReference ? `IP ref: ${log.ipReference}` : ''}</small></td>
                </tr>)}</tbody>
              </table></div>}
        <div className="admin-pagination">
          <span>Page {data.pagination.page} of {data.pagination.pages}</span>
          <div>
            <button aria-label="Previous page" disabled={loading || data.pagination.page <= 1} onClick={() => updateQuery({ page: String(data.pagination.page - 1) })}><FaChevronLeft /></button>
            <button aria-label="Next page" disabled={loading || data.pagination.page >= data.pagination.pages} onClick={() => updateQuery({ page: String(data.pagination.page + 1) })}><FaChevronRight /></button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AdminAuditLogs;
