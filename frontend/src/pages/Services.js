import { Link } from 'react-router-dom';
import {
  Alert, Button, Card, Col, Flex, Image, Layout, List, Row, Space, Tag, Typography
} from 'antd';
import {
  CheckCircleOutlined, FilePdfOutlined, HeartOutlined, IdcardOutlined,
  MedicineBoxOutlined, QrcodeOutlined, SafetyCertificateOutlined
} from '@ant-design/icons';
import formImage from '../assests/form.png';
import recommendationsImage from '../assests/recommendation.png';
import qrImage from '../assests/qr_id_card.png';
import secureImage from '../assests/secure.png';
import reportImage from '../assests/print.png';
import aboutHero from '../assests/about-hero.jpg';
import PublicPageHero from '../components/PublicPageHero';
import PublicFooter from '../components/PublicFooter';

const { Content } = Layout;
const { Title, Paragraph, Text } = Typography;

const services = [
  {
    id: 'form-filling',
    icon: <MedicineBoxOutlined />,
    title: 'Structured medical profile',
    image: formImage,
    summary: 'Complete a guided profile that keeps emergency-ready information organized without placing every detail on one long screen.',
    points: ['Personal details and required profile photograph', 'Residential address and multiple emergency contacts', 'Custom conditions, allergies, medicines, and symptoms', 'Each completed step is saved to the backend']
  },
  {
    id: 'qr-code-id-card',
    icon: <IdcardOutlined />,
    title: 'ElderlyCare emergency ID card',
    image: qrImage,
    summary: 'Create a front-and-back wallet card that can be printed or downloaded as a private PDF.',
    points: ['12-digit ElderlyCare number', 'Name, photograph, date of birth, and blood group', 'Residential and emergency contact information', 'High-resolution emergency QR']
  },
  {
    id: 'qr-code-scan',
    icon: <QrcodeOutlined />,
    title: 'Secure emergency QR access',
    image: secureImage,
    summary: 'A responder can open limited emergency information quickly without receiving access to the account owner’s private profile.',
    points: ['Opaque, non-guessable QR token', 'Revocable and regenerable access', 'No public insurance or private report data', 'No profile editing from the scanner page']
  },
  {
    id: 'recommendations',
    icon: <HeartOutlined />,
    title: 'Necessary health guidance',
    image: recommendationsImage,
    summary: 'Generate a short list of safety and wellness guidance supported by the saved medical profile.',
    points: ['Concise priority guidance', 'Profile-specific allergy, fall, and medication-safety notes', 'Saved recommendation history', 'Authenticated PDF download']
  },
  {
    id: 'medical-reports',
    icon: <FilePdfOutlined />,
    title: 'Emergency Medical Summary',
    image: reportImage,
    summary: 'Create private report versions that preserve the information used at the time each report was generated.',
    points: ['Snapshot-based report versions', 'Latest report and previous history', 'Authenticated preview and PDF download', 'Emergency-information and medical-advice disclaimer']
  }
];

const Services = () => (
  <Layout>
    <Content>
      <PublicPageHero
        eyebrow="ELDERLYCARE SERVICES"
        title="One workflow for emergency-ready health information"
        description="Create the profile, generate secure access, and keep private summaries available for the account owner."
        primaryAction={{ to: '/register', label: 'Get started' }}
        secondaryAction={{ to: '/contact', label: 'Ask a question' }}
        image={aboutHero}
      />

      <Flex vertical gap={24} style={{ width: 'calc(100% - 20px)', margin: '36px 10px 56px' }}>
        <Alert
          type="info"
          showIcon
          icon={<SafetyCertificateOutlined />}
          message="Private account, limited emergency access"
          description="Complete profiles, insurance details, and downloaded reports remain private. The QR emergency page displays only the limited information allowed for emergency use."
        />

        {services.map((service, index) => (
          <Card id={service.id} key={service.id} styles={{ body: { padding: 0 } }} style={{ overflow: 'hidden' }}>
            <Row align="stretch">
              <Col
                xs={{ span: 24, order: 1 }}
                lg={{ span: 10, order: index % 2 === 0 ? 1 : 2 }}
              >
                <Flex align="center" justify="center" style={{ height: '100%', minHeight: 320, padding: 24, background: '#edf3ff' }}>
                  <Image src={service.image} alt={service.title} preview={false} width="100%" style={{ maxHeight: 360, objectFit: 'contain' }} />
                </Flex>
              </Col>
              <Col
                xs={{ span: 24, order: 2 }}
                lg={{ span: 14, order: index % 2 === 0 ? 2 : 1 }}
              >
                <Flex vertical justify="center" gap={14} style={{ height: '100%', minHeight: 320, padding: 'clamp(24px, 5vw, 60px)' }}>
                  <Space wrap><Tag color="blue">SERVICE {index + 1}</Tag><Button type="primary" shape="circle" icon={service.icon} /></Space>
                  <Title level={2} style={{ margin: 0 }}>{service.title}</Title>
                  <Paragraph type="secondary" style={{ margin: 0, fontSize: 17 }}>{service.summary}</Paragraph>
                  <List
                    split={false}
                    dataSource={service.points}
                    renderItem={(point) => <List.Item><Text><CheckCircleOutlined style={{ color: '#0066ff', marginRight: 10 }} />{point}</Text></List.Item>}
                  />
                </Flex>
              </Col>
            </Row>
          </Card>
        ))}

        <Card>
          <Row align="middle" gutter={[20, 20]}>
            <Col xs={24} md={16}><Title level={3} style={{ margin: 0 }}>Ready to prepare your profile?</Title><Text type="secondary">Verify your account and save each profile section at your own pace.</Text></Col>
            <Col xs={24} md={8}><Link to="/register"><Button type="primary" size="large" block>Create an account</Button></Link></Col>
          </Row>
        </Card>
      </Flex>
    </Content>
    <PublicFooter />
  </Layout>
);

export default Services;
