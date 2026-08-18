import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Alert, Avatar, Button, Card, Descriptions, Divider, Flex, Modal, Progress,
  Space, Tag, Typography, message
} from 'antd';
import {
  AlertOutlined, CheckCircleFilled, LockOutlined, PhoneOutlined, SendOutlined
} from '@ant-design/icons';
import api from '../services/api';
import './EmergencyProfile.css';

const { Title, Paragraph, Text } = Typography;
const readableList = (items, empty = 'None reported') => Array.isArray(items) && items.length ? items.join(', ') : empty;

const EmergencyProfile = () => {
  const { token } = useParams();
  const [profile, setProfile] = useState(null);
  const [state, setState] = useState({ loading: true, error: '' });
  const [helpOpen, setHelpOpen] = useState(false);
  const [guidanceOpen, setGuidanceOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const [photoUrl, setPhotoUrl] = useState('');
  const [locationState, setLocationState] = useState({ loading: false, location: null, error: '' });
  const primary = profile?.emergencyContacts?.[0];
  const secondary = profile?.emergencyContacts?.[1];

  useEffect(() => {
    let active = true;
    api.get(`/api/qr/public/${encodeURIComponent(token)}`)
      .then(({ data }) => { if (active) { setProfile(data.emergencyProfile); setState({ loading: false, error: '' }); } })
      .catch((error) => { if (active) setState({ loading: false, error: error.response?.data?.message || error.message || 'Unable to open this emergency profile.' }); });
    return () => { active = false; };
  }, [token]);

  useEffect(() => {
    let active = true;
    let objectUrl = '';
    api.get(`/api/qr/public/${encodeURIComponent(token)}/photo`, { responseType: 'blob' })
      .then(({ data }) => {
        if (!active || !data?.size) return;
        objectUrl = URL.createObjectURL(data);
        setPhotoUrl(objectUrl);
      })
      .catch(() => { if (active) setPhotoUrl(''); });
    return () => {
      active = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [token]);

  const requestLocation = () => {
    if (!navigator.geolocation) {
      setLocationState({ loading: false, location: null, error: 'Location is not supported on this device.' });
      return;
    }
    setLocationState({ loading: true, location: null, error: '' });
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => setLocationState({ loading: false, location: { latitude: coords.latitude, longitude: coords.longitude, accuracy: coords.accuracy }, error: '' }),
      () => setLocationState({ loading: false, location: null, error: 'Location permission was unavailable. You can still send the alert without location.' }),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 }
    );
  };

  const openEmergencyHelp = () => {
    setHelpOpen(true);
    requestLocation();
  };

  const sendEmergencyAlert = async () => {
    setSending(true);
    try {
      const { data } = await api.post(`/api/emergency-alerts/public/${encodeURIComponent(token)}`, {
        emergencyType: 'medical_emergency',
        ...(locationState.location ? {
          latitude: locationState.location.latitude,
          longitude: locationState.location.longitude,
          locationAccuracy: locationState.location.accuracy
        } : {})
      });
      message.success(data.message);
      setHelpOpen(false);
    } catch (error) {
      message.error(error.response?.data?.message || 'Unable to send the alert. Call the emergency contact directly.');
    } finally {
      setSending(false);
    }
  };

  const emergencyDetails = useMemo(() => [
    { key: 'blood', label: 'Blood group', children: <Text strong>{profile?.bloodGroup || 'Unknown'}</Text> },
    { key: 'conditions', label: 'Known conditions', children: readableList(profile?.majorConditions) },
    { key: 'allergies', label: 'Allergies', children: readableList(profile?.severeAllergies) },
    { key: 'medications', label: 'Critical medications', children: readableList(profile?.criticalMedications) },
    ...(profile?.mobilityStatus ? [{ key: 'mobility', label: 'Mobility needs', children: profile.mobilityStatus.replaceAll('_', ' ') }] : []),
    ...(profile?.preferredLanguage?.length ? [{ key: 'language', label: 'Preferred language', children: readableList(profile.preferredLanguage) }] : [])
  ], [profile]);

  if (state.loading) return (
    <main className="emergency-shell emergency-fetching-shell">
      <Card className="emergency-loading">
        <Flex vertical align="center" gap={18}>
          <div className="emergency-lock" aria-hidden="true"><LockOutlined /></div>
          <div className="emergency-fetching-copy">
            <Text strong>Fetching Data</Text>
            <Text type="secondary">Retrieving secure information…</Text>
          </div>
          <Progress percent={75} showInfo strokeColor="#238636" trailColor="#e7ebf0" />
        </Flex>
      </Card>
    </main>
  );
  if (state.error) return <main className="emergency-shell"><Alert type="error" showIcon message="Emergency profile unavailable" description={state.error} /></main>;

  return (
    <main className="emergency-shell">
      <section className="emergency-mobile-panel" aria-labelledby="emergency-profile-title">
        <Flex vertical align="center" gap={4} className="emergency-page-heading">
          <Title id="emergency-profile-title" level={2}>Emergency Profile</Title>
        </Flex>

        <Card className="emergency-profile-card" styles={{ body: { padding: 0 } }}>
          <Flex align="center" gap={16} className="emergency-person">
            <Avatar size={86} src={photoUrl || undefined}>{profile.name?.charAt(0)}</Avatar>
            <div>
              <Title level={3}>{profile.name}</Title>
              <Paragraph>{profile.approximateAge !== null ? `${profile.approximateAge} years` : 'Age hidden'} · {readableList(profile.preferredLanguage, 'Language not specified')}</Paragraph>
              <Tag icon={<CheckCircleFilled />} color="success">Verified</Tag>
            </div>
          </Flex>
          <Descriptions bordered size="small" column={1} items={emergencyDetails} className="emergency-medical-details" />
        </Card>

        <Card title="Emergency contacts" className="emergency-contact-card">
          {[primary, secondary].filter(Boolean).map((contact, index) => (
            <Flex key={`${contact.phone}-${index}`} align="center" justify="space-between" gap={12} className="emergency-contact-row">
              <div><Text strong>{contact.name || `Contact ${index + 1}`}</Text><br /><Text type="secondary">{contact.relationship || 'Emergency contact'} · {contact.phone}</Text></div>
              <Button type={index === 0 ? 'primary' : 'default'} href={`tel:${contact.phone}`}>Call <PhoneOutlined /></Button>
            </Flex>
          ))}
          {!primary && <Text type="secondary">No emergency contact is available.</Text>}
        </Card>

        <Space direction="vertical" size={12} className="emergency-primary-actions">
          <Button danger type="primary" size="large" block icon={<AlertOutlined />} onClick={openEmergencyHelp}>Emergency Help</Button>
          <Button size="large" block onClick={() => setGuidanceOpen(true)}>Generate First Aid & Medication Guidance</Button>
        </Space>
      </section>

      <Modal title="Send emergency help alert" open={helpOpen} onCancel={() => setHelpOpen(false)} footer={null} destroyOnHidden>
        <Button type="primary" danger size="large" block icon={<SendOutlined />} loading={sending || locationState.loading} onClick={sendEmergencyAlert}>Send Emergency Email Alert</Button>
      </Modal>

      <Modal title="First Aid & Medication Safety" open={guidanceOpen} onCancel={() => setGuidanceOpen(false)} footer={<Button type="primary" onClick={() => setGuidanceOpen(false)}>Close</Button>}>
        <Divider orientation="left">Immediate safety steps</Divider>
        <Space direction="vertical" size={10}>
          <Text>Check that the scene is safe, check responsiveness and breathing, and call the local emergency number for any immediate danger.</Text>
          <Text>Put the emergency dispatcher on speaker and follow their instructions. Provide care only within your training.</Text>
          <Text>Keep the person still and comfortable. Do not move them if a head, neck, back, or serious fall injury is suspected unless the area is unsafe.</Text>
        </Space>
        <Divider orientation="left">Medication safety</Divider>
        <Card size="small"><Text strong>Recorded conditions:</Text><Paragraph>{readableList(profile.majorConditions)}</Paragraph><Text strong>Recorded critical medications:</Text><Paragraph>{readableList(profile.criticalMedications)}</Paragraph><Text strong>Recorded allergies:</Text><Paragraph>{readableList(profile.severeAllergies)}</Paragraph></Card>
      </Modal>
    </main>
  );
};

export default EmergencyProfile;
