import React, { useContext, useEffect, useMemo, useState } from 'react';
import { Button, Card, Col, Flex, Progress, Row, Skeleton, Space, Tag, Typography } from 'antd';
import {
  ContactsOutlined, EditOutlined, FileProtectOutlined, HeartOutlined,
  MedicineBoxOutlined, ProfileOutlined, QrcodeOutlined, SafetyCertificateOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import MedicalForm from '../components/MedicalForm';
import QRCodeDisplay from '../components/QRCodeDisplay';
import Recommendations from '../components/Recommendations';
import EmergencyAlertSummary from '../components/EmergencyAlertSummary';
import api from '../services/api';

const { Title, Paragraph, Text } = Typography;
const profileFields = ['name', 'dob', 'gender', 'bloodGroup', 'phone', 'address', 'medicalHistory', 'allergies', 'medications'];

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [summary, setSummary] = useState({ loading: true, profile: null, qrReady: false });

  useEffect(() => {
    let active = true;
    const load = async () => {
      const [medical, qr] = await Promise.allSettled([
        api.get(`/api/medical/${user._id}`), api.get(`/api/qr/${user._id}`)
      ]);
      if (!active) return;
      setSummary({
        loading: false,
        profile: medical.status === 'fulfilled' ? medical.value.data : null,
        qrReady: qr.status === 'fulfilled' && Boolean(qr.value.data?.qrCode?.data)
      });
    };
    if (user?._id) load();
    return () => { active = false; };
  }, [user]);

  const completion = useMemo(() => {
    if (!summary.profile) return 0;
    const completed = profileFields.filter((key) => {
      const value = summary.profile[key];
      return Array.isArray(value) ? value.length : Boolean(value);
    }).length;
    return Math.round((completed / profileFields.length) * 100);
  }, [summary.profile]);

  const overviewCards = [
    { key: 'profile', icon: <ProfileOutlined />, label: 'Health profile', value: `${completion}%`, detail: 'complete', action: () => document.getElementById('medical-form')?.scrollIntoView({ behavior: 'smooth' }) },
    { key: 'contacts', icon: <ContactsOutlined />, label: 'Emergency contacts', value: summary.profile?.emergencyContacts?.length || 0, detail: 'saved', action: () => navigate('/profile') },
    { key: 'medical', icon: <MedicineBoxOutlined />, label: 'Medical details', value: summary.profile?.medicalHistory?.length || 0, detail: 'conditions', action: () => navigate('/profile') },
    { key: 'qr', icon: <QrcodeOutlined />, label: 'Emergency QR', value: summary.qrReady ? 'Active' : 'Pending', detail: summary.qrReady ? 'ready to scan' : 'generate below', action: () => document.getElementById('qr')?.scrollIntoView({ behavior: 'smooth' }) }
  ];

  return (
    <main className="care-page member-dashboard-page">
      <Card className="member-welcome-card">
        <Row align="middle" justify="space-between" gutter={[20, 20]}>
          <Col xs={24} md={15}>
            <Text type="secondary">Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'},</Text>
            <Title level={2}>Welcome, {user?.name || 'Member'}</Title>
            <Paragraph type="secondary">Manage health information and keep emergency access ready from one secure place.</Paragraph>
          </Col>
          <Col xs={24} md={9}>
            <Flex justify="space-between"><Text strong>Profile completion</Text><Text strong>{completion}%</Text></Flex>
            <Progress percent={completion} showInfo={false} strokeColor="#0066ff" />
            <Button type="primary" icon={<EditOutlined />} onClick={() => document.getElementById('medical-form')?.scrollIntoView({ behavior: 'smooth' })}>
              {summary.profile ? 'Update profile' : 'Complete profile'}
            </Button>
          </Col>
        </Row>
      </Card>

      {summary.loading ? <Skeleton active paragraph={{ rows: 3 }} /> : (
        <Row gutter={[14, 14]} className="member-overview-grid">
          {overviewCards.map((item) => (
            <Col xs={12} md={6} key={item.key}>
              <Card hoverable onClick={item.action} className="member-stat-card">
                <span className="member-stat-icon">{item.icon}</span>
                <Text>{item.label}</Text>
                <Title level={4}>{item.value}</Title>
                <Text type="secondary">{item.detail}</Text>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      <EmergencyAlertSummary />
      <Card id="medical-form" className="care-section-card member-content-card" title={<Space><SafetyCertificateOutlined />Medical profile</Space>} extra={<Tag color="blue">Secure</Tag>}>
        <MedicalForm onSubmissionSuccess={() => navigate('/profile')} />
      </Card>
      <section id="qr"><QRCodeDisplay /></section>
      <Card id="health-recommendations" className="care-section-card member-content-card" title={<Space><HeartOutlined />Health recommendations</Space>}>
        <Recommendations />
      </Card>
      <Card className="care-section-card member-help-card">
        <Flex align="center" justify="space-between" gap={16} wrap="wrap">
          <Space><FileProtectOutlined /><Text>Review your full profile, emergency ID card, and secure documents.</Text></Space>
          <Button onClick={() => navigate('/profile')}>Open profile</Button>
        </Flex>
      </Card>
    </main>
  );
};

export default Dashboard;
