import React, { useCallback, useEffect, useState } from 'react';
import { FaChevronLeft, FaChevronRight, FaDownload, FaFileMedical, FaPrint, FaSyncAlt, FaTimes } from 'react-icons/fa';
import { Button, Flex } from 'antd';
import adminApi from '../../services/adminApi';
import AdminStatusBadge from '../components/AdminStatusBadge';
import '../styles/AdminReports.css';

const joinValues = (items, other) => [...(items || []), other].filter(Boolean).join(', ') || 'None reported';

const AdminReports = () => {
  const [data, setData] = useState({ reports: [], pagination: { page: 1, pages: 1, total: 0 } });
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const response = await adminApi.get('/reports', { params: { page, limit: 20, verificationStatus: status || undefined } });
      setData(response.data);
    } catch (error) {
      setMessage(error.response?.data?.message || 'Unable to load medical reports.');
    } finally {
      setLoading(false);
    }
  }, [page, status]);

  useEffect(() => { load(); }, [load]);

  const openReport = async (reportId) => {
    setMessage('');
    try {
      const response = await adminApi.get(`/reports/${reportId}`);
      setSelected(response.data.report);
    } catch (error) {
      setMessage(error.response?.data?.message || 'Unable to open this report.');
    }
  };

  const verify = async (verificationStatus) => {
    try {
      await adminApi.patch(`/reports/${selected._id}/verification`, { verificationStatus });
      setSelected((current) => ({ ...current, verificationStatus }));
      setMessage(`Report marked ${verificationStatus.replace('_', ' ')}.`);
      await load();
    } catch (error) {
      setMessage(error.response?.data?.message || 'Unable to update verification.');
    }
  };

  const downloadPdf = async () => {
    try {
      const response = await adminApi.get(`/reports/${selected._id}/download`, { responseType: 'blob' });
      const url = URL.createObjectURL(response.data);
      const link = document.createElement('a');
      link.href = url;
      link.download = `elderlycare-report-v${selected.reportVersion}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
      setMessage('Authenticated PDF downloaded.');
    } catch (error) {
      setMessage('Unable to download the report PDF.');
    }
  };
  return (
    <div className="admin-reports-page">
      <div className="admin-page-actions">
        <div><p>Immutable emergency-summary snapshots and version history.</p><small>{data.pagination.total} saved reports</small></div>
        <Button icon={<FaSyncAlt />} onClick={load} loading={loading}>Refresh</Button>
      </div>
      <section className="admin-filter-panel admin-report-filters">
        <label>Verification
          <select value={status} onChange={(event) => { setStatus(event.target.value); setPage(1); }}>
            <option value="">All statuses</option><option value="unverified">Unverified</option>
            <option value="verified">Verified</option><option value="needs_correction">Needs correction</option>
          </select>
        </label>
      </section>
      <section className="admin-table-panel">
        {loading ? <div className="admin-table-loading">Loading saved reports…</div>
          : !data.reports.length ? <div className="admin-state-card"><FaFileMedical /><h2>No reports found</h2><p>Users can generate their first snapshot through the medical-report API.</p></div>
            : <div className="admin-table-scroll"><table className="admin-data-table admin-report-table">
              <thead><tr><th scope="col">Version</th><th scope="col">User ID</th><th scope="col">Generated</th><th scope="col">Status</th><th scope="col">Verification</th><th scope="col">Action</th></tr></thead>
              <tbody>{data.reports.map((report) => <tr key={report._id}>
                <td><strong>v{report.reportVersion}</strong>{report.isLatest && <small>Latest</small>}</td>
                <td>{report.userId}</td><td>{new Date(report.generatedAt).toLocaleString()}</td>
                <td><AdminStatusBadge status={report.reportStatus} /></td>
                <td><AdminStatusBadge status={report.verificationStatus} /></td>
                <td><Button onClick={() => openReport(report._id)}>Preview</Button></td>
              </tr>)}</tbody>
            </table></div>}
        <Flex justify="flex-end" align="center" gap="middle" style={{ padding: '14px 16px', borderTop: '1px solid #e2ebe8' }}><span>Page {data.pagination.page} of {data.pagination.pages}</span><div>
          <Button aria-label="Previous page" icon={<FaChevronLeft />} disabled={page <= 1} onClick={() => setPage((current) => current - 1)} />
          <Button aria-label="Next page" icon={<FaChevronRight />} disabled={page >= data.pagination.pages} onClick={() => setPage((current) => current + 1)} />
        </div></Flex>
      </section>
      {message && <p className="admin-action-message" role="status">{message}</p>}

      {selected && <div className="admin-modal-backdrop"><section className="admin-report-preview" role="dialog" aria-modal="true" aria-labelledby="report-preview-title">
        <Button className="admin-report-close" type="text" shape="circle" aria-label="Close report preview" icon={<FaTimes />} onClick={() => setSelected(null)} />
        <header><p>Emergency Medical Summary</p><h2 id="report-preview-title">{selected.snapshotData.personal.name}</h2>
          <span>Version {selected.reportVersion} · {new Date(selected.generatedAt).toLocaleString()}</span></header>
        <div className="admin-report-critical"><strong>Blood group: {selected.snapshotData.personal.bloodGroup || 'Unknown'}</strong>
          <p>Allergies: {joinValues(selected.snapshotData.medical.allergies, selected.snapshotData.medical.allergiesOther)}</p></div>
        <div className="admin-report-sections">
          <section><h3>Medical conditions</h3><p>{joinValues(selected.snapshotData.medical.medicalHistory, selected.snapshotData.medical.medicalHistoryOther)}</p></section>
          <section><h3>Current medications</h3><p>{joinValues(selected.snapshotData.medical.medications, selected.snapshotData.medical.medicationsOther)}</p></section>
          <section><h3>Emergency contact</h3><p>{selected.snapshotData.emergencyContacts[0]?.name} · {selected.snapshotData.emergencyContacts[0]?.phone}</p></section>
        </div>
        <footer><span>This summary is not a replacement for professional medical advice.</span><div>
          <Button icon={<FaPrint />} onClick={() => window.print()}>Print</Button><Button icon={<FaDownload />} onClick={downloadPdf}>Download PDF</Button><Button onClick={() => verify('needs_correction')}>Needs correction</Button>
          <Button type="primary" onClick={() => verify('verified')}>Mark verified</Button>
        </div></footer>
      </section></div>}
    </div>
  );
};

export default AdminReports;
