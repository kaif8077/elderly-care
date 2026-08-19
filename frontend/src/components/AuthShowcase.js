import { SafetyCertificateOutlined, HeartOutlined, TeamOutlined } from '@ant-design/icons';
import { Space, Typography } from 'antd';
import AuthBrand from './AuthBrand';
import './AuthShowcase.css';

const { Paragraph, Text, Title } = Typography;

const AuthShowcase = ({ admin = false }) => (
  <aside className="auth-showcase" aria-label="About ElderlyCare">
    <AuthBrand className="auth-showcase-logo" />
    <div className="auth-showcase-copy">
      <span className="auth-showcase-line" />
      <Title level={1}>{admin ? 'Manage.' : 'Care.'}<br /><strong>{admin ? 'Review.' : 'Connect.'}</strong><br />Protect.</Title>
      <Paragraph>{admin
        ? 'A secure workspace for managing ElderlyCare members, emergency activity, and protected account operations.'
        : 'ElderlyCare helps you securely store and manage important health information for you and your loved ones.'}</Paragraph>
      <Space direction="vertical" size={20} className="auth-benefits">
        <div><span><SafetyCertificateOutlined /></span><div><Text strong>Secure &amp; Private</Text><Text type="secondary">Protected access to personal health information</Text></div></div>
        <div><span><HeartOutlined /></span><div><Text strong>Health First</Text><Text type="secondary">Designed to support emergency preparedness</Text></div></div>
        <div><span><TeamOutlined /></span><div><Text strong>Always Accessible</Text><Text type="secondary">Reach permitted information when it matters</Text></div></div>
      </Space>
    </div>
    <Text type="secondary" className="auth-showcase-footer"><SafetyCertificateOutlined /> Privacy and security are our priority</Text>
  </aside>
);

export default AuthShowcase;
