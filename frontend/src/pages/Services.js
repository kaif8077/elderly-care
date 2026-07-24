import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Alert, Button, Card, Col, Flex, Grid, Image, Layout, List, Row, Space,
  Tabs, Tag, Typography
} from 'antd';
import {
  FilePdfOutlined, HeartOutlined, IdcardOutlined, MedicineBoxOutlined,
  QrcodeOutlined, SafetyCertificateOutlined
} from '@ant-design/icons';
import formImage from '../assests/form.png';
import recommendationsImage from '../assests/recommendation.png';
import qrImage from '../assests/qr_id_card.png';
import secureImage from '../assests/secure.png';
import reportImage from '../assests/print.png';

const { Content, Footer } = Layout;
const { Title, Paragraph, Text } = Typography;
const { useBreakpoint } = Grid;

const services = [
  {
    key: 'form-filling',
    icon: <MedicineBoxOutlined />,
    title: 'Structured medical profile',
    image: formImage,
    summary: 'Save important personal, contact, emergency, and medical details in guided steps.',
    points: ['Mandatory emergency-ready personal details', 'Multiple emergency contacts', 'Custom conditions, allergies, medicines, and symptoms', 'Section-by-section backend saving']
  },
  {
    key: 'qr-code-id-card',
    icon: <IdcardOutlined />,
    title: 'ElderlyCare ID card',
    image: qrImage,
    summary: 'Create a printable front-and-back card with a 12-digit ElderlyCare ID.',
    points: ['Photograph, name, date of birth, and blood group', 'Emergency QR code', 'Phone and residential address', 'Wallet-size PDF and ID-only print']
  },
  {
    key: 'qr-code-scan',
    icon: <QrcodeOutlined />,
    title: 'Secure emergency QR',
    image: secureImage,
    summary: 'Give responders fast access to a limited emergency view without publishing the full medical record.',
    points: ['Random, opaque access token', 'Revocable and regenerable QR', 'No profile editing from public access', 'Insurance and private reports excluded']
  },
  {
    key: 'recommendations',
    icon: <HeartOutlined />,
    title: 'Necessary health guidance',
    image: recommendationsImage,
    summary: 'Generate concise wellness and safety guidance supported by the saved profile.',
    points: ['Short prioritized guidance', 'Profile-specific fall, allergy, and medication safety notes', 'Saved recommendation history', 'Private PDF download']
  },
  {
    key: 'medical-reports',
    icon: <FilePdfOutlined />,
    title: 'Emergency Medical Summary',
    image: reportImage,
    summary: 'Generate private, versioned snapshots instead of changing every historical report.',
    points: ['Latest report and report history', 'Authenticated preview and download', 'Snapshot-based versions', 'Clear emergency-information disclaimer']
  }
];

const Services = () => {
  const screens = useBreakpoint();
  const initial = window.location.hash.replace('#', '');
  const [activeKey, setActiveKey] = useState(services.some(({ key }) => key === initial) ? initial : services[0].key);
  const active = services.find(({ key }) => key === activeKey) || services[0];

  useEffect(() => {
    if (window.location.hash !== `#${activeKey}`) window.history.replaceState(null, '', `#${activeKey}`);
  }, [activeKey]);

  const tabItems = services.map((service) => ({
    key: service.key,
    label: <Space>{service.icon}{service.title}</Space>
  }));

  return (
    <Layout>
      <Content>
        <Flex vertical align="center" gap={12} style={{ padding: 'clamp(40px, 8vw, 88px) 16px', background: '#0066ff', color: '#fff' }}>
          <Tag color="orange">ELDERLYCARE SERVICES</Tag>
          <Title style={{ margin: 0, color: '#fff', textAlign: 'center' }}>One workflow for emergency-ready health information</Title>
          <Paragraph style={{ margin: 0, color: '#fff', textAlign: 'center', maxWidth: 760, fontSize: 18 }}>Create the profile, generate secure access, and keep private summaries available for the account owner.</Paragraph>
        </Flex>

        <Flex vertical gap={28} style={{ width: 'min(1200px, calc(100% - 32px))', margin: '48px auto' }}>
          <Alert type="info" showIcon icon={<SafetyCertificateOutlined />} message="Privacy boundary" description="Public QR access contains limited emergency details. Insurance information, complete reports, and editing remain private." />
          <Card>
            <Tabs
              tabPosition={screens.lg ? 'left' : 'top'}
              activeKey={activeKey}
              onChange={setActiveKey}
              items={tabItems}
            />
            <Row align="middle" gutter={[32, 28]} style={{ marginTop: 24 }}>
              <Col xs={24} lg={10}><Image src={active.image} alt={active.title} preview={false} width="100%" /></Col>
              <Col xs={24} lg={14}>
                <Text className="care-eyebrow">CURRENT FEATURE</Text>
                <Title level={2}>{active.icon} {active.title}</Title>
                <Paragraph type="secondary" style={{ fontSize: 17 }}>{active.summary}</Paragraph>
                <List dataSource={active.points} renderItem={(point) => <List.Item><List.Item.Meta avatar={<Button type="primary" shape="circle" size="small" icon={<SafetyCertificateOutlined />} />} title={point} /></List.Item>} />
              </Col>
            </Row>
          </Card>
          <Card>
            <Row align="middle" gutter={[20, 20]}>
              <Col xs={24} md={16}><Title level={3} style={{ margin: 0 }}>Ready to create an emergency-ready profile?</Title><Text type="secondary">Register, verify your email, and save each section securely.</Text></Col>
              <Col xs={24} md={8}><Link to="/register"><Button type="primary" size="large" block>Get started</Button></Link></Col>
            </Row>
          </Card>
        </Flex>
      </Content>
      <Footer style={{ textAlign: 'center' }}>© {new Date().getFullYear()} ElderlyCare</Footer>
    </Layout>
  );
};

export default Services;
