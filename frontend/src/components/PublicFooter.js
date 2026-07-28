import { Button, Col, Divider, Flex, Layout, Row, Space, Typography } from 'antd';
import { Link } from 'react-router-dom';
import { MailOutlined, PhoneOutlined } from '@ant-design/icons';

const { Footer } = Layout;
const { Title, Text } = Typography;

const PublicFooter = () => (
  <Footer style={{ padding: '44px clamp(20px, 7vw, 90px) 24px', background: '#1f2937' }}>
    <Row gutter={[32, 28]}>
      <Col xs={24} md={10}>
        <Flex vertical gap={14}>
          <Title level={3} style={{ margin: 0, color: '#fff', fontWeight: 800 }}>ElderlyCare</Title>
          <Text style={{ color: '#d1d5db', maxWidth: 430, lineHeight: 1.7 }}>
            ElderlyCare helps families organize essential health information, create emergency-ready profiles, and connect responders with trusted contacts when timely support matters most.
          </Text>
        </Flex>
      </Col>
      <Col xs={12} md={7}>
        <Space direction="vertical">
          <Text strong style={{ color: '#fff' }}>Explore</Text>
          <Link to="/about">About Us</Link>
          <Link to="/services">Services</Link>
          <Link to="/contact">Contact Us</Link>
        </Space>
      </Col>
      <Col xs={12} md={7}>
        <Space direction="vertical">
          <Text strong style={{ color: '#fff' }}>Contact</Text>
          <Button type="link" href="tel:+918528576249" icon={<PhoneOutlined />} style={{ padding: 0 }}>+91 8528576249</Button>
          <Button type="link" href="mailto:mohdkaif90275@gmail.com" icon={<MailOutlined />} style={{ padding: 0 }}>Email us</Button>
        </Space>
      </Col>
    </Row>
    <Divider style={{ borderColor: '#4b5563' }} />
    <Flex justify="center">
      <Text style={{ color: '#9ca3af', textAlign: 'center' }}>© 2025 ElderlyCare. All rights reserved.</Text>
    </Flex>
  </Footer>
);

export default PublicFooter;
