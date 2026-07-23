import React, { useCallback, useEffect, useRef, useState } from 'react';
import { FaArrowLeft, FaDownload, FaPrint, FaQrcode, FaSyncAlt, FaTimesCircle } from 'react-icons/fa';
import html2canvas from 'html2canvas';
import { Link, useParams } from 'react-router-dom';
import adminApi from '../../services/adminApi';
import AdminStatusBadge from '../components/AdminStatusBadge';

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
      const canvas = await html2canvas(cardRef.current, { scale: 3, backgroundColor: '#ffffff', useCORS: true });
      const link = document.createElement('a');
      link.download = `${data.card.elderlyCareId}-card.png`;
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
  return (
    <div className="admin-id-card-page">
      <Link className="admin-back-link" to={`/admin/users/${userId}`}><FaArrowLeft /> Back to user</Link>
      <div className="admin-page-actions">
        <div><p>Preview and manage the emergency card for {user.name}.</p><small>Downloading is performed locally in the authenticated browser.</small></div>
        <AdminStatusBadge status={card.status} />
      </div>

      <div className="admin-card-workspace">
        <section className="elder-card-preview" ref={cardRef} aria-label="ElderlyCare ID card preview">
          <div className="elder-card-header"><strong>ELDERLYCARE</strong><span>Emergency ID Card</span></div>
          <div className="elder-card-body">
            <div className="elder-card-details">
              <span className="elder-card-photo" aria-hidden="true">{card.name.charAt(0)}</span>
              <h2>{card.name}</h2>
              <p><strong>ID:</strong> {card.elderlyCareId}</p>
              <p><strong>Blood group:</strong> <b className="elder-blood-group">{card.bloodGroup}</b></p>
              <p><strong>Emergency:</strong> {card.emergencyContact} · {card.emergencyPhone}</p>
              <p><strong>Allergy warning:</strong> {card.allergyWarning}</p>
            </div>
            <div className="elder-card-qr">
              {card.qr?.image ? <img src={card.qr.image} alt="Opaque emergency access QR code" /> : <div><FaQrcode /><span>No active QR</span></div>}
              <small>Scan in case of emergency</small>
            </div>
          </div>
          <div className="elder-card-footer"><span>Status: {card.status}</span><span>Updated {new Date(card.lastUpdatedAt).toLocaleDateString()}</span></div>
        </section>

        <aside className="admin-card-controls">
          <h2>Card controls</h2>
          <p>The QR contains an opaque, random token—not a user ID or medical record.</p>
          <button className="admin-primary-button" onClick={downloadImage} disabled={working || !card.qr}><FaDownload /> Download PNG</button>
          <button className="admin-secondary-button" onClick={() => window.print()} disabled={working}><FaPrint /> Print / Save PDF</button>
          <button className="admin-secondary-button" onClick={() => runAction('regenerate')} disabled={working || user.accountStatus !== 'active'}><FaSyncAlt /> Generate new QR</button>
          <button className="admin-danger-button" onClick={() => runAction('revoke')} disabled={working || !card.qr}><FaTimesCircle /> Revoke QR</button>
          {message && <p className="admin-action-message" role="status">{message}</p>}
          <small>PDF and front/back wallet layouts remain scheduled for the later ID-card redesign phase.</small>
        </aside>
      </div>
    </div>
  );
};

export default AdminIdCard;
