import React, { useContext, useState } from 'react';
import axios from 'axios';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Alert, Button, Card, Checkbox, Flex, Form, Input, Space, Typography } from 'antd';
import { LockOutlined, MailOutlined } from '@ant-design/icons';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-toastify';
import AuthShowcase from '../components/AuthShowcase';
import logo from '../assests/logo.png';

const { Title, Text } = Typography;
const apiBase = import.meta.env.VITE_BACKEND_URI || 'http://localhost:5000';

const Login = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const submit = async (values) => {
    setLoading(true);
    setError('');
    try {
      const { data } = await axios.post(`${apiBase}/api/auth/login`, values);
      localStorage.setItem('token', data.token);
      login(data.user);
      toast.success('Login successful');
      navigate(location.state?.from || '/dashboard', { replace: true });
    } catch (requestError) {
      const message = requestError.response?.data?.message || 'Login failed. Check your details and try again.';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="care-auth-page">
      <AuthShowcase />
      <Card className="care-auth-card" styles={{ body: { padding: 28 } }}>
        <div className="care-auth-brand">
          <span className="care-auth-logo"><img src={logo} alt="ElderlyCare logo" /></span>
          <div><Text className="care-eyebrow">ELDERLYCARE</Text><br /><Text type="secondary">Secure member access</Text></div>
        </div>
        <Title level={2}>Welcome back</Title>
        <Text type="secondary">Sign in with your email and password to manage emergency health information.</Text>
        {location.state?.message && <Alert style={{ marginTop: 18 }} type="success" showIcon message={location.state.message} />}
        {error && <Alert style={{ marginTop: 18 }} type="error" showIcon message={error} />}
        <Form layout="vertical" requiredMark={false} onFinish={submit} style={{ marginTop: 22 }}>
          <Form.Item label="Email address" name="email" rules={[
            { required: true, message: 'Enter your email address' },
            { type: 'email', message: 'Enter a valid email address' }
          ]}>
            <Input size="middle" prefix={<MailOutlined />} autoComplete="email" placeholder="Enter your email address" />
          </Form.Item>
          <Form.Item label="Password" name="password" rules={[{ required: true, message: 'Enter your password' }]}>
            <Input.Password size="middle" prefix={<LockOutlined />} autoComplete="current-password" placeholder="Enter your password" />
          </Form.Item>
          <Flex justify="space-between" align="center" style={{ margin: '-8px 0 16px' }}><Checkbox>Remember me</Checkbox><Link to="/forgot-password">Forgot password?</Link></Flex>
          <Button type="primary" htmlType="submit" loading={loading} block>Sign in securely</Button>
        </Form>
        <Space direction="vertical" size={6} className="care-auth-footer" style={{ width: '100%' }}>
          <Text>New to ElderlyCare? <Link to="/register">Create an account</Link></Text>
          <Button type="link" onClick={() => navigate('/')}>Return home</Button>
        </Space>
      </Card>
    </main>
  );
};

export default Login;
