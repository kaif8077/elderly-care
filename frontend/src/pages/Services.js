import { useEffect, useState } from 'react';
import {
  Alert,
  Button,
  Card,
  Col,
  Flex,
  Image,
  Layout,
  List,
  Menu,
  Row,
  Space,
  Tag,
  Typography
} from 'antd';
import {
  CheckCircleOutlined,
  FilePdfOutlined,
  FileProtectOutlined,
  HeartOutlined,
  IdcardOutlined,
  MedicineBoxOutlined,
  QrcodeOutlined,
  SafetyCertificateOutlined
} from '@ant-design/icons';
import aboutHero from '../assests/about-hero.jpg';
import medicalProfileImage from '../assests/service-medical-profile.jpg';
import emergencyQrImage from '../assests/service-emergency-qr.jpg';
import idCardImage from '../assests/service-id-card.jpg';
import medicalSummaryImage from '../assests/service-medical-summary.jpg';
import healthGuidanceImage from '../assests/service-health-guidance.jpg';
import secureDocumentsImage from '../assests/service-secure-documents.jpg';
import PublicPageHero from '../components/PublicPageHero';
import PublicFooter from '../components/PublicFooter';

const { Content } = Layout;
const { Title, Paragraph, Text } = Typography;

const services = [
  {
    id: 'medical-profile',
    icon: <MedicineBoxOutlined />,
    title: 'Medical Profile',
    image: medicalProfileImage,
    summary:
      'Keep the elderly person’s essential personal, contact, and medical information organized in one protected account.',
    detail:
      'The guided form separates personal details, address, emergency contacts, medical conditions, allergies, medicines, symptoms, doctors, and hospital preferences into manageable steps.',
    points: [
      'Save each completed section securely',
      'Add multiple priority emergency contacts',
      'Update medicines, allergies, and conditions',
      'Review information before final submission'
    ],
    audience:
      'Older adults, family members, guardians, and caregivers who need one dependable place for current health information.'
  },
  {
    id: 'emergency-qr',
    icon: <QrcodeOutlined />,
    title: 'Emergency QR Access',
    image: emergencyQrImage,
    summary:
      'Give responders fast access to a limited emergency view without exposing the complete private medical profile.',
    detail:
      'The QR code contains a revocable secure link rather than medical records. The public page can show essential details such as blood group, severe allergies, critical conditions, and trusted contact actions.',
    points: [
      'Random and non-guessable access token',
      'Limited emergency information only',
      'Revoke and regenerate QR access',
      'No public profile editing or insurance data'
    ],
    audience:
      'Emergency responders or people assisting an older adult who may be unable to communicate clearly.'
  },
  {
    id: 'elder-id-card',
    icon: <IdcardOutlined />,
    title: 'ElderlyCare ID Card',
    image: idCardImage,
    summary:
      'Create a compact emergency card that can be carried in a wallet and printed when needed.',
    detail:
      'The single-sided card combines the person’s photograph, ElderlyCare number, date of birth, status, and secure QR in a clear wallet-card format.',
    points: [
      'Single-sided card preview',
      'Printable PDF download',
      'Clear emergency QR instruction',
      'Essential details without excessive exposure'
    ],
    audience:
      'Older adults who want physical emergency identification available even when a phone is not nearby.'
  },
  {
    id: 'medical-reports',
    icon: <FilePdfOutlined />,
    title: 'Emergency Medical Summary',
    image: medicalSummaryImage,
    summary:
      'Generate a structured Emergency Medical Summary that can be viewed privately and downloaded as a PDF.',
    detail:
      'Each generated report keeps a snapshot of the information used at that time, allowing the latest report and previous versions to remain available without silently changing historical records.',
    points: [
      'Versioned medical information snapshots',
      'Private preview and PDF download',
      'Critical details placed near the top',
      'Report history available from the profile'
    ],
    audience:
      'Families preparing information for appointments, travel, caregiving, or emergency reference.'
  },
  {
    id: 'health-guidance',
    icon: <HeartOutlined />,
    title: 'Health Recommendations',
    image: healthGuidanceImage,
    summary:
      'Receive a concise set of practical health and safety suggestions based on the saved medical profile.',
    detail:
      'Recommendations focus on necessary medication, allergy, mobility, fall-risk, and wellness considerations. Saved versions can be reviewed later or downloaded as a PDF.',
    points: [
      'Short, prioritized recommendations',
      'Relevant profile-based safety guidance',
      'Saved recommendation history',
      'PDF generation for private reference'
    ],
    audience:
      'Account owners and caregivers looking for clear reminders that complement, but never replace, professional medical advice.'
  },
  {
    id: 'secure-documents',
    icon: <FileProtectOutlined />,
    title: 'Secure Medical Documents',
    image: secureDocumentsImage,
    summary:
      'Keep important prescriptions and medical documents attached to the protected elderly profile.',
    detail:
      'Authenticated users can upload supported files, organize them by category, preview permitted documents, download them when needed, and remove outdated files securely.',
    points: [
      'Protected document upload and access',
      'File type and size validation',
      'Organized document categories',
      'Private preview, download, and deletion'
    ],
    audience:
      'Older adults and trusted caregivers who need important medical documents available without publishing them through emergency QR access.'
  }
];

const Services = () => {
  const hashKey = window.location.hash.replace('#', '');
  const initialId = services.some(({ id }) => id === hashKey) ? hashKey : services[0].id;
  const [activeId, setActiveId] = useState(initialId);
  const activeService = services.find(({ id }) => id === activeId) || services[0];

  useEffect(() => {
    if (window.location.hash !== `#${activeId}`) {
      window.history.replaceState(null, '', `#${activeId}`);
    }
  }, [activeId]);

  useEffect(() => {
    services.forEach(({ image }) => {
      const preloadImage = new window.Image();
      preloadImage.src = image;
    });
  }, []);

  return (
    <Layout>
      <Content>
        <PublicPageHero title="Services" image={aboutHero} compact centered headingOnly />

        <Flex
          vertical
          gap={22}
          style={{ width: 'min(1200px, calc(100% - 20px))', margin: '36px auto 56px' }}
        >
          <Flex vertical align="center" gap={8}>
            <Title level={2} className="care-eyebrow">
              HOW ELDERLYCARE HELPS
            </Title>
            <h6 className="care-section-heading care-secondary-heading">
              Practical tools for everyday care and emergencies
            </h6>
            <Paragraph type="secondary" className="care-section-subheading">
              Select a service to view its purpose, features, and the people it is designed to
              support.
            </Paragraph>
          </Flex>

          <Row gutter={[20, 20]} align="stretch">
            <Col xs={24} lg={8}>
              <Card
                title="All services"
                style={{ height: '100%' }}
                styles={{ body: { padding: 8 } }}
              >
                <Menu
                  mode="inline"
                  selectedKeys={[activeId]}
                  onClick={({ key }) => setActiveId(key)}
                  items={services.map((service) => ({
                    key: service.id,
                    icon: service.icon,
                    label: service.title
                  }))}
                />
              </Card>
            </Col>

            <Col xs={24} lg={16}>
              <Card
                style={{ height: '100%', overflow: 'hidden' }}
                styles={{ body: { padding: 0 } }}
              >
                <Image
                  key={activeService.id}
                  src={activeService.image}
                  alt={`${activeService.title} service`}
                  preview={false}
                  loading="eager"
                  fetchPriority="high"
                  width="100%"
                  style={{
                    display: 'block',
                    width: '100%',
                    aspectRatio: '1693 / 929',
                    objectFit: 'cover'
                  }}
                />
              </Card>
            </Col>
          </Row>

          <Card style={{ width: '100%' }}>
            <Row gutter={[32, 24]}>
              <Col xs={24} lg={15}>
                <Space direction="vertical" size={16} style={{ width: '100%' }}>
                  <Tag color="blue">SELECTED SERVICE</Tag>
                  <Space wrap>
                    <Button
                      type="primary"
                      shape="circle"
                      size="large"
                      icon={activeService.icon}
                      aria-label={activeService.title}
                    />
                    <Title level={2} style={{ margin: 0 }}>
                      {activeService.title}
                    </Title>
                  </Space>
                  <Paragraph style={{ margin: 0, fontSize: 17 }}>{activeService.summary}</Paragraph>
                  <Paragraph type="secondary" style={{ margin: 0, lineHeight: 1.8 }}>
                    {activeService.detail}
                  </Paragraph>
                  <Alert
                    type={activeService.id === 'health-guidance' ? 'warning' : 'info'}
                    showIcon
                    icon={<SafetyCertificateOutlined />}
                    message={
                      activeService.id === 'health-guidance'
                        ? 'Recommendations do not replace professional medical advice.'
                        : 'Private profile information remains protected behind authentication.'
                    }
                  />
                </Space>
              </Col>
              <Col xs={24} lg={9}>
                <Title level={4}>Included features</Title>
                <List
                  split={false}
                  dataSource={activeService.points}
                  renderItem={(point) => (
                    <List.Item>
                      <Text>
                        <CheckCircleOutlined style={{ color: '#0066ff', marginRight: 10 }} />
                        {point}
                      </Text>
                    </List.Item>
                  )}
                />
              </Col>
            </Row>
            <Card size="small" style={{ marginTop: 22, background: '#f8faff' }}>
              <Text strong>Designed for: </Text>
              <Text type="secondary">{activeService.audience}</Text>
            </Card>
          </Card>
        </Flex>
      </Content>
      <PublicFooter />
    </Layout>
  );
};

export default Services;
