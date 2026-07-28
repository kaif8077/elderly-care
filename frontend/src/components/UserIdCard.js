import React, { useRef, useState } from 'react';
import html2canvas from 'html2canvas';
import { Button, Space, message } from 'antd';
import { DownloadOutlined, PrinterOutlined, QrcodeOutlined } from '@ant-design/icons';
import './UserIdCard.css';

const formatId = (value) => String(value || '').replace(/\D/g, '').padStart(12, '0').slice(-12).replace(/(\d{4})(?=\d)/g, '$1 ');
const formatDob = (value) => value ? new Date(value).toLocaleDateString('en-GB') : 'Not provided';

const UserIdCard = ({ profile, qrCode, photoUrl }) => {
  const pairRef = useRef(null);
  const frontRef = useRef(null);
  const backRef = useRef(null);
  const [working, setWorking] = useState(false);

  if (!profile) return null;
  const elderlyCareId = formatId(profile.elderlyCareId || profile.userId || profile._id);

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
          <header><span><img src="/favicon.png" alt="" /> ELDERLYCARE</span><b>IDENTITY CARD</b></header>
          <div className="user-card-main">
            <div className="user-card-person">
              <span className="user-card-photo">
                {photoUrl ? <img src={photoUrl} alt={`${profile.name} profile`} /> : profile.name?.charAt(0)}
              </span>
              <div><h3>{profile.name}</h3><p className="user-card-number">{elderlyCareId}</p><p>DOB: {formatDob(profile.dob)}</p></div>
            </div>
            <div className="user-card-qr">{qrCode ? <img src={qrCode} alt="Emergency QR code" /> : <QrcodeOutlined />}<b>SCAN IN EMERGENCY</b></div>
          </div>
          <footer><span>{qrCode ? 'ACTIVE' : 'QR NOT GENERATED'}</span><span>Identity and emergency access</span></footer>
        </article>

        <article className="user-wallet-card user-wallet-back" ref={backRef}>
          <header><span><img src="/favicon.png" alt="" /> ELDERLYCARE</span><b>{elderlyCareId}</b></header>
          <div className="user-card-back-qr">{qrCode ? <img src={qrCode} alt="Emergency QR code" /> : <QrcodeOutlined />}</div>
          <aside className="user-card-emergency-guide">In an emergency, scan this QR code to view permitted details, contact caregivers, and share the person's location quickly and securely.</aside>
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
