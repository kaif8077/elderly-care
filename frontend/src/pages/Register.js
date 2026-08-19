import React, { useContext, useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { Alert, Button, Card, ConfigProvider, Form, Input, Progress, Space, Steps, Typography } from 'antd';
import { LockOutlined, MailOutlined, UserOutlined } from '@ant-design/icons';
import { toast } from 'react-toastify';
import { AuthContext } from '../context/AuthContext';
import AuthShowcase from '../components/AuthShowcase';
import AuthBrand from '../components/AuthBrand';

const { Title, Text } = Typography;
const apiBase = import.meta.env.VITE_BACKEND_URI || 'http://localhost:5000';
const strength = (password = '') => [password.length >= 8, /[A-Z]/.test(password), /[a-z]/.test(password), /\d/.test(password), /[!@#$%^&*(),.?":{}|<>]/.test(password)].filter(Boolean).length;

const Register = () => {
  const [form] = Form.useForm(); const [step, setStep] = useState(0); const [account, setAccount] = useState({});
  const [loading, setLoading] = useState(false); const [error, setError] = useState('');
  const navigate = useNavigate(); const { login } = useContext(AuthContext);
  const requestOtp = async (values) => { setLoading(true); setError(''); try { await axios.post(`${apiBase}/api/auth/register`, { name: values.name, email: values.email }); setAccount(values); setStep(1); toast.success('Verification code sent to your email'); } catch (requestError) { setError(requestError.response?.data?.message || 'Unable to start registration.'); } finally { setLoading(false); } };
  const verify = async ({ otp }) => { setLoading(true); setError(''); try { const verified = await axios.post(`${apiBase}/api/auth/verify-otp`, { email: account.email, otp }); const completed = await axios.post(`${apiBase}/api/auth/complete-registration`, { name: account.name, password: account.password, registrationToken: verified.data.registrationToken }); localStorage.setItem('token', completed.data.token); login(completed.data.user); toast.success('Account created. You are now signed in.'); navigate('/dashboard'); } catch (requestError) { setError(requestError.response?.data?.message || 'Unable to verify the code.'); } finally { setLoading(false); } };
  const resend = async () => { setLoading(true); try { await axios.post(`${apiBase}/api/auth/register`, { name: account.name, email: account.email }); toast.success('A new code was sent.'); } catch (requestError) { setError(requestError.response?.data?.message || 'Unable to resend code.'); } finally { setLoading(false); } };
  return (
    <ConfigProvider componentSize="middle"><main className="care-auth-page"><AuthShowcase /><Card className="care-auth-card" styles={{ body: { padding: 32 } }}>
      <div className="care-auth-brand"><span className="care-auth-logo"><AuthBrand /></span><div><Text className="care-eyebrow">ELDERLYCARE</Text><br /><Text type="secondary">Create a protected health profile</Text></div></div>
      <Title level={2}>{step === 0 ? 'Create your account' : 'Verify your email'}</Title><Steps size="small" current={step} items={[{ title: 'Account' }, { title: 'Verify' }]} />
      {error && <Alert type="error" showIcon message={error} style={{ marginBottom: 20 }} />}
      {step === 0 ? <Form form={form} layout="vertical" requiredMark="optional" onFinish={requestOtp}>
        <Form.Item label="Full name" name="name" rules={[{ required: true, message: 'Enter your full name' }]}><Input size="middle" prefix={<UserOutlined />} autoComplete="name" placeholder="Enter your full name" /></Form.Item>
        <Form.Item label="Email address" name="email" rules={[{ required: true }, { type: 'email' }]}><Input size="middle" prefix={<MailOutlined />} autoComplete="email" placeholder="Enter your email address" /></Form.Item>
        <Form.Item label="Password" name="password" dependencies={['confirmPassword']} rules={[{ required: true }, { validator: (_, value) => strength(value) === 5 ? Promise.resolve() : Promise.reject(new Error('Use 8+ characters with upper/lowercase, number and special character')) }]}><Input.Password size="middle" prefix={<LockOutlined />} autoComplete="new-password" placeholder="Enter a strong password" /></Form.Item>
        <Form.Item noStyle shouldUpdate={(before, after) => before.password !== after.password}>{({ getFieldValue }) => <Progress percent={strength(getFieldValue('password')) * 20} showInfo={false} strokeColor="#0066ff" style={{ marginBottom: 12 }} />}</Form.Item>
        <Form.Item label="Confirm password" name="confirmPassword" dependencies={['password']} rules={[{ required: true }, { validator: (_, value) => value === form.getFieldValue('password') ? Promise.resolve() : Promise.reject(new Error('Passwords do not match')) }]}><Input.Password size="middle" prefix={<LockOutlined />} autoComplete="new-password" placeholder="Repeat your password" /></Form.Item>
        <Button size="middle" block type="primary" htmlType="submit" loading={loading}>Send verification code</Button>
      </Form> : <Form layout="vertical" onFinish={verify}><Alert type="info" showIcon message={`A 6-digit code was sent to ${account.email}`} style={{ marginBottom: 20 }} /><Form.Item label="Verification code" name="otp" rules={[{ required: true }, { len: 6, message: 'Enter the 6-digit code' }]}><Input.OTP size="middle" length={6} /></Form.Item><Button size="middle" block type="primary" htmlType="submit" loading={loading}>Verify and open dashboard</Button><Button size="middle" block type="link" onClick={resend} disabled={loading}>Resend code</Button></Form>}
      <Space direction="vertical" className="care-auth-footer" style={{ width: '100%' }}><Text>Already registered? <Link to="/login">Sign in</Link></Text><Button type="link" onClick={() => navigate('/')}>Return home</Button></Space>
    </Card></main></ConfigProvider>
  );
};
export default Register;
