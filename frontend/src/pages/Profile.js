import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import {
  Avatar, Button, Card, Col, Collapse, Descriptions, Empty, Flex, Row,
  Skeleton, Space, Tag, Typography
} from 'antd';
import {
  ContactsOutlined, EnvironmentOutlined, FileProtectOutlined, HeartOutlined, IdcardOutlined,
  MailOutlined, MedicineBoxOutlined, PhoneOutlined, SafetyCertificateOutlined, UserOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-toastify';
import UserIdCard from '../components/UserIdCard';
import Recommendations from '../components/Recommendations';
import MedicalDocuments from '../components/MedicalDocuments';

const { Title, Text, Paragraph } = Typography;
const apiBase = (import.meta.env.VITE_BACKEND_URI || 'http://localhost:5000').replace(/\/+$/, '');
const show = (value) => Array.isArray(value) ? value.filter(Boolean).join(', ') || 'None reported' : value || 'Not provided';
const formatDate = (value) => value && !Number.isNaN(new Date(value).getTime()) ? new Date(value).toLocaleDateString() : 'Not provided';
const calculateAge = (dob) => {
  if (!dob) return null;
  const birth = new Date(dob);
  if (Number.isNaN(birth.getTime())) return null;
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  if (today < new Date(today.getFullYear(), birth.getMonth(), birth.getDate())) age -= 1;
  return age;
};

const Profile = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [qrCode, setQrCode] = useState('');
  const [loading, setLoading] = useState(true);
  const [photoUrl, setPhotoUrl] = useState('');
  const [showRecommendations, setShowRecommendations] = useState(true);

  const loadPhoto = useCallback(async (token) => {
    const response = await axios.get(`${apiBase}/api/medical/${user._id}/photo`, {
      headers: { Authorization: `Bearer ${token}` }, responseType: 'blob'
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
        const medical = await axios.get(`${apiBase}/api/medical/${user._id}`, { headers: { Authorization: `Bearer ${token}` } });
        if (!active) return;
        setProfile(medical.data);
        if (medical.data.profilePhoto) {
          try { await loadPhoto(token); } catch { /* The fallback avatar remains available. */ }
        }
        try {
          const qr = await axios.get(`${apiBase}/api/qr/${user._id}`, { headers: { Authorization: `Bearer ${token}` } });
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

  const primary = profile?.emergencyContacts?.[0] || {
    name: profile?.emergencyContact, phone: profile?.emergencyPhone, relationship: profile?.emergencyRelationship
  };
  const age = calculateAge(profile?.dob);

  const detailItems = useMemo(() => profile ? [
    {
      key: 'personal', label: <Space><UserOutlined />Personal information</Space>, children: (
        <Descriptions bordered size="small" column={{ xs: 1, md: 2 }} items={[
          ['Full name', profile.name], ['Date of birth', formatDate(profile.dob)], ['Gender', profile.gender],
          ['Blood group', profile.bloodGroup], ['Height', profile.height && `${profile.height} cm`],
          ['Weight', profile.weight && `${profile.weight} kg`], ['Preferred language', profile.preferredLanguage],
          ['Mobility status', profile.mobilityStatus], ['Diet preference', profile.dietPreference]
        ].map(([label, value]) => ({ key: label, label, children: show(value) }))} />
      )
    },
    {
      key: 'medical', label: <Space><MedicineBoxOutlined />Medical details</Space>, children: (
        <Descriptions bordered size="small" column={{ xs: 1, md: 2 }} items={[
          ['Known conditions', profile.medicalHistory], ['Allergies', profile.allergies],
          ['Current medications', profile.medications], ['Current symptoms', profile.currentSymptoms],
          ['Fall risk', profile.fallRisk ? 'Yes' : 'No'], ['Treating doctor', profile.doctorName],
          ['Doctor phone', profile.doctorPhone], ['Preferred hospital', profile.preferredHospital]
        ].map(([label, value]) => ({ key: label, label, children: show(value) }))} />
      )
    },
    {
      key: 'insurance', label: <Space><SafetyCertificateOutlined />Insurance information</Space>, children: (
        <Descriptions bordered size="small" column={{ xs: 1, md: 2 }} items={[
          { key: 'status', label: 'Insurance status', children: profile.hasInsurance ? 'Active' : 'Not active' },
          { key: 'provider', label: 'Provider', children: show(profile.hasInsurance && profile.insuranceProvider) },
          { key: 'policy', label: 'Policy number', children: show(profile.hasInsurance && profile.policyNumber) }
        ]} />
      )
    }
  ] : [], [profile]);

  if (loading) return <main className="care-page"><Skeleton active avatar paragraph={{ rows: 10 }} /></main>;
  if (!profile) return <main className="care-page"><Empty description="No medical profile found"><Button type="primary" onClick={() => navigate('/dashboard')}>Create medical profile</Button></Empty></main>;

  return (
    <main className="care-page">
      <Row gutter={[20, 20]} align="stretch">
        <Col xs={24} lg={7}>
          <Card style={{ height: '100%' }}>
            <Flex vertical align="center" gap={8} style={{ textAlign: 'center' }}>
              <Avatar size={116} src={photoUrl} icon={<UserOutlined />} style={{ border: '4px solid #edf3ff', background: '#0066ff' }} />
              <Title level={3} style={{ margin: '6px 0 0' }}>{profile.name}</Title>
              <Text type="secondary">{age !== null ? `Age: ${age}` : `DOB: ${formatDate(profile.dob)}`} · {show(profile.gender)}</Text>
              <Space wrap style={{ justifyContent: 'center' }}><Tag color="blue">Active profile</Tag><Tag>{profile.elderlyCareId || 'ElderlyCare member'}</Tag></Space>
            </Flex>
            <Card size="small" title={<Space><ContactsOutlined />Contact information</Space>} style={{ marginTop: 20 }}>
              <Descriptions size="small" column={1} colon={false} items={[
                { key: 'phone', label: <PhoneOutlined />, children: show(profile.phone) },
                { key: 'email', label: <MailOutlined />, children: show(user?.email) },
                { key: 'address', label: <EnvironmentOutlined />, children: show(profile.address) }
              ]} />
            </Card>
          </Card>
        </Col>

        <Col xs={24} lg={9}>
          <Space direction="vertical" size={20} style={{ width: '100%', height: '100%' }}>
            <Card title={<Space><HeartOutlined />Health information</Space>} style={{ width: '100%' }}>
              <Descriptions size="small" column={1} items={[
                { key: 'blood', label: 'Blood group', children: <Text strong>{show(profile.bloodGroup)}</Text> },
                { key: 'conditions', label: 'Medical conditions', children: show(profile.medicalHistory) },
                { key: 'allergies', label: 'Allergies', children: show(profile.allergies) },
                { key: 'medicines', label: 'Current medications', children: show(profile.medications) }
              ]} />
            </Card>
            <Card title={<Space><PhoneOutlined />Emergency contact</Space>} style={{ width: '100%', flex: 1 }}>
              <Descriptions size="small" column={1} items={[
                { key: 'name', label: 'Name', children: show(primary?.name) },
                { key: 'relation', label: 'Relationship', children: show(primary?.relationship) },
                { key: 'phone', label: 'Phone number', children: primary?.phone ? <a href={`tel:${primary.phone}`}>{primary.phone}</a> : 'Not provided' }
              ]} />
            </Card>
          </Space>
        </Col>

        <Col xs={24} lg={8}>
          <Space direction="vertical" size={20} style={{ width: '100%' }}>
            <Card title={<Space><FileProtectOutlined />Profile resources</Space>}>
              <Paragraph type="secondary">Open your secure documents, emergency card, or personalized health guidance.</Paragraph>
              <Space direction="vertical" style={{ width: '100%' }}>
                <Button block icon={<FileProtectOutlined />} href="#medical-documents">Medical documents</Button>
                <Button block icon={<IdcardOutlined />} href="#emergency-id-card">Emergency ID card</Button>
                <Button block icon={<HeartOutlined />} href="#health-recommendations">Health recommendations</Button>
              </Space>
            </Card>
            <Button type="primary" size="large" block onClick={() => navigate('/dashboard#medical-form')}>Edit profile</Button>
          </Space>
        </Col>
      </Row>

      <Card className="care-section-card" title="Complete profile details">
        <Collapse items={detailItems} />
      </Card>

      <Card id="health-recommendations" className="care-section-card" title={<Space><MedicineBoxOutlined />Health recommendations</Space>} extra={<Button onClick={() => setShowRecommendations((current) => !current)}>{showRecommendations ? 'Hide recommendations' : 'Show recommendations'}</Button>}>
        {showRecommendations ? <Recommendations /> : <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Recommendations are hidden." />}
      </Card>

      <Card id="emergency-id-card" className="care-section-card" title={<Space><IdcardOutlined />Emergency ID card</Space>}>
        <UserIdCard profile={profile} qrCode={qrCode} photoUrl={photoUrl} />
      </Card>

      <section id="medical-documents"><MedicalDocuments /></section>
    </main>
  );
};

export default Profile;
