import React, { useRef, useState } from 'react';
import html2canvas from 'html2canvas';
import { Button, Space, message } from 'antd';
import { DownloadOutlined, PrinterOutlined, QrcodeOutlined, SafetyCertificateOutlined } from '@ant-design/icons';
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
  const pairRef = useRef(null);
  const frontRef = useRef(null);
  const backRef = useRef(null);
  const [working, setWorking] = useState(false);

  if (!profile) return null;
  const elderlyCareId = `EC-${String(profile.userId || profile._id).slice(-8).toUpperCase()}`;
  const allergies = [...(profile.allergies || []), profile.allergiesOther].filter(Boolean).join(', ') || 'None reported';

  const renderCard = (element) => html2canvas(element, {
    scale: 4,
    backgroundColor: '#ffffff',
    useCORS: true
  });

  const downloadPdf = async () => {
    if (!frontRef.current || !backRef.current) return;
    setWorking(true);
    try {
      const { jsPDF } = await import('jspdf');
      const [front, back] = await Promise.all([renderCard(frontRef.current), renderCard(backRef.current)]);
      const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: [85.6, 53.98] });
      pdf.addImage(front.toDataURL('image/jpeg', 0.95), 'JPEG', 0, 0, 85.6, 53.98);
      pdf.addPage([85.6, 53.98], 'landscape');
      pdf.addImage(back.toDataURL('image/jpeg', 0.95), 'JPEG', 0, 0, 85.6, 53.98);
      pdf.save(`${elderlyCareId}-front-back.pdf`);
      message.success('Front and back ID card PDF downloaded.');
    } catch (error) {
      message.error('Unable to create the ID card PDF.');
    } finally {
      setWorking(false);
    }
  };

  const printCards = () => {
    document.body.classList.add('id-card-print-mode');
    const cleanup = () => document.body.classList.remove('id-card-print-mode');
    window.addEventListener('afterprint', cleanup, { once: true });
    window.print();
    window.setTimeout(cleanup, 1000);
  };

  return (
    <section className="user-id-module">
      <div className="user-card-pair" ref={pairRef}>
        <article className="user-wallet-card" ref={frontRef}>
          <header><span><SafetyCertificateOutlined /> ELDERLYCARE</span><b>EMERGENCY ID</b></header>
          <div className="user-card-main">
            <div className="user-card-person">
              <span className="user-card-photo">
                {photoUrl ? <img src={photoUrl} alt={`${profile.name} profile`} /> : profile.name?.charAt(0)}
              </span>
              <div><h3>{profile.name}</h3><p>{elderlyCareId}</p><p>{age(profile.dob) !== null ? `Age ${age(profile.dob)}` : 'Age unavailable'}</p></div>
            </div>
            <strong className="user-card-blood"><small>BLOOD GROUP</small>{profile.bloodGroup || 'Unknown'}</strong>
            <div className="user-card-qr">{qrCode ? <img src={qrCode} alt="Emergency QR code" /> : <QrcodeOutlined />}<b>SCAN IN EMERGENCY</b></div>
          </div>
          <footer><span>{qrCode ? 'ACTIVE' : 'QR NOT GENERATED'}</span><span>Emergency use only</span></footer>
        </article>

        <article className="user-wallet-card user-wallet-back" ref={backRef}>
          <header><span>EMERGENCY DETAILS</span><b>{elderlyCareId}</b></header>
          <dl>
            <div><dt>Primary contact</dt><dd>{profile.emergencyContact || 'Not provided'}</dd></div>
            <div><dt>Phone</dt><dd>{profile.emergencyPhone || 'Not provided'}</dd></div>
            <div className="user-card-warning"><dt>Allergy warning</dt><dd>{allergies}</dd></div>
          </dl>
          <p>Call the listed contact and local emergency services when immediate help is required.</p>
          <aside>No insurance policy or complete medical report is stored on this card.</aside>
          <footer><span>Revocable secure QR</span><span>ElderlyCare</span></footer>
        </article>
      </div>

      <Space className="user-card-actions" wrap>
        <Button type="primary" icon={<DownloadOutlined />} onClick={downloadPdf} loading={working}>
          Download front + back PDF
        </Button>
        <Button icon={<PrinterOutlined />} onClick={printCards}>Print ID card only</Button>
      </Space>
    </section>
  );
};

export default UserIdCard;
