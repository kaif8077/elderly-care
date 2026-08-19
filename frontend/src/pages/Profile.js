import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import {
  Avatar, Button, Card, Col, Collapse, Descriptions, Flex, Row, Skeleton,
  Space, Tag, Typography
} from 'antd';
import {
  EditOutlined, MedicineBoxOutlined, SafetyCertificateOutlined, UserOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-toastify';

const { Title, Text } = Typography;
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
  const [loading, setLoading] = useState(true);
  const [photoUrl, setPhotoUrl] = useState('');

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
    <main className="care-page member-profile-page">
      <Flex align="center" justify="space-between" gap={16} wrap="wrap" className="member-page-title">
        <div><Title level={2}>My Profile</Title><Text type="secondary">Review your health and emergency information.</Text></div>
      </Flex>

      <Card className="member-profile-header">
        <Row gutter={[24, 20]} align="middle">
          <Col xs={24} md={7}>
            <Flex vertical align="center" gap={8} className="member-profile-identity">
              <div className="member-profile-photo-edit">
                <Avatar size={128} src={photoUrl} icon={<UserOutlined />} />
                <Button type="primary" shape="circle" icon={<EditOutlined />} aria-label="Edit profile photograph" onClick={() => navigate('/medical-profile')} />
              </div>
              <Title level={3}>{profile.name}</Title>
              <Text type="secondary">{age !== null ? `Age: ${age}` : `DOB: ${formatDate(profile.dob)}`} · {show(profile.gender)}</Text>
            </Flex>
          </Col>
          <Col xs={24} md={17}>
            <Descriptions className="member-profile-summary" size="small" column={{ xs: 1, sm: 2 }} items={[
              { key: 'member', label: 'ElderlyCare ID', children: show(profile.elderlyCareId) },
              { key: 'blood', label: 'Blood group', children: <Tag color="orange">{show(profile.bloodGroup)}</Tag> },
              { key: 'phone', label: 'Phone', children: show(profile.phone) },
              { key: 'email', label: 'Email', children: show(user?.email) },
              { key: 'address', label: 'Residential address', span: 2, children: show(profile.address) }
            ]} />
          </Col>
        </Row>
      </Card>

      <Row gutter={[18, 18]} align="stretch" className="member-profile-grid">
        <Col xs={24} lg={16}>
          <Card title="Complete profile details" className="member-panel-card">
            <Collapse items={detailItems} ghost />
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Space direction="vertical" size={18} style={{ width: '100%' }}>
            <Card title="Health information" className="member-panel-card">
              <Descriptions size="small" column={1} items={[
                { key: 'conditions', label: 'Medical conditions', children: show(profile.medicalHistory) },
                { key: 'allergies', label: 'Allergies', children: show(profile.allergies) },
                { key: 'medicines', label: 'Current medications', children: show(profile.medications) }
              ]} />
            </Card>
            <Card title="Emergency contact" className="member-panel-card">
              <Descriptions size="small" column={1} items={[
                { key: 'name', label: 'Name', children: show(primary?.name) },
                { key: 'relation', label: 'Relationship', children: show(primary?.relationship) },
                { key: 'phone', label: 'Phone', children: primary?.phone ? <a href={`tel:${primary.phone}`}>{primary.phone}</a> : 'Not provided' }
              ]} />
            </Card>
          </Space>
        </Col>
      </Row>
    </main>
  );
};

export default Profile;
