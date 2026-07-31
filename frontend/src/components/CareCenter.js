import { useCallback, useEffect, useState } from 'react';
import {
  Alert, Button, Card, Checkbox, Col, DatePicker, Empty, Form, Input, List, Modal,
  Progress, Row, Select, Space, Switch, Tabs, Tag, Typography, message
} from 'antd';
import { BellOutlined, SafetyCertificateOutlined, TeamOutlined } from '@ant-design/icons';
import api from '../services/api';

const { Paragraph, Text, Title } = Typography;
const privacyFields = [
  ['name', 'Name'], ['approximateAge', 'Approximate age'], ['bloodGroup', 'Blood group'],
  ['allergies', 'Severe allergies'], ['medicalHistory', 'Major conditions'], ['medications', 'Critical medications'],
  ['mobilityStatus', 'Mobility needs'], ['preferredLanguage', 'Preferred language'],
  ['phone', 'Personal phone'], ['address', 'Residential address'], ['insurance', 'Insurance']
];
const privacyLevels = [
  { value: 'public_emergency', label: 'Public emergency' },
  { value: 'emergency_contacts', label: 'Emergency contacts only' },
  { value: 'owner_only', label: 'Account owner only' },
  { value: 'hidden', label: 'Hidden' }
];
const errorMessage = (error, fallback) => error.response?.data?.message || error.message || fallback;

const CareCenter = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [privacyForm] = Form.useForm();
  const [inviteForm] = Form.useForm();
  const [reminderForm] = Form.useForm();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get('/api/care/overview');
      setData(response.data);
      privacyForm.setFieldsValue({ visibility: response.data.privacy, consent: response.data.consent, preferences: response.data.preferences });
    } catch (error) {
      message.error(error.response?.data?.message || 'Unable to load care settings.');
    } finally { setLoading(false); }
  }, [privacyForm]);
  useEffect(() => { load(); }, [load]);

  const savePrivacy = async (values) => {
    try {
      await Promise.all([
        api.patch('/api/care/privacy', { visibility: values.visibility, consent: values.consent }),
        api.patch('/api/care/notification-preferences', values.preferences || {})
      ]);
      message.success('Privacy and notification settings saved.');
      load();
    } catch (error) { message.error(errorMessage(error, 'Unable to save privacy settings.')); }
  };
  const invite = async (values) => {
    try {
      await api.post('/api/care/care-team/invitations', values);
      inviteForm.resetFields(); message.success('Care-team invitation sent.'); load();
    } catch (error) { message.error(errorMessage(error, 'Unable to send invitation.')); }
  };
  const addReminder = async (values) => {
    try {
      await api.post('/api/care/reminders', { ...values, scheduledFor: values.scheduledFor.toISOString() });
      reminderForm.resetFields(); message.success('Reminder created.'); load();
    } catch (error) { message.error(errorMessage(error, 'Unable to create reminder.')); }
  };
  const completeReminder = async (id) => { try { await api.patch(`/api/care/reminders/${id}`, { status: 'completed' }); load(); } catch (error) { message.error(errorMessage(error, 'Unable to update reminder.')); } };
  const verifyContact = async (id) => { try { const { data: response } = await api.post(`/api/care/emergency-contacts/${id}/verify`); message.success(response.message); load(); } catch (error) { message.error(errorMessage(error, 'Unable to send verification.')); } };
  const revokeMember = (id) => Modal.confirm({ title: 'Revoke care-team access?', content: 'This member will no longer have delegated access.', okText: 'Revoke', okButtonProps: { danger: true }, onOk: async () => { try { await api.delete(`/api/care/care-team/${id}`); load(); } catch (error) { message.error(errorMessage(error, 'Unable to revoke access.')); } } });

  if (loading || !data) return <Card loading />;
  const tabItems = [
    { key: 'readiness', label: 'Readiness', children: <Space direction="vertical" style={{ width: '100%' }}>
      <Title level={4}>Emergency readiness</Title><Progress percent={data.completion.percent} strokeColor="#0066ff" />
      {data.completion.missing.length ? <Alert showIcon type="warning" message="Complete these required items" description={data.completion.missing.join(', ')} /> : <Alert showIcon type="success" message="Your emergency profile is complete" />}
      <Paragraph type="secondary">Review medical details and emergency contacts regularly. Generate a new QR after replacing a lost card.</Paragraph>
      <Title level={5}>Emergency contact verification</Title>
      <List dataSource={data.emergencyContacts} locale={{ emptyText: <Empty description="Add an emergency contact in the dashboard" /> }} renderItem={(contact) => <List.Item actions={contact.email && contact.verificationStatus !== 'verified' ? [<Button key="verify" type="link" onClick={() => verifyContact(contact.id)}>Send verification</Button>] : []}><List.Item.Meta title={`${contact.name} · ${contact.relationship || 'Contact'}`} description={<Space wrap><Text>{contact.phone}</Text><Tag color={contact.verificationStatus === 'verified' ? 'blue' : 'orange'}>{contact.verificationStatus}</Tag></Space>} /></List.Item>} />
    </Space> },
    { key: 'privacy', label: 'Privacy', children: <Form form={privacyForm} layout="vertical" onFinish={savePrivacy}>
      <Alert showIcon type="info" message="The backend enforces these choices on the public QR page." style={{ marginBottom: 16 }} />
      <Row gutter={[14, 0]}>{privacyFields.map(([field, label]) => <Col xs={24} md={12} key={field}><Form.Item name={['visibility', field]} label={label}><Select options={privacyLevels} /></Form.Item></Col>)}</Row>
      <Title level={5}>Consent</Title>
      <Form.Item name={['consent', 'emergencySharing']} valuePropName="checked"><Checkbox>Allow the public emergency QR view</Checkbox></Form.Item>
      <Form.Item name={['consent', 'recommendationGeneration']} valuePropName="checked"><Checkbox>Allow profile-based recommendation generation</Checkbox></Form.Item>
      <Form.Item name={['consent', 'qrAccessLogging']} valuePropName="checked"><Checkbox>Keep privacy-safe QR access history</Checkbox></Form.Item>
      <Title level={5}>Notifications</Title>
      <Space wrap>{['email', 'push', 'telegram', 'emergencyAlerts', 'reminders', 'profileReview'].map((field) => <Form.Item key={field} name={['preferences', field]} valuePropName="checked" label={field.replace(/([A-Z])/g, ' $1')}><Switch /></Form.Item>)}</Space>
      <Button type="primary" htmlType="submit" icon={<SafetyCertificateOutlined />}>Save privacy settings</Button>
    </Form> },
    { key: 'team', label: 'Care team', children: <>
      <Form form={inviteForm} layout="vertical" onFinish={invite}><Row gutter={12}><Col xs={24} md={8}><Form.Item name="email" label="Email" rules={[{ required: true }, { type: 'email' }]}><Input placeholder="caregiver@example.com" /></Form.Item></Col><Col xs={24} md={6}><Form.Item name="role" label="Role" rules={[{ required: true }]}><Select options={['guardian', 'caregiver', 'doctor'].map((value) => ({ value, label: value }))} /></Form.Item></Col><Col xs={24} md={10}><Form.Item name="permissions" label="Permissions"><Select mode="multiple" options={['profile.read', 'profile.update', 'alerts.receive', 'reminders.manage'].map((value) => ({ value, label: value }))} /></Form.Item></Col></Row><Button type="primary" htmlType="submit" icon={<TeamOutlined />}>Invite member</Button></Form>
      <List style={{ marginTop: 18 }} dataSource={data.careTeam} locale={{ emptyText: <Empty description="No care-team members invited" /> }} renderItem={(item) => <List.Item actions={[<Button key="revoke" danger type="link" onClick={() => revokeMember(item._id)}>Revoke</Button>]}><List.Item.Meta title={item.invitedEmail} description={<Space><Tag>{item.role}</Tag><Tag color={item.status === 'active' ? 'blue' : 'orange'}>{item.status}</Tag></Space>} /></List.Item>} />
    </> },
    { key: 'reminders', label: 'Reminders', children: <>
      <Form form={reminderForm} layout="vertical" onFinish={addReminder}><Row gutter={12}><Col xs={24} md={6}><Form.Item name="type" label="Type" rules={[{ required: true }]}><Select options={['medication', 'appointment', 'profile_review', 'insurance_expiry', 'contact_verification'].map((value) => ({ value, label: value.replaceAll('_', ' ') }))} /></Form.Item></Col><Col xs={24} md={8}><Form.Item name="title" label="Reminder" rules={[{ required: true }]}><Input placeholder="Enter reminder title" /></Form.Item></Col><Col xs={24} md={6}><Form.Item name="scheduledFor" label="Date and time" rules={[{ required: true }]}><DatePicker showTime style={{ width: '100%' }} /></Form.Item></Col><Col xs={24} md={4}><Form.Item name="recurrence" label="Repeat" initialValue="none"><Select options={['none', 'daily', 'weekly', 'monthly', 'yearly'].map((value) => ({ value, label: value }))} /></Form.Item></Col></Row><Button type="primary" htmlType="submit" icon={<BellOutlined />}>Add reminder</Button></Form>
      <List style={{ marginTop: 18 }} dataSource={data.reminders} locale={{ emptyText: <Empty description="No active reminders" /> }} renderItem={(item) => <List.Item actions={[<Button key="complete" type="link" onClick={() => completeReminder(item._id)}>Complete</Button>]}><List.Item.Meta title={item.title} description={`${new Date(item.scheduledFor).toLocaleString()} · ${item.recurrence}`} /></List.Item>} />
    </> },
    { key: 'history', label: 'QR history', children: <List dataSource={data.qrHistory} locale={{ emptyText: <Empty description="No QR activity recorded" /> }} renderItem={(item) => <List.Item><Text>{item.event.replaceAll('_', ' ')}</Text><Text type="secondary">{new Date(item.occurredAt).toLocaleString()}</Text></List.Item>} /> }
  ];
  return <Card className="care-section-card" title="Care, privacy and reminders"><Tabs items={tabItems} /></Card>;
};

export default CareCenter;
