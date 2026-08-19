import React, { useContext, useEffect, useMemo, useState } from 'react';
import { Button, Card, Col, Flex, Progress, Row, Skeleton, Typography } from 'antd';
import {
  ContactsOutlined, EditOutlined, MedicineBoxOutlined, ProfileOutlined, QrcodeOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
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
    { key: 'profile', icon: <ProfileOutlined />, label: 'Health profile', value: `${completion}%`, detail: 'complete', action: () => navigate('/medical-profile') },
    { key: 'contacts', icon: <ContactsOutlined />, label: 'Emergency contacts', value: summary.profile?.emergencyContacts?.length || 0, detail: 'saved', action: () => navigate('/profile') },
    { key: 'medical', icon: <MedicineBoxOutlined />, label: 'Medical details', value: summary.profile?.medicalHistory?.length || 0, detail: 'conditions', action: () => navigate('/profile') },
    { key: 'qr', icon: <QrcodeOutlined />, label: 'Emergency ID', value: summary.qrReady ? 'Active' : 'Pending', detail: summary.qrReady ? 'ready to scan' : 'ready to generate', action: () => navigate('/emergency') }
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
            <Button type="primary" icon={<EditOutlined />} onClick={() => navigate('/medical-profile')}>
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
    </main>
  );
};

export default Dashboard;
