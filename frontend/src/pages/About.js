import { Link } from 'react-router-dom';
import {
  Avatar, Button, Card, Col, Divider, Flex, Image, Layout, Row, Space,
  Tag, Timeline, Typography
} from 'antd';
import {
  CheckCircleOutlined, LockOutlined, QrcodeOutlined, SafetyCertificateOutlined,
  TeamOutlined
} from '@ant-design/icons';
import aboutHero from '../assests/about-hero.jpg';
import aboutUsImage from '../assests/about_us.png';

const { Content, Footer } = Layout;
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

const team = [
  ['VK', 'Vibhor Kumar Vishnoi', 'Project Mentor'],
  ['MK', 'Mohammad Kaif', 'Frontend Developer'],
  ['MP', 'Madhur Panghal', 'Backend Developer'],
  ['MA', 'Mohammad Affan', 'UI/UX Designer'],
  ['MS', 'Mohd Samir', 'Backend Developer']
];

const About = () => (
  <Layout>
    <Content>
      <Card styles={{ body: { padding: 0 } }} bordered={false} style={{ borderRadius: 0, overflow: 'hidden' }}>
        <Row align="middle">
          <Col xs={24} lg={12}>
            <Flex vertical gap={16} style={{ padding: 'clamp(32px, 7vw, 88px)' }}>
              <Tag color="blue">ABOUT ELDERLYCARE</Tag>
              <Title style={{ margin: 0 }}>Helping families prepare important health information before an emergency</Title>
              <Paragraph type="secondary" style={{ fontSize: 18 }}>
                ElderlyCare is a MERN application for creating structured medical profiles, private emergency summaries, secure QR access, and emergency ID cards for older adults.
              </Paragraph>
              <Space wrap>
                <Link to="/register"><Button type="primary" size="large">Create an account</Button></Link>
                <Link to="/services"><Button size="large">See how it works</Button></Link>
              </Space>
            </Flex>
          </Col>
          <Col xs={24} lg={12}>
            <Image src={aboutHero} alt="Supportive elderly care" preview={false} width="100%" style={{ display: 'block', maxHeight: 520, objectFit: 'cover' }} />
          </Col>
        </Row>
      </Card>

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

        <Card>
          <Row align="middle" gutter={[20, 20]}>
            <Col xs={24} md={16}>
              <Space direction="vertical">
                <Text className="care-eyebrow">IMPORTANT BOUNDARY</Text>
                <Title level={3} style={{ margin: 0 }}><SafetyCertificateOutlined /> Emergency support, not medical advice</Title>
                <Text type="secondary">ElderlyCare organizes user-provided information. It does not diagnose conditions and is not a substitute for a doctor or emergency service.</Text>
              </Space>
            </Col>
            <Col xs={24} md={8}><Link to="/contact"><Button type="primary" block>Contact the project team</Button></Link></Col>
          </Row>
        </Card>

        <section aria-labelledby="team-title">
          <Flex vertical align="center" gap={8}>
            <Text className="care-eyebrow">THE PROJECT TEAM</Text>
            <Title id="team-title" level={2} style={{ margin: 0 }}><TeamOutlined /> People behind ElderlyCare</Title>
          </Flex>
          <Row gutter={[16, 16]} justify="center" style={{ marginTop: 24 }}>
            {team.map(([initials, name, role]) => (
              <Col xs={24} sm={12} lg={8} key={name}>
                <Card size="small">
                  <Space>
                    <Avatar size={48} style={{ background: '#0066ff' }}>{initials}</Avatar>
                    <div><Text strong>{name}</Text><br /><Text type="secondary">{role}</Text></div>
                  </Space>
                </Card>
              </Col>
            ))}
          </Row>
        </section>
      </Flex>
    </Content>
    <Footer style={{ textAlign: 'center' }}>© {new Date().getFullYear()} ElderlyCare</Footer>
  </Layout>
);

export default About;
