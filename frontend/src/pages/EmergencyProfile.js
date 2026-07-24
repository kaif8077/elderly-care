import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  FaExclamationTriangle, FaHospital, FaLocationArrow, FaPhoneAlt,
  FaSms, FaUserShield
} from 'react-icons/fa';
import api from '../services/api';
import './EmergencyProfile.css';

const readableList = (items, empty = 'None reported') =>
  Array.isArray(items) && items.length ? items.join(', ') : empty;

const EmergencyProfile = () => {
  const { token } = useParams();
  const [profile, setProfile] = useState(null);
  const [state, setState] = useState({ loading: true, error: '' });
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
    return <main className="emergency-shell" aria-busy="true"><div className="emergency-state">Loading emergency information…</div></main>;
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
        <p>{profile.elderlyCareId}{profile.approximateAge !== null ? ` · Approx. age ${profile.approximateAge}` : ''}</p>
      </header>

      <section className="critical-panel" aria-labelledby="critical-title">
        <h2 id="critical-title"><FaExclamationTriangle /> Critical information</h2>
        <div className="critical-grid">
          <article><span>Blood group</span><strong>{profile.bloodGroup}</strong></article>
          <article><span>Severe allergies</span><strong>{readableList(profile.severeAllergies)}</strong></article>
          <article><span>Major conditions</span><strong>{readableList(profile.majorConditions)}</strong></article>
          <article><span>Critical medications</span><strong>{readableList(profile.criticalMedications)}</strong></article>
        </div>
      </section>

      <section className="emergency-instruction">
        <h2>Emergency instruction</h2>
        <p>{profile.emergencyInstruction}</p>
      </section>

      <section className="emergency-actions" aria-label="Emergency actions">
        {primary?.phone && <a className="action action-primary" href={`tel:${primary.phone}`}><FaPhoneAlt /> Call {primary.name || 'primary contact'}</a>}
        {smsLink && <a className="action" href={smsLink}><FaSms /> Open emergency SMS</a>}
        {primary?.phone && <button className="action" type="button" onClick={shareLocation}><FaLocationArrow /> Share current location</button>}
        <a className="action" href="https://www.google.com/maps/search/hospital+near+me" target="_blank" rel="noreferrer"><FaHospital /> Find nearby hospital</a>
      </section>

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
