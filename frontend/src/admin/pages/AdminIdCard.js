import React, { useCallback, useEffect, useRef, useState } from 'react';
import { FaArrowLeft, FaDownload, FaPrint, FaQrcode, FaShieldAlt, FaSyncAlt, FaTimesCircle } from 'react-icons/fa';
import html2canvas from 'html2canvas';
import { Link, useParams } from 'react-router-dom';
import adminApi from '../../services/adminApi';
import AdminStatusBadge from '../components/AdminStatusBadge';

const formatDob = (dob) => dob && !Number.isNaN(new Date(dob).getTime())
  ? new Date(dob).toLocaleDateString('en-GB')
  : 'Not available';

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
      const canvas = await html2canvas(cardRef.current, { scale: 4, backgroundColor: '#f3f6fc', useCORS: true });
      const link = document.createElement('a');
      link.download = `${data.card.elderlyCareId}-id-card.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      setMessage('High-resolution ID card image downloaded.');
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
  const updated = card.lastUpdatedAt ? new Date(card.lastUpdatedAt).toLocaleDateString() : 'Not available';

  return (
    <div className="admin-id-card-page">
      <Link className="admin-back-link" to={`/admin/users/${userId}`}><FaArrowLeft /> Back to user</Link>
      <div className="admin-page-actions">
        <div><p>Wallet-size emergency ID for {user.name}.</p><small>Only emergency-safe details are printed on the card.</small></div>
        <AdminStatusBadge status={card.status} />
      </div>

      <div className="admin-card-workspace">
        <div className="elder-card-pair" ref={cardRef} aria-label="ElderlyCare ID card preview">
          <section className="wallet-card wallet-card-front" aria-label="ID card front side">
            <div className="wallet-card-brand"><span><FaShieldAlt /> ELDERLYCARE</span><b>EMERGENCY ID</b></div>
            <div className="wallet-card-main">
              <span className="wallet-photo" aria-label="Default profile avatar">{card.name.charAt(0).toUpperCase()}</span>
              <div className="wallet-card-person">
                <div><small>CARD HOLDER</small><h2>{card.name}</h2><p>Date of birth<br /><strong>{formatDob(card.dob)}</strong></p></div>
              </div>
              <div className="wallet-qr">
                {card.qr?.image ? <img src={card.qr.image} alt="Revocable emergency access QR code" /> : <div><FaQrcode /><span>No active QR</span></div>}
                <b>SCAN IN CASE OF EMERGENCY</b>
              </div>
            </div>
            <div className="wallet-card-meta"><span>ELDERLYCARE CARD NUMBER</span><strong>{card.elderlyCareId}</strong><span>Updated {updated}</span></div>
          </section>

        </div>

        <aside className="admin-card-controls">
          <h2>Card controls</h2>
          <p>The QR contains a random revocable token, never a user ID or complete medical record.</p>
          <button className="admin-primary-button" onClick={downloadImage} disabled={working || !card.qr}><FaDownload /> Download ID card PNG</button>
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
