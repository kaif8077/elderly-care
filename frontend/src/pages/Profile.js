import React, { useCallback, useContext, useEffect, useState } from 'react';
import axios from 'axios';
import {
  Alert, Avatar, Button, Card, Col, Descriptions, Empty, Row,
  Skeleton, Space, Switch, Tag, Typography
} from 'antd';
import {
  EditOutlined, FileTextOutlined, IdcardOutlined, MedicineBoxOutlined,
  PhoneOutlined, SafetyCertificateOutlined, UserOutlined
} from '@ant-design/icons';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-toastify';
import UserIdCard from '../components/UserIdCard';
import Recommendations from '../components/Recommendations';

const { Title, Text } = Typography;
const apiBase = process.env.REACT_APP_BACKEND_URI || 'http://localhost:5000';
const show = (value) => Array.isArray(value)
  ? value.filter(Boolean).join(', ') || 'None reported'
  : value || 'Not provided';

const Profile = () => {
  const { user } = useContext(AuthContext);
  const [profile, setProfile] = useState(null);
  const [qrCode, setQrCode] = useState('');
  const [loading, setLoading] = useState(true);
  const [photoUrl, setPhotoUrl] = useState('');
  const [showReports, setShowReports] = useState(true);

  const loadPhoto = useCallback(async (token) => {
    const response = await axios.get(`${apiBase}/api/medical/${user._id}/photo`, {
      headers: { Authorization: `Bearer ${token}` },
      responseType: 'blob'
    });
    setPhotoUrl((old) => {
      if (old) URL.revokeObjectURL(old);
      return URL.createObjectURL(response.data);
    });
  }, [user]);

  useEffect(() => {
    if (!user) return undefined;
    let active = true;
    const load = async () => {
      const token = localStorage.getItem('token');
      try {
        const medical = await axios.get(`${apiBase}/api/medical/${user._id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!active) return;
        setProfile(medical.data);
        if (medical.data.profilePhoto) await loadPhoto(token);
        try {
          const qr = await axios.get(`${apiBase}/api/qr/${user._id}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (active) setQrCode(qr.data?.qrCode?.data || '');
        } catch (qrError) {
          if (qrError.response?.status !== 404) toast.error('Unable to load the emergency QR code.');
        }
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to load profile data.');
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => { active = false; };
  }, [user, loadPhoto]);

  if (loading) return <main className="care-page"><Skeleton active avatar paragraph={{ rows: 8 }} /></main>;
  if (!profile) {
    return (
      <main className="care-page">
        <Empty description="No medical profile found">
          <Button type="primary" href="/dashboard">Create medical profile</Button>
        </Empty>
      </main>
    );
  }

  const section = (title, icon, items) => (
    <Card className="care-section-card" title={<Space>{icon}{title}</Space>}>
      <Descriptions
        column={{ xs: 1, sm: 1, md: 2 }}
        bordered
        size="small"
        items={items.map(([label, value]) => ({
          key: label,
          label,
          children: <span className={!value ? 'care-empty-value' : ''}>{show(value)}</span>
        }))}
      />
    </Card>
  );

  return (
    <main className="care-page">
      <Card className="care-profile-hero" styles={{ body: { padding: 26 } }}>
        <Row align="middle" gutter={[20, 18]}>
          <Col><Avatar size={88} src={photoUrl} icon={<UserOutlined />} className="care-profile-photo" /></Col>
          <Col flex="auto">
            <Text className="care-eyebrow" style={{ color: '#fff' }}>MY ELDERLYCARE PROFILE</Text>
            <Title level={2} style={{ margin: '5px 0' }}>{profile.name}</Title>
            <Space wrap><Tag color="blue">Active profile</Tag><Tag>{profile.bloodGroup || 'Blood group unknown'}</Tag></Space>
          </Col>
          <Col><Button href="/dashboard#medical-form" icon={<EditOutlined />}>Edit on dashboard</Button></Col>
        </Row>
      </Card>

      <Alert
        style={{ marginTop: 18 }}
        type="info"
        showIcon
        message="Profile photograph"
        description="Photograph upload and replacement are available only inside the Personal Information step on your dashboard."
      />

      {section('Personal information', <UserOutlined />, [
        ['Full name', profile.name], ['Date of birth', profile.dob], ['Gender', profile.gender],
        ['Blood group', profile.bloodGroup], ['Height', profile.height && `${profile.height} cm`],
        ['Weight', profile.weight && `${profile.weight} kg`], ['Preferred language', profile.preferredLanguage],
        ['Mobility status', profile.mobilityStatus], ['Diet preference', profile.dietPreference]
      ])}
      {section('Contact and emergency', <PhoneOutlined />, [
        ['Phone number', profile.phone], ['Residential address', profile.address],
        ['Emergency contact', profile.emergencyContact], ['Emergency phone', profile.emergencyPhone]
      ])}
      {section('Medical information', <MedicineBoxOutlined />, [
        ['Known conditions', profile.medicalHistory], ['Allergies', profile.allergies],
        ['Current medications', profile.medications], ['Current symptoms', profile.currentSymptoms],
        ['Fall risk', profile.fallRisk ? 'Yes' : 'No'], ['Treating doctor', profile.doctorName],
        ['Doctor phone', profile.doctorPhone], ['Preferred hospital', profile.preferredHospital]
      ])}
      {section('Insurance information', <SafetyCertificateOutlined />, [
        ['Insurance status', profile.hasInsurance ? 'Active' : 'Not active'],
        ['Provider', profile.hasInsurance && profile.insuranceProvider],
        ['Policy number', profile.hasInsurance && profile.policyNumber]
      ])}

      <Card
        className="care-section-card"
        title={<Space><FileTextOutlined />Reports and recommendations</Space>}
        extra={<Space><Text>Show</Text><Switch checked={showReports} onChange={setShowReports} /></Space>}
      >
        {showReports
          ? <Recommendations />
          : <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Reports are hidden on this profile view." />}
      </Card>

      <Card className="care-section-card" title={<Space><IdcardOutlined />Emergency ID card</Space>}>
        <UserIdCard profile={profile} qrCode={qrCode} photoUrl={photoUrl} />
      </Card>
    </main>
  );
};

export default Profile;
