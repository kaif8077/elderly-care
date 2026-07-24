import React, { useRef } from 'react';
import html2canvas from 'html2canvas';
import { FaDownload, FaPrint, FaQrcode, FaShieldAlt } from 'react-icons/fa';
import './UserIdCard.css';

const age = (dob) => {
  if (!dob) return null;
  const birth = new Date(dob);
  const today = new Date();
  let value = today.getFullYear() - birth.getFullYear();
  if (today < new Date(today.getFullYear(), birth.getMonth(), birth.getDate())) value -= 1;
  return Number.isFinite(value) ? value : null;
};

const UserIdCard = ({ profile, qrCode, photoUrl }) => {
  const ref = useRef(null);
  if (!profile) return null;
  const elderlyCareId = `EC-${String(profile.userId || profile._id).slice(-8).toUpperCase()}`;
  const allergies = [...(profile.allergies || []), profile.allergiesOther].filter(Boolean).join(', ') || 'None reported';

  const download = async () => {
    const canvas = await html2canvas(ref.current, { scale: 4, backgroundColor: '#eef4f2', useCORS: true });
    const link = document.createElement('a');
    link.download = `${elderlyCareId}-front-back.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  return <section className="user-id-module">
    <div className="user-card-pair" ref={ref}>
      <article className="user-wallet-card">
        <header><span><FaShieldAlt /> ELDERLYCARE</span><b>EMERGENCY ID</b></header>
        <div className="user-card-main">
          <div className="user-card-person">
            <span className="user-card-photo">{photoUrl ? <img src={photoUrl} alt="" /> : profile.name?.charAt(0)}</span>
            <div><h3>{profile.name}</h3><p>{elderlyCareId}</p><p>{age(profile.dob) !== null ? `Age ${age(profile.dob)}` : 'Age unavailable'}</p></div>
          </div>
          <strong className="user-card-blood"><small>BLOOD GROUP</small>{profile.bloodGroup || 'Unknown'}</strong>
          <div className="user-card-qr">{qrCode ? <img src={qrCode} alt="Emergency QR code" /> : <FaQrcode />}<b>SCAN IN EMERGENCY</b></div>
        </div>
        <footer><span>{qrCode ? 'ACTIVE' : 'QR NOT GENERATED'}</span><span>Emergency use only</span></footer>
      </article>
      <article className="user-wallet-card user-wallet-back">
        <header><span>EMERGENCY DETAILS</span><b>{elderlyCareId}</b></header>
        <dl>
          <div><dt>Primary contact</dt><dd>{profile.emergencyContact}</dd></div>
          <div><dt>Phone</dt><dd>{profile.emergencyPhone}</dd></div>
          <div className="user-card-warning"><dt>Allergy warning</dt><dd>{allergies}</dd></div>
        </dl>
        <p>Call the listed contact and local emergency services when immediate help is required.</p>
        <aside>No insurance policy or complete medical report is stored on this card.</aside>
        <footer><span>Revocable secure QR</span><span>ElderlyCare</span></footer>
      </article>
    </div>
    <div className="user-card-actions"><button onClick={download} disabled={!qrCode}><FaDownload /> Download PNG</button><button onClick={() => window.print()}><FaPrint /> Print / Save PDF</button></div>
  </section>;
};

export default UserIdCard;
