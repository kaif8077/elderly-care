import React, { useContext, useEffect, useState } from 'react';
import { Alert, Button, Card, Form, Input, Typography } from 'antd';
import { LockOutlined, MailOutlined } from '@ant-design/icons';
import { useLocation, useNavigate } from 'react-router-dom';
import { AdminAuthContext } from '../context/AdminAuthContext';
import AuthShowcase from '../../components/AuthShowcase';
import logo from '../../assests/logo.png';

const { Title, Text } = Typography;

const AdminLogin = () => {
  const { admin, login, sessionMessage } = useContext(AdminAuthContext);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  useEffect(() => { if (admin) navigate('/admin/dashboard', { replace: true }); }, [admin, navigate]);
  const submit = async (values) => {
    setError(''); setLoading(true);
    try { await login(values); navigate(location.state?.from?.startsWith('/admin/') ? location.state.from : '/admin/dashboard', { replace: true }); }
    catch (requestError) { setError(requestError.response?.data?.message || 'Unable to log in. Please try again.'); }
    finally { setLoading(false); }
  };
  return (
    <main className="care-auth-page">
      <AuthShowcase admin />
      <Card className="care-auth-card" styles={{ body: { padding: 34 } }}>
        <div className="care-auth-brand"><span className="care-auth-logo"><img src={logo} alt="ElderlyCare logo" /></span><div><Text className="care-eyebrow">ELDERLYCARE ADMINISTRATION</Text><br /><Text type="secondary">Restricted management workspace</Text></div></div>
        <Title level={2}>Admin sign in</Title><Text type="secondary">Use an authorized administrator account to continue.</Text>
        {(error || sessionMessage) && <Alert type="error" showIcon message={error || sessionMessage} style={{ marginTop: 20 }} />}
        <Form layout="vertical" onFinish={submit} style={{ marginTop: 24 }}>
          <Form.Item name="email" label="Email address" rules={[{ required: true }, { type: 'email' }]}><Input size="middle" prefix={<MailOutlined />} placeholder="Enter your admin email" autoComplete="username" /></Form.Item>
          <Form.Item name="password" label="Password" rules={[{ required: true }]}><Input.Password size="middle" prefix={<LockOutlined />} placeholder="Enter your password" autoComplete="current-password" /></Form.Item>
          <Button type="primary" block htmlType="submit" loading={loading}>Sign in securely</Button>
        </Form>
        <Button type="link" block onClick={() => navigate('/')}>Return to ElderlyCare</Button>
      </Card>
    </main>
  );
};
export default AdminLogin;
