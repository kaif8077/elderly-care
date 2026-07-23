import React, { useCallback, useEffect, useState } from 'react';
import { FaArrowLeft, FaFileMedical, FaQrcode, FaUser } from 'react-icons/fa';
import { Link, useParams } from 'react-router-dom';
import adminApi from '../../services/adminApi';
import AdminStatusBadge from '../components/AdminStatusBadge';

const tabs = ['Overview', 'Personal', 'Contact', 'Medical', 'Insurance', 'Reports', 'QR'];
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

  if (loading) return <div className="admin-detail-skeleton skeleton" aria-label="Loading user details" />;
  if (error) return (
    <div className="admin-state-card" role="alert">
      <h2>User unavailable</h2><p>{error}</p>
      <Link className="admin-secondary-button" to="/admin/users">Back to users</Link>
    </div>
  );

  const { user, profile, qr, reports } = data;
  const personal = profile?.personal;
  const contact = profile?.contact;
  const emergency = profile?.emergencyContact;
  const medical = profile?.medical;
  const insurance = profile?.insurance;

  const overview = (
    <div className="admin-detail-grid">
      <section className="admin-detail-card">
        <h2>Account overview</h2>
        <dl>
          <Field label="Account email">{value(user.email)}</Field>
          <Field label="Role">{value(user.role)}</Field>
          <Field label="Email verification">{user.isVerified ? 'Verified' : 'Not verified'}</Field>
          <Field label="Registered">{dateValue(user.createdAt)}</Field>
          <Field label="Last updated">{dateValue(user.updatedAt, true)}</Field>
          <Field label="Last login">{dateValue(user.lastLoginAt, true)}</Field>
        </dl>
      </section>
      <section className="admin-detail-card">
        <h2>Record readiness</h2>
        <dl>
          <Field label="Medical profile"><AdminStatusBadge status={user.profileStatus} /></Field>
          <Field label="Completion">{user.profileCompletion}%</Field>
          <Field label="Saved reports"><AdminStatusBadge status={reports.available ? 'available' : 'not available'} /></Field>
          <Field label="QR record"><AdminStatusBadge status={qr.status} /></Field>
        </dl>
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
    </dl></section> : null,
    Contact: profile ? <div className="admin-detail-grid">
      <section className="admin-detail-card"><h2>Contact information</h2><dl>
        <Field label="Phone">{value(contact.phone)}</Field><Field label="Address">{value(contact.address)}</Field>
      </dl></section>
      <section className="admin-detail-card"><h2>Emergency contact</h2><dl>
        <Field label="Name">{value(emergency.name)}</Field><Field label="Phone">{value(emergency.phone)}</Field>
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
    Reports: <section className="admin-detail-card admin-empty-feature"><FaFileMedical aria-hidden="true" /><h2>No saved reports</h2><p>{reports.message}</p><small>Immutable snapshots, preview, history, and authenticated downloads are scheduled for Phase 4.</small></section>,
    QR: <section className="admin-detail-card"><h2>QR information</h2><dl>
      <Field label="Status"><AdminStatusBadge status={qr.status} /></Field>
      <Field label="Legacy QR records">{qr.totalRecords}</Field>
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
        <div className="admin-detail-statuses"><AdminStatusBadge status={user.accountStatus} /><AdminStatusBadge status={user.profileStatus} /></div>
      </header>

      <div className="admin-detail-tabs" role="tablist" aria-label="User record sections">
        {tabs.map((tab) => <button key={tab} role="tab" aria-selected={activeTab === tab} className={activeTab === tab ? 'active' : ''} onClick={() => setActiveTab(tab)}>{tab}</button>)}
      </div>

      {!profile && !['Overview', 'Reports', 'QR'].includes(activeTab)
        ? <div className="admin-state-card"><h2>No medical profile</h2><p>This user has not submitted medical information.</p></div>
        : sections[activeTab]}
    </div>
  );
};

export default AdminUserDetail;
