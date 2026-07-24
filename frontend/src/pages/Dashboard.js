import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { Button, Card, Typography } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { AuthContext } from '../context/AuthContext';
import MedicalForm from '../components/MedicalForm';
import QRCodeDisplay from '../components/QRCodeDisplay';
import Recommendations from '../components/Recommendations';

const { Title, Text, Paragraph } = Typography;

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  return (
    <main className="care-page">
      <Card className="care-dashboard-hero" styles={{ body: { padding: 32 } }}>
        <div className="care-dashboard-heading">
          <div>
            <Text className="care-eyebrow" style={{ color: '#dbe8ff' }}>ELDERLYCARE MEMBER AREA</Text>
            <Title style={{ margin: '8px 0' }}>Welcome, {user?.name || 'Member'}</Title>
            <Paragraph type="secondary" style={{ margin: 0, fontSize: 17 }}>Keep emergency information accurate and ready when it matters.</Paragraph>
          </div>
          <Link to="/profile"><Button size="large" icon={<UserOutlined />}>Open my profile</Button></Link>
        </div>
      </Card>
      <Card id="medical-form" className="care-section-card"><MedicalForm /></Card>
      <section id="qr"><QRCodeDisplay /></section>
      <Card className="care-section-card"><Recommendations /></Card>
    </main>
  );
};

export default Dashboard;
