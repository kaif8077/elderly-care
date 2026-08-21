import { useState } from 'react';
import { Alert, Button, Card, Typography } from 'antd';
import { useParams } from 'react-router-dom';
import api from '../services/api';

const EmergencyContactVerification = () => {
  const { token } = useParams();
  const [state, setState] = useState({ loading: false, message: '', error: false });
  const verify = async () => {
    setState({ loading: true, message: '', error: false });
    try {
      const { data } = await api.post(`/api/care/emergency-contact-verification/${token}`);
      setState({ loading: false, message: data.message, error: false });
    } catch (error) {
      setState({
        loading: false,
        message: error.response?.data?.message || 'Unable to verify contact',
        error: true
      });
    }
  };
  return (
    <main className="care-page">
      <Card style={{ maxWidth: 600, margin: '40px auto' }}>
        <Typography.Title level={2}>Emergency contact verification</Typography.Title>
        <Typography.Paragraph>
          Confirm only if you agreed to receive emergency notifications for this ElderlyCare member.
        </Typography.Paragraph>
        {state.message && (
          <Alert
            showIcon
            type={state.error ? 'error' : 'success'}
            message={state.message}
            style={{ marginBottom: 16 }}
          />
        )}
        <Button type="primary" loading={state.loading} onClick={verify}>
          Confirm emergency contact
        </Button>
      </Card>
    </main>
  );
};
export default EmergencyContactVerification;
