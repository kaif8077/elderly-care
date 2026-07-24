import { useState } from 'react';
import {
  Alert, Button, Card, Col, Flex, Form, Input, Layout, Rate, Row, Space,
  Typography, message
} from 'antd';
import {
  EnvironmentOutlined, MailOutlined, PhoneOutlined,
  SendOutlined, StarOutlined
} from '@ant-design/icons';
import { submitContactForm } from '../services/contactService';
import { submitFeedbackForm } from '../services/feedbackService';
import PublicPageHero from '../components/PublicPageHero';
import PublicFooter from '../components/PublicFooter';
import aboutHero from '../assests/about-hero.jpg';

const { Content } = Layout;
const { Title, Paragraph, Text, Link } = Typography;

const Contact = () => {
  const [contactForm] = Form.useForm();
  const [feedbackForm] = Form.useForm();
  const [contactLoading, setContactLoading] = useState(false);
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [contactError, setContactError] = useState('');
  const [feedbackError, setFeedbackError] = useState('');

  const submitContact = async (values) => {
    setContactLoading(true);
    setContactError('');
    try {
      const response = await submitContactForm(values);
      message.success(response.message || 'Your message has been received.');
      contactForm.resetFields();
    } catch (error) {
      setContactError(error.message || 'Unable to send your message.');
    } finally {
      setContactLoading(false);
    }
  };

  const submitFeedback = async (values) => {
    setFeedbackLoading(true);
    setFeedbackError('');
    try {
      const response = await submitFeedbackForm(values);
      message.success(response.message || 'Thank you for your feedback.');
      feedbackForm.resetFields();
    } catch (error) {
      setFeedbackError(error.message || 'Unable to submit your feedback.');
    } finally {
      setFeedbackLoading(false);
    }
  };

  const contactMethods = [
    {
      icon: <PhoneOutlined />,
      title: 'Phone',
      description: 'Call during normal business hours',
      content: <Link href="tel:+918528576249">+91 8528576249</Link>
    },
    {
      icon: <MailOutlined />,
      title: 'Email',
      description: 'Send product and support questions',
      content: <Link href="mailto:mohdkaif90275@gmail.com">mohdkaif90275@gmail.com</Link>
    },
    {
      icon: <EnvironmentOutlined />,
      title: 'Project location',
      description: 'MIT College, Moradabad',
      content: <Link href="https://maps.app.goo.gl/mVbpZJ9dhpVq8Xtf9" target="_blank" rel="noreferrer">Open map</Link>
    }
  ];

  return (
    <Layout>
      <Content>
        <PublicPageHero
          eyebrow="CONTACT ELDERLYCARE"
          title="Questions, support, and product feedback"
          description="Ask a product question, report a problem, or share feedback about your ElderlyCare experience."
          image={aboutHero}
        />

        <Flex vertical gap={28} style={{ width: 'min(1200px, calc(100% - 32px))', margin: '48px auto' }}>
          <Row gutter={[20, 20]}>
            {contactMethods.map((method) => (
              <Col xs={24} md={8} key={method.title}>
                <Card hoverable style={{ height: '100%' }}>
                  <Space direction="vertical" size={12}>
                    <Button type="primary" shape="circle" size="large" icon={method.icon} />
                    <Title level={4} style={{ margin: 0 }}>{method.title}</Title>
                    <Text type="secondary">{method.description}</Text>
                    {method.content}
                  </Space>
                </Card>
              </Col>
            ))}
          </Row>

          <Row gutter={[24, 24]}>
            <Col xs={24} lg={12}>
              <Card title={<Space><SendOutlined />Send us a message</Space>} style={{ height: '100%' }}>
                <Paragraph type="secondary">Use this form for support questions or to report an application problem.</Paragraph>
                {contactError && <Alert type="error" showIcon message={contactError} closable onClose={() => setContactError('')} style={{ marginBottom: 18 }} />}
                <Form form={contactForm} layout="vertical" requiredMark onFinish={submitContact}>
                  <Form.Item name="name" label="Full name" rules={[{ required: true, message: 'Enter your full name' }]}><Input placeholder="Enter your full name" /></Form.Item>
                  <Form.Item name="email" label="Email address" rules={[{ required: true, message: 'Enter your email address' }, { type: 'email', message: 'Enter a valid email address' }]}><Input placeholder="Enter your email address" /></Form.Item>
                  <Form.Item name="message" label="Message" rules={[{ required: true, message: 'Enter your message' }, { min: 10, message: 'Use at least 10 characters' }]}><Input.TextArea rows={5} showCount maxLength={2000} placeholder="Describe your question or problem" /></Form.Item>
                  <Button type="primary" htmlType="submit" block icon={<SendOutlined />} loading={contactLoading}>Send message</Button>
                </Form>
              </Card>
            </Col>

            <Col xs={24} lg={12}>
              <Card title={<Space><StarOutlined />Share feedback</Space>} style={{ height: '100%' }}>
                <Paragraph type="secondary">Tell us what is useful and what should be improved.</Paragraph>
                {feedbackError && <Alert type="error" showIcon message={feedbackError} closable onClose={() => setFeedbackError('')} style={{ marginBottom: 18 }} />}
                <Form form={feedbackForm} layout="vertical" requiredMark onFinish={submitFeedback}>
                  <Form.Item name="name" label="Full name" rules={[{ required: true, message: 'Enter your full name' }]}><Input placeholder="Enter your full name" /></Form.Item>
                  <Form.Item name="email" label="Email address" rules={[{ required: true, message: 'Enter your email address' }, { type: 'email', message: 'Enter a valid email address' }]}><Input placeholder="Enter your email address" /></Form.Item>
                  <Form.Item name="rating" label="Rating" rules={[{ required: true, message: 'Select a rating' }]}><Rate /></Form.Item>
                  <Form.Item name="comments" label="Comments" rules={[{ required: true, message: 'Enter your comments' }, { min: 10, message: 'Use at least 10 characters' }]}><Input.TextArea rows={5} showCount maxLength={2000} placeholder="Share your experience with ElderlyCare" /></Form.Item>
                  <Button type="primary" htmlType="submit" block icon={<StarOutlined />} loading={feedbackLoading}>Submit feedback</Button>
                </Form>
              </Card>
            </Col>
          </Row>

          <Alert
            type="warning"
            showIcon
            message="Do not use this page for an active medical emergency"
            description="Call your local emergency service or the person’s listed emergency contact when immediate assistance is required."
          />
        </Flex>
      </Content>
      <PublicFooter />
    </Layout>
  );
};

export default Contact;
