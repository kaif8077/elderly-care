import {
  Button, Card, Col, Divider, Flex, Image, Layout, Row, Space,
  Timeline, Typography
} from 'antd';
import {
  FormOutlined, LockOutlined, MobileOutlined, QrcodeOutlined,
  SafetyCertificateOutlined, TeamOutlined
} from '@ant-design/icons';
import aboutCareImage from '../assests/about-care.jpg';
import aboutHero from '../assests/about-hero.jpg';
import PublicPageHero from '../components/PublicPageHero';
import PublicFooter from '../components/PublicFooter';

const { Content } = Layout;
const { Title, Paragraph, Text } = Typography;

const principles = [
  {
    icon: <QrcodeOutlined />,
    title: 'Emergency ready',
    text: 'Essential permitted details remain easier to reach through a secure, revocable QR card.'
  },
  {
    icon: <LockOutlined />,
    title: 'Private by design',
    text: 'Protected records stay separate from the limited information shared during an emergency.'
  },
  {
    icon: <SafetyCertificateOutlined />,
    title: 'Accessible for all',
    text: 'Clear steps, readable content, and large actions help older adults, families, and responders.'
  },
  {
    icon: <TeamOutlined />,
    title: 'Family connected',
    text: 'Emergency contacts and caregivers can coordinate around one trusted source of information.'
  },
  {
    icon: <FormOutlined />,
    title: 'Current and useful',
    text: 'Structured sections make medical, contact, and mobility information easier to review and update.'
  },
  {
    icon: <MobileOutlined />,
    title: 'Mobile first',
    text: 'Responsive screens keep emergency actions practical across phones, tablets, and desktops.'
  }
];

const About = () => (
  <Layout className="care-public-page care-about-page">
    <Content>
      <PublicPageHero
        title="About Us"
        image={aboutHero}
        compact
        centered
        headingOnly
      />

      <Flex vertical gap={64} style={{ width: 'min(1200px, calc(100% - 32px))', margin: '64px auto' }}>
        <section aria-labelledby="about-purpose">
          <Row align="stretch" gutter={[24, 28]}>
            <Col xs={24} lg={11}>
              <Card hoverable style={{ height: '100%', overflow: 'hidden' }} styles={{ body: { padding: 0, height: '100%' } }}>
                <Image
                  src={aboutCareImage}
                  alt="An older adult reviewing health information with a family caregiver"
                  preview={false}
                  width="100%"
                  height="100%"
                  style={{ minHeight: 500, objectFit: 'cover' }}
                />
              </Card>
            </Col>
            <Col xs={24} lg={13}>
              <Title level={2} className="care-eyebrow">OUR PURPOSE</Title>
              <h6 id="about-purpose" className="care-section-heading care-section-heading-left care-secondary-heading">Helping families prepare before an emergency happens</h6>
              <Paragraph type="secondary" className="care-section-subheading care-section-subheading-left">
                ElderlyCare was created to make important health and contact information easier to organize, update, and reach when an older adult needs assistance. Families can maintain one structured profile instead of relying on scattered papers, messages, or memory.
              </Paragraph>
              <Paragraph type="secondary">
                The platform brings together medical conditions, allergies, medicines, emergency contacts, doctors, hospital preferences, reports, and a printable emergency ID card in a clear workflow designed for everyday use.
              </Paragraph>
              <Paragraph type="secondary">
                Privacy remains central to the experience. Account owners control their protected records, while a revocable QR can show responders only the limited emergency details needed to provide timely help.
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
            <Title level={2} className="care-eyebrow">PRODUCT PRINCIPLES</Title>
            <h6 id="principles-title" className="care-section-heading care-secondary-heading">Useful, understandable, and privacy-conscious</h6>
          </Flex>
          <Row gutter={[20, 20]} style={{ marginTop: 24 }}>
            {principles.map((item) => (
              <Col xs={24} sm={12} md={8} key={item.title}>
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
