import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Alert, Button, Card, Col, Collapse, Divider, Flex, Image, Layout,
  Row, Space, Statistic, Tag, theme, Typography
} from 'antd';
import {
  BellOutlined, CheckCircleOutlined, FileProtectOutlined, HeartOutlined,
  IdcardOutlined, MedicineBoxOutlined, QrcodeOutlined, RightOutlined,
  SafetyCertificateOutlined, TeamOutlined
} from '@ant-design/icons';
import bannerImage from '../assests/banner1.jpg';
import whyChooseUsImage from '../assests/why-choose-us.jpg';

const { Content, Footer } = Layout;
const { Title, Paragraph, Text } = Typography;

const features = [
  {
    icon: <MedicineBoxOutlined />,
    title: 'Structured medical profile',
    description: 'Keep personal details, medical conditions, medicines, allergies, doctors, and emergency contacts in one protected profile.'
  },
  {
    icon: <QrcodeOutlined />,
    title: 'Secure emergency QR',
    description: 'Generate a revocable QR that opens only the limited emergency information permitted for responders.'
  },
  {
    icon: <IdcardOutlined />,
    title: 'Emergency ID card',
    description: 'Create a wallet-ready ElderlyCare card with photograph, blood group, emergency QR, and essential contact details.'
  },
  {
    icon: <FileProtectOutlined />,
    title: 'Versioned medical reports',
    description: 'Generate private Emergency Medical Summary snapshots and download authenticated PDF versions when needed.'
  },
  {
    icon: <HeartOutlined />,
    title: 'Necessary health guidance',
    description: 'Receive concise, profile-based wellness guidance without replacing advice from qualified medical professionals.'
  },
  {
    icon: <BellOutlined />,
    title: 'Emergency communication',
    description: 'Help responders contact family quickly and share permitted emergency information through the QR workflow.'
  }
];

const problemPoints = [
  'Critical health details may be unavailable when an older adult cannot communicate.',
  'Paper prescriptions and emergency numbers are easily misplaced or become outdated.',
  'Family members may not know which allergies, medicines, or hospital preferences matter immediately.'
];

const solutionPoints = [
  'One structured profile keeps emergency-ready details together.',
  'A secure, revocable QR provides fast access to limited permitted information.',
  'Private reports and an ID card help families keep accurate information ready.'
];

const faqItems = [
  {
    key: 'qr',
    label: 'Does the QR contain the complete medical record?',
    children: 'No. It contains a secure link. The public emergency view returns only limited emergency information and excludes insurance and private report data.'
  },
  {
    key: 'security',
    label: 'Can anyone edit a profile after scanning the QR?',
    children: 'No. A responder can only view permitted emergency information. Editing the profile requires the account owner’s authenticated session.'
  },
  {
    key: 'reports',
    label: 'What is an Emergency Medical Summary?',
    children: 'It is a private, versioned snapshot of important profile information for emergency reference. It is not a replacement for professional medical advice.'
  },
  {
    key: 'recommendations',
    label: 'What type of recommendations does ElderlyCare provide?',
    children: 'ElderlyCare provides short wellness and safety guidance based on the saved profile. It does not diagnose conditions, prescribe medicines, or recommend changing treatment.'
  }
];

const Home = () => {
  const { token } = theme.useToken();

  useEffect(() => {
    const backendUrl = process.env.REACT_APP_BACKEND_URI || 'https://elderly-care-zuq9.onrender.com';
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), 30000);
    fetch(`${backendUrl.replace(/\/$/, '')}/api`, {
      method: 'GET',
      cache: 'no-store',
      signal: controller.signal
    }).catch(() => {}).finally(() => window.clearTimeout(timeoutId));
    return () => {
      window.clearTimeout(timeoutId);
      controller.abort();
    };
  }, []);

  return (
    <Layout>
      <Content>
        <section aria-labelledby="home-hero-title">
          <Card
            styles={{ body: { padding: 0 } }}
            bordered={false}
            style={{ borderRadius: 0, overflow: 'hidden', background: token.colorPrimary }}
          >
            <Row align="middle">
              <Col xs={24} lg={13}>
                <Flex vertical gap={18} style={{ padding: 'clamp(32px, 7vw, 88px)', color: '#fff' }}>
                  <Space wrap>
                    <Tag color="blue">Emergency-ready information</Tag>
                    <Tag color="orange">Designed for older adults</Tag>
                  </Space>
                  <Title id="home-hero-title" style={{ margin: 0, color: '#fff', fontSize: 'clamp(2.2rem, 5vw, 4rem)' }}>
                    Important health information, ready when every second matters.
                  </Title>
                  <Paragraph style={{ margin: 0, color: '#fff', fontSize: 18, maxWidth: 680 }}>
                    ElderlyCare helps older adults and families organize medical information, create a secure emergency QR, and keep an emergency ID card and private reports available.
                  </Paragraph>
                  <Space wrap size="middle">
                    <Link to="/register"><Button type="primary" size="large" ghost>Create a protected profile</Button></Link>
                    <Link to="/services"><Button size="large">Explore features</Button></Link>
                  </Space>
                </Flex>
              </Col>
              <Col xs={24} lg={11}>
                <Image
                  src={bannerImage}
                  alt="Older adult receiving supportive care"
                  preview={false}
                  width="100%"
                  style={{ display: 'block', maxHeight: 560, objectFit: 'cover' }}
                />
              </Col>
            </Row>
          </Card>
        </section>

        <Flex vertical gap={64} style={{ width: 'min(1200px, calc(100% - 32px))', margin: '64px auto' }}>
          <section aria-labelledby="problem-title">
            <Flex vertical align="center" gap={8}>
              <Text className="care-eyebrow">THE PROBLEM WE SOLVE</Text>
              <Title id="problem-title" level={2} style={{ margin: 0, textAlign: 'center' }}>Emergency information is often scattered or unavailable</Title>
              <Paragraph type="secondary" style={{ textAlign: 'center', maxWidth: 760 }}>
                During a fall, accident, or medical emergency, an older adult may be unable to explain their conditions, allergies, medicines, or whom to contact.
              </Paragraph>
            </Flex>
            <Row gutter={[20, 20]} style={{ marginTop: 24 }}>
              <Col xs={24} lg={12}>
                <Card title="Without an emergency-ready profile" style={{ height: '100%' }}>
                  <Space direction="vertical" size={18}>
                    {problemPoints.map((point) => <Text key={point}><SafetyCertificateOutlined style={{ color: token.colorWarning, marginRight: 10 }} />{point}</Text>)}
                  </Space>
                </Card>
              </Col>
              <Col xs={24} lg={12}>
                <Card title="How ElderlyCare helps" style={{ height: '100%' }}>
                  <Space direction="vertical" size={18}>
                    {solutionPoints.map((point) => <Text key={point}><CheckCircleOutlined style={{ color: token.colorPrimary, marginRight: 10 }} />{point}</Text>)}
                  </Space>
                </Card>
              </Col>
            </Row>
          </section>

          <section aria-labelledby="features-title">
            <Flex vertical align="center" gap={8}>
              <Text className="care-eyebrow">ONE CONNECTED WORKFLOW</Text>
              <Title id="features-title" level={2} style={{ margin: 0, textAlign: 'center' }}>Built for preparation, privacy, and faster emergency action</Title>
              <Paragraph type="secondary" style={{ textAlign: 'center', maxWidth: 760 }}>Complete the profile once, keep it current, and use the permitted information across QR access, reports, and the ElderlyCare ID card.</Paragraph>
            </Flex>
            <Row gutter={[20, 20]} style={{ marginTop: 24 }}>
              {features.map((feature) => (
                <Col xs={24} sm={12} lg={8} key={feature.title}>
                  <Card hoverable style={{ height: '100%' }}>
                    <Space direction="vertical" size={14}>
                      <Button type="primary" shape="circle" size="large" icon={feature.icon} />
                      <Title level={4} style={{ margin: 0 }}>{feature.title}</Title>
                      <Paragraph type="secondary" style={{ margin: 0 }}>{feature.description}</Paragraph>
                    </Space>
                  </Card>
                </Col>
              ))}
            </Row>
          </section>

          <section aria-labelledby="trust-title">
            <Card>
              <Row align="middle" gutter={[32, 28]}>
                <Col xs={24} lg={10}>
                  <Image src={whyChooseUsImage} alt="Older adult with a trusted caregiver" preview={false} width="100%" style={{ borderRadius: token.borderRadiusLG }} />
                </Col>
                <Col xs={24} lg={14}>
                  <Text className="care-eyebrow">CLEAR PRIVACY BOUNDARIES</Text>
                  <Title id="trust-title" level={2}>Useful in emergencies without publishing the complete record</Title>
                  <Paragraph type="secondary">
                    ElderlyCare separates the private account from the limited public emergency view. Insurance details, private reports, and profile editing remain behind authentication.
                  </Paragraph>
                  <Row gutter={[16, 16]}>
                    <Col xs={12}><Statistic title="ElderlyCare ID" value="12 digit" prefix={<IdcardOutlined />} /></Col>
                    <Col xs={12}><Statistic title="QR access" value="Revocable" prefix={<QrcodeOutlined />} /></Col>
                  </Row>
                  <Divider />
                  <Space wrap>
                    <Link to="/about"><Button type="primary">Learn about ElderlyCare</Button></Link>
                    <Link to="/contact"><Button icon={<TeamOutlined />}>Contact us</Button></Link>
                  </Space>
                </Col>
              </Row>
            </Card>
          </section>

          <section aria-labelledby="faq-title">
            <Flex vertical align="center" gap={8}>
              <Text className="care-eyebrow">COMMON QUESTIONS</Text>
              <Title id="faq-title" level={2} style={{ margin: 0, textAlign: 'center' }}>Understand how emergency access works</Title>
            </Flex>
            <Collapse accordion items={faqItems} style={{ marginTop: 24 }} />
          </section>

          <Alert
            type="info"
            showIcon
            icon={<HeartOutlined />}
            message="Ready to prepare an emergency-ready profile?"
            description="Create an account, verify your email, and complete each medical-profile section at your own pace."
            action={<Link to="/register"><Button type="primary" icon={<RightOutlined />}>Get started</Button></Link>}
          />
        </Flex>
      </Content>

      <Footer style={{ textAlign: 'center' }}>
        <Space direction="vertical" size={4}>
          <Text strong>ElderlyCare</Text>
          <Text type="secondary">Emergency information support for older adults and their families.</Text>
          <Text type="secondary">© {new Date().getFullYear()} ElderlyCare</Text>
        </Space>
      </Footer>
    </Layout>
  );
};

export default Home;
