import React, { useRef, useState } from 'react';
import html2canvas from 'html2canvas';
import { Button, Space, message } from 'antd';
import { DownloadOutlined, QrcodeOutlined } from '@ant-design/icons';
import './UserIdCard.css';

// Normalizes stored identifiers into the 12-digit number printed on the card.
const formatId = (value) =>
  String(value || '')
    .replace(/\D/g, '')
    .padStart(12, '0')
    .slice(-12)
    .replace(/(\d{4})(?=\d)/g, '$1 ');
// Formats the member's date of birth consistently for the card preview and PDF.
const formatDob = (value) => (value ? new Date(value).toLocaleDateString('en-GB') : 'Not provided');

// Displays the emergency ID card and generates a fixed-size downloadable PDF.
const UserIdCard = ({ profile, qrCode, photoUrl }) => {
  const frontRef = useRef(null);
  const [working, setWorking] = useState(false);

  if (!profile) return null;
  const elderlyCareId = formatId(profile.elderlyCareId || profile.userId || profile._id);

  // Captures the card at fixed dimensions so mobile and desktop downloads match.
  const renderCard = (element) =>
    html2canvas(element, {
      scale: 2,
      backgroundColor: '#ffffff',
      useCORS: true,
      width: 856,
      height: 540,
      windowWidth: 1200,
      windowHeight: 800,
      onclone: (documentClone) => {
        documentClone.querySelector('.user-wallet-card')?.classList.add('pdf-capture');
      }
    });

  // Converts the visible front card into a wallet-sized PDF download.
  const downloadPdf = async () => {
    if (!frontRef.current) return;
    setWorking(true);
    try {
      const { jsPDF } = await import('jspdf');
      const front = await renderCard(frontRef.current);
      const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: [85.6, 53.98] });
      pdf.addImage(front.toDataURL('image/jpeg', 0.95), 'JPEG', 0, 0, 85.6, 53.98);
      const blobUrl = URL.createObjectURL(pdf.output('blob'));
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `${elderlyCareId}-id-card.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
      message.success('ID card PDF downloaded.');
    } catch (error) {
      message.error('Unable to create the ID card PDF.');
    } finally {
      setWorking(false);
    }
  };

  return (
    <section className="user-id-module">
      <div className="user-card-pair">
        <article className="user-wallet-card" ref={frontRef}>
          <header>
            <span>
              <img src="/favicon.png" alt="" /> ELDERLYCARE
            </span>
            <b>IDENTITY CARD</b>
          </header>
          <div className="user-card-main">
            <span className="user-card-photo">
              {photoUrl ? (
                <img src={photoUrl} alt={`${profile.name} profile`} />
              ) : (
                profile.name?.charAt(0)
              )}
            </span>
            <div className="user-card-person">
              <h3>{profile.name}</h3>
              <p>
                <strong>Date of birth</strong>
                <br />
                {formatDob(profile.dob)}
              </p>
            </div>
            <div className="user-card-qr">
              {qrCode ? <img src={qrCode} alt="Emergency QR code" /> : <QrcodeOutlined />}
              <b>SCAN IN EMERGENCY</b>
            </div>
          </div>
          <footer>
            <strong className="user-card-number">{elderlyCareId}</strong>
          </footer>
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
