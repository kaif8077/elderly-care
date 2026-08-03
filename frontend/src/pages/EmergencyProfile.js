import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  FaBell, FaExclamationTriangle, FaHospital, FaLocationArrow, FaPhoneAlt,
  FaSms, FaUserShield
} from 'react-icons/fa';
import api from '../services/api';
import { Button } from 'antd';
import './EmergencyProfile.css';

const readableList = (items, empty = 'None reported') =>
  Array.isArray(items) && items.length ? items.join(', ') : empty;

const EmergencyProfile = () => {
  const { token } = useParams();
  const [profile, setProfile] = useState(null);
  const [state, setState] = useState({ loading: true, error: '' });
  const [alertState, setAlertState] = useState({ sending: false, message: '', error: false });
  const [alertForm, setAlertForm] = useState({ emergencyType: 'medical_emergency', responderName: '', responderPhone: '', responderMessage: '', shareLocation: false });
  const [location, setLocation] = useState(null);
  const primary = profile?.emergencyContacts?.[0];

  useEffect(() => {
    let active = true;
    api.get(`/api/qr/public/${encodeURIComponent(token)}`)
      .then(({ data }) => {
        if (active) {
          setProfile(data.emergencyProfile);
          setState({ loading: false, error: '' });
        }
      })
      .catch((error) => {
        if (active) {
          setState({
            loading: false,
            error: error.response?.data?.message || error.message || 'Unable to open this emergency profile.'
          });
        }
      });
    return () => { active = false; };
  }, [token]);

  const smsLink = useMemo(() => {
    if (!primary?.phone || !profile) return null;
    const message = `Emergency assistance may be needed for ${profile.name} (${profile.elderlyCareId}).`;
    return `sms:${primary.phone}?body=${encodeURIComponent(message)}`;
  }, [primary, profile]);

  const sendSecureAlert = async () => {
    if (!window.confirm('Notify the verified account owner that this emergency QR was activated? No location or medical details will be emailed.')) return;
    setAlertState({ sending: true, message: '', error: false });
    try {
      const { data } = await api.post(`/api/emergency-alerts/public/${encodeURIComponent(token)}`, {
        emergencyType: alertForm.emergencyType,
        responderName: alertForm.responderName || undefined,
        responderPhone: alertForm.responderPhone || undefined,
        responderMessage: alertForm.responderMessage || undefined,
        ...(alertForm.shareLocation && location ? { latitude: location.latitude, longitude: location.longitude, locationAccuracy: location.accuracy } : {})
      });
      setAlertState({ sending: false, message: data.message, error: false });
    } catch (error) {
      setAlertState({
        sending: false,
        message: error.response?.data?.message || 'Unable to send the alert. Please call the contact directly.',
        error: true
      });
    }
  };
  const updateAlertForm = (field) => (event) => setAlertForm((current) => ({ ...current, [field]: event.target.type === 'checkbox' ? event.target.checked : event.target.value }));
  const requestAlertLocation = (event) => {
    const enabled = event.target.checked;
    setAlertForm((current) => ({ ...current, shareLocation: enabled }));
    if (!enabled || !navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(({ coords }) => setLocation({ latitude: coords.latitude, longitude: coords.longitude, accuracy: coords.accuracy }), () => {
      setAlertForm((current) => ({ ...current, shareLocation: false }));
      setAlertState({ sending: false, message: 'Location permission was unavailable. You can still send the alert without location.', error: true });
    }, { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 });
  };
  const shareLocation = () => {
    if (!navigator.geolocation || !primary?.phone) return;
    navigator.geolocation.getCurrentPosition(({ coords }) => {
      const map = `https://maps.google.com/?q=${coords.latitude},${coords.longitude}`;
      window.location.href = `sms:${primary.phone}?body=${encodeURIComponent(
        `Emergency location for ${profile.name}: ${map}`
      )}`;
    }, () => {
      window.alert('Location permission was unavailable. Please call the emergency contact directly.');
    }, { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 });
  };

  if (state.loading) {
    return <main className="emergency-shell" aria-busy="true"><div className="emergency-state">Loading emergency information...</div></main>;
  }
  if (state.error) {
    return <main className="emergency-shell"><div className="emergency-state emergency-error"><FaExclamationTriangle /><h1>Emergency profile unavailable</h1><p>{state.error}</p></div></main>;
  }

  return (
    <main className="emergency-shell">
      <header className="emergency-header">
        <span className="emergency-brand"><FaUserShield /> ElderlyCare</span>
        <span className="emergency-status">Active emergency card</span>
        <h1>{profile.name}</h1>
        <p>{profile.elderlyCareId}{profile.approximateAge !== null ? ` - Approx. age ${profile.approximateAge}` : ''}</p>
      </header>

      <section className="critical-panel" aria-labelledby="critical-title">
        <h2 id="critical-title"><FaExclamationTriangle /> Critical information</h2>
        <div className="critical-grid">
          <article><span>Blood group</span><strong>{profile.bloodGroup}</strong></article>
          <article><span>Severe allergies</span><strong>{readableList(profile.severeAllergies)}</strong></article>
          <article><span>Major conditions</span><strong>{readableList(profile.majorConditions)}</strong></article>
          <article><span>Critical medications</span><strong>{readableList(profile.criticalMedications)}</strong></article>
          {profile.mobilityStatus && <article><span>Mobility needs</span><strong>{profile.mobilityStatus.replaceAll('_', ' ')}</strong></article>}
          {profile.preferredLanguage?.length > 0 && <article><span>Preferred language</span><strong>{readableList(profile.preferredLanguage)}</strong></article>}
        </div>
      </section>

      <section className="emergency-instruction">
        <h2>Emergency instruction</h2>
        <p>{profile.emergencyInstruction}</p>
      </section>

      <section className="responder-panel" aria-labelledby="responder-title">
        <h2 id="responder-title">Add responder details (optional)</h2>
        <p>Review exactly what will be shared with the account owner and verified emergency contacts.</p>
        <div className="responder-grid">
          <label>Situation type<select value={alertForm.emergencyType} onChange={updateAlertForm('emergencyType')}><option value="person_found">Person found</option><option value="medical_emergency">Medical emergency</option><option value="fall">Fall</option><option value="lost_confused">Lost or confused person</option><option value="accident">Accident</option><option value="other">Other</option></select></label>
          <label>Your name (optional)<input value={alertForm.responderName} maxLength="80" onChange={updateAlertForm('responderName')} placeholder="Enter your name" /></label>
          <label>Your phone (optional)<input value={alertForm.responderPhone} maxLength="30" onChange={updateAlertForm('responderPhone')} placeholder="Enter your phone number" /></label>
          <label className="responder-message">Situation message (optional)<textarea value={alertForm.responderMessage} maxLength="500" onChange={updateAlertForm('responderMessage')} placeholder="Describe the person's current condition or location." /></label>
        </div>
        <label className="location-consent"><input type="checkbox" checked={alertForm.shareLocation} onChange={requestAlertLocation} /> Share my current location with this alert</label>
        <div className="share-summary"><strong>Information to be shared:</strong> situation type{alertForm.responderName ? ', responder name' : ''}{alertForm.responderPhone ? ', responder phone' : ''}{alertForm.responderMessage ? ', message' : ''}{alertForm.shareLocation && location ? ', current coordinates and map link' : ''}.</div>
      </section>

      <section className="emergency-actions" aria-label="Emergency actions">
        {primary?.phone && <Button type="primary" size="large" block href={`tel:${primary.phone}`} icon={<FaPhoneAlt />}>Call {primary.name || 'primary contact'}</Button>}
        <Button size="large" block onClick={sendSecureAlert} loading={alertState.sending} icon={<FaBell />}>Send secure alert</Button>
        {smsLink && <Button size="large" block href={smsLink} icon={<FaSms />}>Open emergency SMS</Button>}
        {primary?.phone && <Button size="large" block onClick={shareLocation} icon={<FaLocationArrow />}>Share current location</Button>}
        <Button size="large" block href="https://www.google.com/maps/search/hospital+near+me" target="_blank" rel="noreferrer" icon={<FaHospital />}>Find nearby hospital</Button>
      </section>

      {alertState.message && <div className={`alert-result ${alertState.error ? 'alert-result-error' : ''}`} role="status">{alertState.message}</div>}

      <section className="emergency-contact-card">
        <h2>Emergency contact</h2>
        {primary ? <p><strong>{primary.name}</strong><br /><a href={`tel:${primary.phone}`}>{primary.phone}</a></p> : <p>No contact is available.</p>}
      </section>

      <footer className="emergency-privacy">
        <strong>Privacy notice</strong>
        <p>This limited page shows emergency-use information only. Insurance, address, documents, and complete medical reports are not publicly exposed.</p>
        <p>Call local emergency services when there is immediate danger. This summary is not medical advice.</p>
      </footer>
    </main>
  );
};

export default EmergencyProfile;
