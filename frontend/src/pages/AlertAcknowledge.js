import { useState } from 'react';
import { Alert, Button, Card, Select, Space, Typography } from 'antd';
import { useParams } from 'react-router-dom';
import api from '../services/api';

const AlertAcknowledge = () => {
  const { token } = useParams(); const [action, setAction] = useState(); const [state, setState] = useState({ loading: false, message: '', error: false });
  const submit = async () => { setState({ loading: true, message: '', error: false }); try { const { data } = await api.patch(`/api/emergency-alerts/acknowledge/${token}`, { action }); setState({ loading: false, message: data.message, error: false }); } catch (error) { setState({ loading: false, message: error.response?.data?.message || 'Unable to acknowledge alert', error: true }); } };
  return <main className="care-page"><Card style={{ maxWidth: 620, margin: '40px auto' }}><Space direction="vertical" size={18} style={{ width: '100%' }}><Typography.Title level={2}>Emergency alert acknowledgement</Typography.Title><Typography.Paragraph>Select the action you are taking so the care team knows the alert was received.</Typography.Paragraph>{state.message && <Alert showIcon type={state.error ? 'error' : 'success'} message={state.message} />}<Select value={action} onChange={setAction} placeholder="Choose an action" options={[['received', 'I received the alert'], ['calling', 'I am calling the person'], ['going_to_location', 'I am going to the location'], ['services_contacted', 'Emergency services contacted'], ['resolved', 'Alert resolved']].map(([value, label]) => ({ value, label }))} /><Button type="primary" disabled={!action} loading={state.loading} onClick={submit}>Save acknowledgement</Button></Space></Card></main>;
};
export default AlertAcknowledge;
