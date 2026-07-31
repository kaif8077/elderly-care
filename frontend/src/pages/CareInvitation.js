import { useState } from 'react';
import { Alert, Button, Card, Typography } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../services/api';

const CareInvitation = () => {
  const { token } = useParams(); const navigate = useNavigate();
  const [state, setState] = useState({ loading: false, message: '', error: false });
  const accept = async () => { setState({ loading: true, message: '', error: false }); try { const { data } = await api.post(`/api/care/care-team/invitations/${token}/accept`); setState({ loading: false, message: data.message, error: false }); } catch (error) { setState({ loading: false, message: error.response?.data?.message || 'Unable to accept invitation', error: true }); } };
  return <main className="care-page"><Card style={{ maxWidth: 600, margin: '40px auto' }}><Typography.Title level={2}>Care-team invitation</Typography.Title><Typography.Paragraph>Accept only if you recognize the ElderlyCare member who invited you. Your access is limited to the assigned permissions.</Typography.Paragraph>{state.message && <Alert type={state.error ? 'error' : 'success'} showIcon message={state.message} style={{ marginBottom: 16 }} />}<Button type="primary" loading={state.loading} onClick={accept}>Accept invitation</Button> <Button onClick={() => navigate('/profile')}>Open profile</Button></Card></main>;
};
export default CareInvitation;
