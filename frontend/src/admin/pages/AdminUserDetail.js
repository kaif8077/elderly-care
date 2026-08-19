import React, { useCallback, useEffect, useState } from 'react';
import { FaArrowLeft, FaIdCard, FaQrcode, FaUser } from 'react-icons/fa';
import { Link, useParams } from 'react-router-dom';
import { Button, Space } from 'antd';
import adminApi from '../../services/adminApi';
import AdminStatusBadge from '../components/AdminStatusBadge';

const tabs = ['Overview', 'Personal', 'Contact', 'Medical', 'Insurance', 'QR'];
const archiveReasons = ['Duplicate account', 'User request', 'Test account', 'Incorrect data', 'Inactive account', 'Privacy request', 'Other'];
const value = (item) => item === null || item === undefined || item === '' ? 'Not provided' : String(item);
const listValue = (items, other) => {
  const values = [...(items || []), other].filter((item) => item && item !== 'None');
  return values.length ? values.join(', ') : 'None reported';
};
const dateValue = (date, includeTime = false) => date
  ? new Date(date).toLocaleString(undefined, includeTime ? undefined : { year: 'numeric', month: 'short', day: 'numeric' })
  : 'Not available';

const Field = ({ label, children }) => (
  <div className="admin-detail-field"><dt>{label}</dt><dd>{children}</dd></div>
);

const AdminUserDetail = () => {
  const { userId } = useParams();
  const [activeTab, setActiveTab] = useState('Overview');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusSaving, setStatusSaving] = useState(false);
  const [actionMessage, setActionMessage] = useState('');
  const [archiveOpen, setArchiveOpen] = useState(false);
  const [archiveForm, setArchiveForm] = useState({ reason: '', details: '', confirmation: '' });

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await adminApi.get(`/users/${userId}`);
      setData(response.data);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to load this user.');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    if (!archiveOpen) return undefined;
    const closeOnEscape = (event) => {
      if (event.key === 'Escape' && !statusSaving) setArchiveOpen(false);
    };
    document.addEventListener('keydown', closeOnEscape);
    return () => document.removeEventListener('keydown', closeOnEscape);
  }, [archiveOpen, statusSaving]);

  if (loading) return <div className="admin-detail-skeleton skeleton" aria-label="Loading user details" />;
  if (error) return (
    <div className="admin-state-card" role="alert">
      <h2>User unavailable</h2><p>{error}</p>
      <Link to="/admin/users"><Button>Back to users</Button></Link>
    </div>
  );

  const { user, profile, qr } = data;
  const personal = profile?.personal;
  const contact = profile?.contact;
  const emergency = profile?.emergencyContact;
  const medical = profile?.medical;
  const insurance = profile?.insurance;

  const archiveAccount = async (event) => {
    event.preventDefault();
    const reason = archiveForm.reason === 'Other'
      ? archiveForm.details.trim()
      : [archiveForm.reason, archiveForm.details.trim()].filter(Boolean).join(': ');
    setStatusSaving(true);
    setActionMessage('');
    try {
      await adminApi.delete(`/users/${userId}`, { data: { reason, confirmation: archiveForm.confirmation } });
      setArchiveOpen(false);
      setArchiveForm({ reason: '', details: '', confirmation: '' });
      setActionMessage('Account archived. Sessions and QR access were revoked.');
      await load();
    } catch (requestError) {
      setActionMessage(requestError.response?.data?.message || 'Unable to archive this account.');
    } finally {
      setStatusSaving(false);
    }
  };

  const restoreAccount = async () => {
    if (!window.confirm('Restore this archived account? QR access will remain revoked until a new code is generated.')) return;
    setStatusSaving(true);
    try {
      await adminApi.post(`/users/${userId}/restore`);
      setActionMessage('Account restored. Generate a new QR code if required.');
      await load();
    } catch (requestError) {
      setActionMessage(requestError.response?.data?.message || 'Unable to restore this account.');
    } finally {
      setStatusSaving(false);
    }
  };

  const overview = (
    <div className="admin-detail-grid">
      <section className="admin-detail-card">
        <h2>Account overview</h2>
        <dl>
          <Field label="Account email">{value(user.email)}</Field>
          <Field label="ElderlyCare ID">{value(user.elderlyCareId)}</Field>
          <Field label="Role">{value(user.role)}</Field>
          <Field label="Email verification">{user.isVerified ? 'Verified' : 'Not verified'}</Field>
          <Field label="Registered">{dateValue(user.createdAt)}</Field>
          <Field label="Last updated">{dateValue(user.updatedAt, true)}</Field>
          <Field label="Last login">{dateValue(user.lastLoginAt, true)}</Field>
          {user.isDeleted && <Field label="Archived">{dateValue(user.deletedAt, true)}</Field>}
          {user.isDeleted && <Field label="Archive reason">{value(user.deletionReason)}</Field>}
        </dl>
      </section>
      <section className="admin-detail-card">
        <h2>Record readiness</h2>
        <dl>
          <Field label="Medical profile"><AdminStatusBadge status={user.profileStatus} /></Field>
          <Field label="Completion">{user.profileCompletion}%</Field>
          <Field label="QR record"><AdminStatusBadge status={qr.status} /></Field>
        </dl>
        <div className="admin-detail-actions">
          <Link to={`/admin/id-cards/${userId}`}><Button type="primary" icon={<FaIdCard />}>View ID card</Button></Link>
          {user.isDeleted && <Button type="primary" loading={statusSaving} onClick={restoreAccount}>Restore account</Button>}
          {!user.isDeleted && <Button danger disabled={statusSaving} onClick={() => setArchiveOpen(true)}>Archive user</Button>}
        </div>
        {actionMessage && <p className="admin-action-message" role="status">{actionMessage}</p>}
      </section>
    </div>
  );

  const sections = {
    Overview: overview,
    Personal: profile ? <section className="admin-detail-card"><h2>Personal information</h2><dl className="admin-detail-columns">
      <Field label="Full name">{value(personal.name)}</Field><Field label="Date of birth">{dateValue(personal.dob)}</Field>
      <Field label="Gender">{value(personal.gender)}</Field><Field label="Blood group">{value(personal.bloodGroup)}</Field>
      <Field label="Height">{personal.height ? `${personal.height} cm` : 'Not provided'}</Field>
      <Field label="Weight">{personal.weight ? `${personal.weight} kg` : 'Not provided'}</Field>
      <Field label="Diet preference">{value(personal.dietPreference)}</Field>
      <Field label="Preferred language">{listValue(personal.preferredLanguage, personal.otherLanguage)}</Field>
      <Field label="Mobility">{value(personal.mobilityStatus)}</Field>
      <Field label="Marital status">{value(personal.maritalStatus)}</Field>
    </dl></section> : null,
    Contact: profile ? <div className="admin-detail-grid">
      <section className="admin-detail-card"><h2>Contact information</h2><dl>
        <Field label="Phone">{value(contact.phone)}</Field><Field label="Address">{value(contact.address)}</Field>
      </dl></section>
      <section className="admin-detail-card"><h2>Emergency contact</h2><dl>
        <Field label="Name">{value(emergency.name)}</Field><Field label="Phone">{value(emergency.phone)}</Field>
        <Field label="Relationship">{value(emergency.relationship)}</Field>
      </dl></section>
    </div> : null,
    Medical: profile ? <section className="admin-detail-card admin-sensitive-card"><div className="admin-section-warning">Sensitive medical information — access is audit logged.</div><h2>Medical information</h2><dl>
      <Field label="Medical history">{listValue(medical.medicalHistory, medical.medicalHistoryOther)}</Field>
      <Field label="Allergies">{listValue(medical.allergies, medical.allergiesOther)}</Field>
      <Field label="Medications">{listValue(medical.medications, medical.medicationsOther)}</Field>
      <Field label="Current symptoms">{listValue(medical.currentSymptoms, medical.currentSymptomsOther)}</Field>
    </dl></section> : null,
    Insurance: profile ? <section className="admin-detail-card admin-sensitive-card"><div className="admin-section-warning">Private insurance information</div><h2>Insurance</h2><dl>
      <Field label="Insurance status">{insurance.hasInsurance ? 'Active' : 'Not active'}</Field>
      <Field label="Provider">{value(insurance.provider || insurance.providerOther)}</Field>
      <Field label="Policy number">{value(insurance.policyNumber)}</Field>
    </dl></section> : null,
    QR: <section className="admin-detail-card"><h2>QR information</h2><dl>
      <Field label="Status"><AdminStatusBadge status={qr.status} /></Field>
      <Field label="Legacy QR records">{qr.totalRecords}</Field>
      <Field label="Revoked QR records">{qr.revokedRecords || 0}</Field>
      <Field label="Latest generated">{dateValue(qr.generatedAt, true)}</Field>
      <Field label="Revocation support">{qr.revocationSupported ? 'Available' : 'Not available in legacy model'}</Field>
    </dl><p className="admin-privacy-note"><FaQrcode aria-hidden="true" /> QR payload data is intentionally not displayed in the admin directory.</p></section>
  };

  return (
    <div className="admin-user-detail-page">
      <Link className="admin-back-link" to="/admin/users"><FaArrowLeft /> Back to users</Link>
      <header className="admin-detail-hero">
        <span className="admin-detail-avatar"><FaUser aria-hidden="true" /></span>
        <div><p className="admin-eyebrow">User record</p><h1>{user.name}</h1><p>{user.email}</p></div>
        <div className="admin-detail-statuses"><AdminStatusBadge status={user.profileStatus} /></div>
      </header>

      <Space wrap role="tablist" aria-label="User record sections" style={{ margin: '18px 0' }}>
        {tabs.map((tab) => <Button key={tab} id={`admin-tab-${tab}`} role="tab" aria-controls="admin-user-tabpanel" aria-selected={activeTab === tab} tabIndex={activeTab === tab ? 0 : -1} type={activeTab === tab ? 'primary' : 'default'} onClick={() => setActiveTab(tab)}>{tab}</Button>)}
      </Space>

      <div id="admin-user-tabpanel" role="tabpanel" aria-labelledby={`admin-tab-${activeTab}`}>
        {!profile && !['Overview', 'QR'].includes(activeTab)
          ? <div className="admin-state-card"><h2>No medical profile</h2><p>This user has not submitted medical information.</p></div>
          : sections[activeTab]}
      </div>

      {archiveOpen && (
        <div className="admin-modal-backdrop" role="presentation">
          <section className="admin-confirm-modal" role="dialog" aria-modal="true" aria-labelledby="archive-title">
            <h2 id="archive-title">Archive {user.name}?</h2>
            <p>This blocks login, revokes active sessions and QR codes, and hides the account from active-user lists. Medical records are preserved.</p>
            <form onSubmit={archiveAccount}>
              <label>Reason
                <select required value={archiveForm.reason} onChange={(event) => setArchiveForm((current) => ({ ...current, reason: event.target.value }))}>
                  <option value="">Select a reason</option>
                  {archiveReasons.map((reason) => <option key={reason}>{reason}</option>)}
                </select>
              </label>
              <label>{archiveForm.reason === 'Other' ? 'Reason details' : 'Additional details (optional)'}
                <textarea required={archiveForm.reason === 'Other'} maxLength="500" value={archiveForm.details} onChange={(event) => setArchiveForm((current) => ({ ...current, details: event.target.value }))} />
              </label>
              <label>Type DELETE to confirm
                <input autoFocus value={archiveForm.confirmation} onChange={(event) => setArchiveForm((current) => ({ ...current, confirmation: event.target.value }))} />
              </label>
              <div className="admin-modal-actions">
                <Button onClick={() => setArchiveOpen(false)} disabled={statusSaving}>Cancel</Button>
                <Button htmlType="submit" danger loading={statusSaving} disabled={!archiveForm.reason || archiveForm.confirmation !== 'DELETE'}>Archive user</Button>
              </div>
            </form>
          </section>
        </div>
      )}
    </div>
  );
};

export default AdminUserDetail;
