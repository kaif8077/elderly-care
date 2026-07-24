import React, { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { Alert, Button, Card, Form, Input, Steps, Typography } from 'antd';
import { LockOutlined, MailOutlined, SafetyCertificateOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;
const apiBase = process.env.REACT_APP_BACKEND_URI || 'http://localhost:5000';

const ForgotPassword = () => {
  const [step, setStep] = useState(0);
  const [email, setEmail] = useState('');
  const [tempToken, setTempToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const requestCode = async ({ email: value }) => {
    setLoading(true);
    setError('');
    try {
      await axios.post(`${apiBase}/api/auth/forgot-password`, { email: value });
      setEmail(value);
      setStep(1);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to send the reset code.');
    } finally {
      setLoading(false);
    }
  };

  const verifyCode = async ({ otp }) => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.post(`${apiBase}/api/auth/verify-reset-otp`, { email, otp });
      setTempToken(response.data.tempToken);
      setStep(2);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'The reset code is invalid or expired.');
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async ({ newPassword }) => {
    setLoading(true);
    setError('');
    try {
      await axios.post(`${apiBase}/api/auth/reset-password`, { tempToken, newPassword });
      navigate('/login', { replace: true, state: { message: 'Password changed. Sign in with your new password.' } });
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to reset the password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="care-auth-page">
      <Card className="care-auth-card" styles={{ body: { padding: 28 } }}>
        <div className="care-auth-brand">
          <span className="care-auth-logo"><SafetyCertificateOutlined /></span>
          <div><Text className="care-eyebrow">ELDERLYCARE</Text><br /><Text type="secondary">Secure password recovery</Text></div>
        </div>
        <Title level={2}>Reset password</Title>
        <Steps size="small" current={step} items={[{ title: 'Email' }, { title: 'Verify' }, { title: 'Password' }]} />
        {error && <Alert type="error" showIcon message={error} style={{ margin: '18px 0' }} />}

        {step === 0 && (
          <Form layout="vertical" onFinish={requestCode} style={{ marginTop: 22 }}>
            <Form.Item name="email" label="Email address" rules={[{ required: true }, { type: 'email' }]}>
              <Input size="middle" prefix={<MailOutlined />} placeholder="Enter your registered email" autoComplete="email" />
            </Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block>Send reset code</Button>
          </Form>
        )}

        {step === 1 && (
          <Form layout="vertical" onFinish={verifyCode} style={{ marginTop: 22 }}>
            <Alert type="info" showIcon message={`Enter the code sent to ${email}`} style={{ marginBottom: 18 }} />
            <Form.Item name="otp" label="Verification code" rules={[{ required: true }, { len: 6 }]}>
              <Input.OTP length={6} />
            </Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block>Verify code</Button>
            <Button type="link" block onClick={() => setStep(0)}>Use another email</Button>
          </Form>
        )}

        {step === 2 && (
          <Form layout="vertical" onFinish={resetPassword} style={{ marginTop: 22 }}>
            <Form.Item name="newPassword" label="New password" rules={[
              { required: true },
              { min: 8, message: 'Use at least 8 characters' }
            ]}>
              <Input.Password size="middle" prefix={<LockOutlined />} placeholder="Create a new password" autoComplete="new-password" />
            </Form.Item>
            <Form.Item name="confirmPassword" label="Confirm new password" dependencies={['newPassword']} rules={[
              { required: true },
              ({ getFieldValue }) => ({
                validator: (_, value) => value === getFieldValue('newPassword')
                  ? Promise.resolve()
                  : Promise.reject(new Error('Passwords do not match'))
              })
            ]}>
              <Input.Password size="middle" prefix={<LockOutlined />} placeholder="Repeat the new password" autoComplete="new-password" />
            </Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block>Save new password</Button>
          </Form>
        )}

        <div className="care-auth-footer"><Link to="/login">Back to sign in</Link></div>
      </Card>
    </main>
  );
};

export default ForgotPassword;
