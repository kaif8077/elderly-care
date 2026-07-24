import React, { useCallback, useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import './MedicalReports.css';

const apiBase = process.env.REACT_APP_BACKEND_URI || 'http://localhost:5000';
const listText = (items, other) => [...(items || []), other].filter(Boolean).join(', ') || 'None reported';

const MedicalReports = () => {
  const { user } = useContext(AuthContext);
  const [reports, setReports] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState(false);
  const [message, setMessage] = useState('');
  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  const load = useCallback(async () => {
    if (!user || !token) return;
    setLoading(true);
    try {
      const response = await axios.get(`${apiBase}/api/medical-reports`, { headers });
      setReports(response.data.reports);
    } catch (error) {
      setMessage(error.response?.data?.message || 'Unable to load reports.');
    } finally {
      setLoading(false);
    }
  // The token is read from the active browser session and changes with login.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, token]);

  useEffect(() => { load(); }, [load]);

  const generate = async () => {
    setWorking(true);
    setMessage('');
    try {
      const response = await axios.post(`${apiBase}/api/medical-reports`, {}, { headers });
      setMessage(`Emergency summary version ${response.data.report.reportVersion} generated.`);
      await load();
    } catch (error) {
      setMessage(error.response?.data?.message || 'Unable to generate a report.');
    } finally {
      setWorking(false);
    }
  };

  const preview = async (reportId) => {
    try {
      const response = await axios.get(`${apiBase}/api/medical-reports/${reportId}`, { headers });
      setSelected(response.data.report);
    } catch (error) {
      setMessage('Unable to preview this report.');
    }
  };

  const download = async (report) => {
    setWorking(true);
    try {
      const response = await axios.get(`${apiBase}/api/medical-reports/${report._id}/download`, {
        headers,
        responseType: 'blob'
      });
      const url = URL.createObjectURL(response.data);
      const link = document.createElement('a');
      link.href = url;
      link.download = `emergency-medical-summary-v${report.reportVersion}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      setMessage('Unable to download the PDF.');
    } finally {
      setWorking(false);
    }
  };

  if (!user) return <main className="medical-reports-page"><div className="report-state"><h1>Sign in required</h1><p>Please sign in to access private medical reports.</p></div></main>;

  return (
    <main className="medical-reports-page">
      <header className="medical-reports-header">
        <div><p>ElderlyCare</p><h1>Emergency Medical Summaries</h1><span>Versioned, private snapshots of your submitted medical profile.</span></div>
        <button onClick={generate} disabled={working}>{working ? 'Working…' : 'Generate new report'}</button>
      </header>
      {message && <p className="medical-report-message" role="status">{message}</p>}
      {loading ? <div className="report-state">Loading reports…</div>
        : !reports.length ? <div className="report-state"><h2>No saved reports</h2><p>Generate your first emergency summary after completing the medical form.</p></div>
          : <section className="medical-report-list" aria-label="Saved report versions">
            {reports.map((report) => <article key={report._id}>
              <div><strong>Version {report.reportVersion}</strong>{report.isLatest && <span className="report-latest">Latest</span>}
                <p>Generated {new Date(report.generatedAt).toLocaleString()}</p></div>
              <span>{report.verificationStatus.replace('_', ' ')}</span>
              <div><button onClick={() => preview(report._id)}>Preview</button><button onClick={() => download(report)} disabled={working}>Download PDF</button></div>
            </article>)}
          </section>}

      {selected && <div className="medical-report-modal"><article role="dialog" aria-modal="true" aria-labelledby="user-report-title">
        <button className="medical-report-close" onClick={() => setSelected(null)} aria-label="Close preview">×</button>
        <header><p>Emergency Medical Summary</p><h2 id="user-report-title">{selected.snapshotData.personal.name}</h2><span>Version {selected.reportVersion}</span></header>
        <section className="medical-report-critical"><strong>Blood group: {selected.snapshotData.personal.bloodGroup || 'Unknown'}</strong><p>Allergies: {listText(selected.snapshotData.medical.allergies, selected.snapshotData.medical.allergiesOther)}</p></section>
        <section><h3>Medical conditions</h3><p>{listText(selected.snapshotData.medical.medicalHistory, selected.snapshotData.medical.medicalHistoryOther)}</p></section>
        <section><h3>Current medications</h3><p>{listText(selected.snapshotData.medical.medications, selected.snapshotData.medical.medicationsOther)}</p></section>
        <section><h3>Emergency contact</h3><p>{selected.snapshotData.emergencyContacts[0]?.name} · {selected.snapshotData.emergencyContacts[0]?.phone}</p></section>
        <footer><p>This emergency summary is not a replacement for professional medical advice.</p><button onClick={() => download(selected)}>Download authenticated PDF</button></footer>
      </article></div>}
    </main>
  );
};

export default MedicalReports;
