import React, { useContext } from 'react';
import { Card, Typography } from 'antd';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import MedicalForm from '../components/MedicalForm';
import QRCodeDisplay from '../components/QRCodeDisplay';
import Recommendations from '../components/Recommendations';
import EmergencyAlertSummary from '../components/EmergencyAlertSummary';

const { Title, Paragraph } = Typography;

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  return (
    <main className="care-page">
      <Card className="care-dashboard-hero" styles={{ body: { padding: 32 } }}>
        <div className="care-dashboard-heading">
          <div>
            <Title level={2} className="care-eyebrow">ELDERLYCARE MEMBER AREA</Title>
            <Title style={{ margin: '8px 0' }}>Welcome, {user?.name || 'Member'}</Title>
            <Paragraph type="secondary" style={{ margin: 0, fontSize: 17 }}>Keep emergency information accurate and ready when it matters.</Paragraph>
          </div>
        </div>
      </Card>
      <EmergencyAlertSummary />
      <Card id="medical-form" className="care-section-card">
        <MedicalForm onSubmissionSuccess={() => navigate('/profile')} />
      </Card>
      <section id="qr"><QRCodeDisplay /></section>
      <Card className="care-section-card"><Recommendations /></Card>
    </main>
  );
};

export default Dashboard;
