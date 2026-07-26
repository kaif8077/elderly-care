import { Link } from 'react-router-dom';
import {
  Button, Card, Col, Divider, Flex, Image, Layout, Row, Space,
  Timeline, Typography
} from 'antd';
import {
  CheckCircleOutlined, LockOutlined, QrcodeOutlined, SafetyCertificateOutlined
} from '@ant-design/icons';
import aboutUsImage from '../assests/about_us.png';
import aboutHero from '../assests/about-hero.jpg';
import PublicPageHero from '../components/PublicPageHero';
import PublicFooter from '../components/PublicFooter';

const { Content } = Layout;
const { Title, Paragraph, Text } = Typography;

const principles = [
  {
    icon: <CheckCircleOutlined />,
    title: 'Easy to understand',
    text: 'Clear labels, larger touch targets, structured steps, and responsive screens reduce effort for older adults and families.'
  },
  {
    icon: <LockOutlined />,
    title: 'Private by design',
    text: 'Authenticated profiles and reports remain separate from the limited emergency information available through a QR scan.'
  },
  {
    icon: <QrcodeOutlined />,
    title: 'Ready for emergencies',
    text: 'A revocable QR and wallet-style ID card make permitted emergency details easier to reach when communication is difficult.'
  }
];

const About = () => (
  <Layout>
    <Content>
      <PublicPageHero
        
        title="About US"
        
        
        image={aboutHero}
      />

      <Flex vertical gap={64} style={{ width: 'min(1200px, calc(100% - 32px))', margin: '64px auto' }}>
        <section aria-labelledby="about-purpose">
          <Row align="middle" gutter={[24, 28]}>
            <Col xs={24} lg={10}><Image src={aboutUsImage} alt="ElderlyCare health information workflow" preview={false} width="100%" /></Col>
            <Col xs={24} lg={14}>
              <Text className="care-eyebrow">OUR PURPOSE</Text>
              <Title id="about-purpose" level={2}>Reduce uncertainty when an older adult needs help</Title>
              <Paragraph type="secondary">
                Medical conditions, allergies, medicines, emergency numbers, and hospital preferences are often spread across paper records and family messages. ElderlyCare brings the essential details into one structured profile.
              </Paragraph>
              <Paragraph type="secondary">
                The account owner controls the private profile. Emergency QR access is intentionally limited and does not publish insurance information, full reports, or profile-editing controls.
              </Paragraph>
              <Divider />
              <Timeline items={[
                { color: 'blue', children: 'Create and verify an ElderlyCare account.' },
                { color: 'blue', children: 'Save the medical profile one section at a time.' },
                { color: 'blue', children: 'Generate a revocable emergency QR and ID card.' },
                { color: 'blue', children: 'Keep reports and health details current.' }
              ]} />
            </Col>
          </Row>
        </section>

        <section aria-labelledby="principles-title">
          <Flex vertical align="center" gap={8}>
            <Text className="care-eyebrow">PRODUCT PRINCIPLES</Text>
            <Title id="principles-title" level={2} style={{ margin: 0, textAlign: 'center' }}>Useful, understandable, and privacy-conscious</Title>
          </Flex>
          <Row gutter={[20, 20]} style={{ marginTop: 24 }}>
            {principles.map((item) => (
              <Col xs={24} md={8} key={item.title}>
                <Card hoverable style={{ height: '100%' }}>
                  <Space direction="vertical" size={14}>
                    <Button type="primary" shape="circle" size="large" icon={item.icon} />
                    <Title level={4} style={{ margin: 0 }}>{item.title}</Title>
                    <Paragraph type="secondary" style={{ margin: 0 }}>{item.text}</Paragraph>
                  </Space>
                </Card>
              </Col>
            ))}
          </Row>
        </section>

        
      </Flex>
    </Content>
    <PublicFooter />
  </Layout>
);

export default About;
