import React, { useCallback, useEffect, useRef, useState } from 'react';
import { FaArrowLeft, FaDownload, FaPrint, FaQrcode, FaShieldAlt, FaSyncAlt, FaTimesCircle } from 'react-icons/fa';
import html2canvas from 'html2canvas';
import { Link, useParams } from 'react-router-dom';
import adminApi from '../../services/adminApi';
import AdminStatusBadge from '../components/AdminStatusBadge';

const ageFromDob = (dob) => {
  if (!dob) return null;
  const birth = new Date(dob);
  if (Number.isNaN(birth.getTime())) return null;
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  if (now < new Date(now.getFullYear(), birth.getMonth(), birth.getDate())) age -= 1;
  return age;
};

const AdminIdCard = () => {
  const { userId } = useParams();
  const cardRef = useRef(null);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await adminApi.get(`/id-cards/${userId}`);
      setData(response.data);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to load this ID card.');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => { load(); }, [load]);

  const runAction = async (action) => {
    const description = action === 'revoke'
      ? 'Revoke this QR code? Printed copies will stop working.'
      : 'Generate a new QR code? Any existing active QR code will be revoked.';
    if (!window.confirm(description)) return;
    setWorking(true);
    setMessage('');
    try {
      const response = await adminApi.post(`/id-cards/${userId}/${action}`);
      setMessage(response.data.message);
      await load();
    } catch (requestError) {
      setMessage(requestError.response?.data?.message || 'Unable to complete the QR action.');
    } finally {
      setWorking(false);
    }
  };

  const downloadImage = async () => {
    if (!cardRef.current || !data?.card) return;
    setWorking(true);
    try {
      const canvas = await html2canvas(cardRef.current, { scale: 4, backgroundColor: '#eef4f2', useCORS: true });
      const link = document.createElement('a');
      link.download = `${data.card.elderlyCareId}-front-back.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      setMessage('High-resolution front and back card image downloaded.');
    } catch (downloadError) {
      setMessage('Unable to download the ID card image.');
    } finally {
      setWorking(false);
    }
  };

  if (loading) return <div className="admin-detail-skeleton skeleton" aria-label="Loading ID card" />;
  if (error) return <div className="admin-state-card" role="alert"><h2>ID card unavailable</h2><p>{error}</p><Link to={`/admin/users/${userId}`}>Back to user</Link></div>;
  if (!data.card) return <div className="admin-state-card"><h2>No medical profile</h2><p>An ID card cannot be generated until the user has a medical profile.</p><Link to={`/admin/users/${userId}`}>Back to user</Link></div>;

  const { card, user } = data;
  const age = ageFromDob(card.dob);
  const updated = card.lastUpdatedAt ? new Date(card.lastUpdatedAt).toLocaleDateString() : 'Not available';
  const generated = card.qr?.generatedAt ? new Date(card.qr.generatedAt).toLocaleDateString() : 'Not generated';

  return (
    <div className="admin-id-card-page">
      <Link className="admin-back-link" to={`/admin/users/${userId}`}><FaArrowLeft /> Back to user</Link>
      <div className="admin-page-actions">
        <div><p>Wallet-size emergency ID for {user.name}.</p><small>Only emergency-safe details are printed on the card.</small></div>
        <AdminStatusBadge status={card.status} />
      </div>

      <div className="admin-card-workspace">
        <div className="elder-card-pair" ref={cardRef} aria-label="ElderlyCare ID card front and back preview">
          <section className="wallet-card wallet-card-front" aria-label="ID card front side">
            <div className="wallet-card-brand"><span><FaShieldAlt /> ELDERLYCARE</span><b>EMERGENCY ID</b></div>
            <div className="wallet-card-main">
              <div className="wallet-card-person">
                <span className="wallet-photo" aria-label="Default profile avatar">{card.name.charAt(0).toUpperCase()}</span>
                <div><h2>{card.name}</h2><p>{card.elderlyCareId}</p><p>{age !== null ? `Age ${age}` : 'Age not available'}</p></div>
              </div>
              <div className="wallet-blood"><small>BLOOD GROUP</small><strong>{card.bloodGroup}</strong></div>
              <div className="wallet-qr">
                {card.qr?.image ? <img src={card.qr.image} alt="Revocable emergency access QR code" /> : <div><FaQrcode /><span>No active QR</span></div>}
                <b>SCAN IN CASE OF EMERGENCY</b>
              </div>
            </div>
            <div className="wallet-card-meta"><span>{card.status.toUpperCase()}</span><span>Updated {updated}</span></div>
          </section>

          <section className="wallet-card wallet-card-back" aria-label="ID card back side">
            <div className="wallet-card-brand"><span>EMERGENCY DETAILS</span><b>{card.elderlyCareId}</b></div>
            <dl className="wallet-emergency-list">
              <div><dt>Primary contact</dt><dd>{card.emergencyContact}</dd></div>
              <div><dt>Phone</dt><dd>{card.emergencyPhone}</dd></div>
              <div className="wallet-warning"><dt>Allergy warning</dt><dd>{card.allergyWarning}</dd></div>
              <div><dt>Preferred language</dt><dd>{card.preferredLanguage}</dd></div>
            </dl>
            <p className="wallet-instruction">Call the emergency contact and local emergency services if immediate help is required.</p>
            <div className="wallet-privacy"><strong>Privacy:</strong> Scan the revocable QR for the permitted emergency summary. No insurance or full report is stored on this card.</div>
            <div className="wallet-card-meta"><span>QR issued {generated}</span><span>elderlycare</span></div>
          </section>
        </div>

        <aside className="admin-card-controls">
          <h2>Card controls</h2>
          <p>The QR contains a random revocable token, never a user ID or complete medical record.</p>
          <button className="admin-primary-button" onClick={downloadImage} disabled={working || !card.qr}><FaDownload /> Download front + back PNG</button>
          <button className="admin-secondary-button" onClick={() => window.print()} disabled={working}><FaPrint /> Print / Save wallet PDF</button>
          <button className="admin-secondary-button" onClick={() => runAction('regenerate')} disabled={working || user.accountStatus !== 'active'}><FaSyncAlt /> Generate new QR</button>
          <button className="admin-danger-button" onClick={() => runAction('revoke')} disabled={working || !card.qr}><FaTimesCircle /> Revoke QR</button>
          {message && <p className="admin-action-message" role="status">{message}</p>}
          <small>Print at 100% scale for the intended wallet-card proportions.</small>
        </aside>
      </div>
    </div>
  );
};

export default AdminIdCard;