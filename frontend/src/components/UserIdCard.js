import React, { useRef, useState } from 'react';
import html2canvas from 'html2canvas';
import { Button, Space, message } from 'antd';
import { DownloadOutlined, QrcodeOutlined } from '@ant-design/icons';
import './UserIdCard.css';

const formatId = (value) => String(value || '').replace(/\D/g, '').padStart(12, '0').slice(-12).replace(/(\d{4})(?=\d)/g, '$1 ');
const formatDob = (value) => value ? new Date(value).toLocaleDateString('en-GB') : 'Not provided';

const UserIdCard = ({ profile, qrCode, photoUrl }) => {
  const pairRef = useRef(null);
  const frontRef = useRef(null);
  const [working, setWorking] = useState(false);

  if (!profile) return null;
  const elderlyCareId = formatId(profile.elderlyCareId || profile.userId || profile._id);

  const renderCard = (element) => html2canvas(element, {
    scale: 4,
    backgroundColor: '#ffffff',
    useCORS: true
  });

  const downloadPdf = async () => {
    if (!frontRef.current) return;
    setWorking(true);
    try {
      const { jsPDF } = await import('jspdf');
      const front = await renderCard(frontRef.current);
      const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: [85.6, 53.98] });
      pdf.addImage(front.toDataURL('image/jpeg', 0.95), 'JPEG', 0, 0, 85.6, 53.98);
      pdf.save(`${elderlyCareId}-id-card.pdf`);
      message.success('ID card PDF downloaded.');
    } catch (error) {
      message.error('Unable to create the ID card PDF.');
    } finally {
      setWorking(false);
    }
  };

  return (
    <section className="user-id-module">
      <div className="user-card-pair" ref={pairRef}>
        <article className="user-wallet-card" ref={frontRef}>
          <header><span><img src="/favicon.png" alt="" /> ELDERLYCARE</span><b>IDENTITY CARD</b></header>
          <div className="user-card-main">
            <span className="user-card-photo">
              {photoUrl ? <img src={photoUrl} alt={`${profile.name} profile`} /> : profile.name?.charAt(0)}
            </span>
            <div className="user-card-person">
              <small>CARD HOLDER</small>
              <h3>{profile.name}</h3>
              <p><strong>Date of birth</strong><br />{formatDob(profile.dob)}</p>
            </div>
            <div className="user-card-qr">{qrCode ? <img src={qrCode} alt="Emergency QR code" /> : <QrcodeOutlined />}<b>SCAN IN EMERGENCY</b></div>
          </div>
          <footer><strong className="user-card-number">{elderlyCareId}</strong></footer>
        </article>

      </div>

      <Space className="user-card-actions" wrap>
        <Button type="primary" icon={<DownloadOutlined />} onClick={downloadPdf} loading={working}>
          Download ID card PDF
        </Button>
      </Space>
    </section>
  );
};

export default UserIdCard;
