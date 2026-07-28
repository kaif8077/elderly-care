import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Alert, Button, Card, Col, Divider, Flex, Image, Layout, List, Menu, Row, Space, Tag, Typography
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

const Services = () => {
  const hashKey = window.location.hash.replace('#', '');
  const [activeId, setActiveId] = useState(services.some(({ id }) => id === hashKey) ? hashKey : services[0].id);
  const activeService = services.find(({ id }) => id === activeId) || services[0];
  const activeIndex = services.findIndex(({ id }) => id === activeService.id);

  useEffect(() => {
    if (window.location.hash !== `#${activeId}`) window.history.replaceState(null, '', `#${activeId}`);
  }, [activeId]);

  return (
    <Layout>
      <Content>
        <PublicPageHero
          title="Services"
          image={aboutHero}
          compact
          centered
          headingOnly
        />

        <Flex vertical gap={20} style={{ width: 'calc(100% - 20px)', margin: '30px 10px 52px' }}>
          <Alert
            type="info"
            showIcon
            icon={<SafetyCertificateOutlined />}
            message="Private account, limited emergency access"
            description="Complete profiles, insurance details, and downloaded reports remain private. QR access shows only permitted emergency information."
          />

          <Row gutter={[20, 20]} align="top">
            <Col xs={24} lg={7} xl={6}>
              <Card title="All services" styles={{ body: { padding: 8 } }}>
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

            <Col xs={24} lg={17} xl={18}>
              <Card styles={{ body: { padding: 0 } }} style={{ overflow: 'hidden' }}>
                <Row>
                  <Col xs={24} xl={10}>
                    <Flex align="center" justify="center" style={{ minHeight: 390, height: '100%', padding: 28, background: '#edf3ff' }}>
                      <Image
                        key={activeService.id}
                        src={activeService.image}
                        alt={activeService.title}
                        preview={false}
                        width="100%"
                        style={{ maxHeight: 390, objectFit: 'contain' }}
                      />
                    </Flex>
                  </Col>
                  <Col xs={24} xl={14}>
                    <Flex vertical gap={14} style={{ padding: 'clamp(24px, 5vw, 56px)' }}>
                      <Space wrap>
                        <Tag color="blue">SERVICE {activeIndex + 1} OF {services.length}</Tag>
                        <Button type="primary" shape="circle" icon={activeService.icon} />
                      </Space>
                      <Title level={2} style={{ margin: 0 }}>{activeService.title}</Title>
                      <Paragraph type="secondary" style={{ margin: 0, fontSize: 17 }}>{activeService.summary}</Paragraph>
                      <Divider orientation="left">What you receive</Divider>
                      <List
                        split={false}
                        dataSource={activeService.points}
                        renderItem={(point) => (
                          <List.Item>
                            <Text><CheckCircleOutlined style={{ color: '#0066ff', marginRight: 10 }} />{point}</Text>
                          </List.Item>
                        )}
                      />
                      <Alert
                        type="warning"
                        showIcon
                        message={activeService.id === 'recommendations'
                          ? 'Health guidance does not replace professional medical advice.'
                          : 'Access to private information requires authentication.'}
                      />
                      <Space wrap>
                        <Link to="/register"><Button type="primary">Create an account</Button></Link>
                        <Link to="/contact"><Button>Contact us</Button></Link>
                      </Space>
                    </Flex>
                  </Col>
                </Row>
              </Card>
            </Col>
          </Row>
        </Flex>
      </Content>
      <PublicFooter />
    </Layout>
  );
};

export default Services;
