import { useState } from 'react';
import {
  Alert,
  Button,
  Card,
  Col,
  Flex,
  Form,
  Input,
  Layout,
  Row,
  Space,
  Typography,
  message
} from 'antd';
import { EnvironmentOutlined, MailOutlined, PhoneOutlined, SendOutlined } from '@ant-design/icons';
import { submitContactForm } from '../services/contactService';
import PublicPageHero from '../components/PublicPageHero';
import PublicFooter from '../components/PublicFooter';
import aboutHero from '../assests/about-hero.jpg';

const { Content } = Layout;
const { Title, Paragraph, Text, Link } = Typography;

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
    title: 'Location',
    description: 'MIT College, Moradabad',
    content: (
      <Link href="https://maps.app.goo.gl/mVbpZJ9dhpVq8Xtf9" target="_blank" rel="noreferrer">
        Open map
      </Link>
    )
  }
];

const Contact = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submitContact = async (values) => {
    setLoading(true);
    setError('');
    try {
      const response = await submitContactForm(values);
      message.success(response.message || 'Your message has been received.');
      form.resetFields();
    } catch (requestError) {
      setError(requestError.message || 'Unable to send your message.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <Content>
        <PublicPageHero title="Contact Us" image={aboutHero} compact centered headingOnly />

        <Flex
          vertical
          gap={20}
          style={{ width: 'min(1100px, calc(100% - 32px))', margin: '32px auto' }}
        >
          <Flex vertical align="center" gap={8}>
            <Title level={2} className="care-eyebrow">
              WE ARE HERE TO HELP
            </Title>
            <h6 className="care-section-heading care-secondary-heading">
              Talk to the ElderlyCare team
            </h6>
            <Paragraph type="secondary" className="care-section-subheading">
              Contact us with a product question, support request, or suggestion about your
              ElderlyCare experience.
            </Paragraph>
          </Flex>

          <Row gutter={[20, 20]} align="stretch">
            <Col xs={24} lg={12}>
              <Flex vertical gap={12} style={{ height: '100%' }}>
                {contactMethods.map((method) => (
                  <Card key={method.title} size="small" hoverable style={{ flex: 1 }}>
                    <Flex align="center" gap={16}>
                      <Button
                        type="primary"
                        shape="circle"
                        size="large"
                        icon={method.icon}
                        aria-label={method.title}
                      />
                      <Flex vertical gap={2}>
                        <Title level={4} style={{ margin: 0 }}>
                          {method.title}
                        </Title>
                        <Text type="secondary">{method.description}</Text>
                        {method.content}
                      </Flex>
                    </Flex>
                  </Card>
                ))}
              </Flex>
            </Col>

            <Col xs={24} lg={12}>
              <Card
                size="small"
                title={
                  <Space>
                    <SendOutlined />
                    Send us a message
                  </Space>
                }
                style={{ height: '100%' }}
              >
                <Paragraph type="secondary" style={{ marginBottom: 12 }}>
                  Complete the form and our team will respond using the email address or phone
                  number you provide.
                </Paragraph>
                {error && (
                  <Alert
                    type="error"
                    showIcon
                    message={error}
                    closable
                    onClose={() => setError('')}
                    style={{ marginBottom: 18 }}
                  />
                )}
                <Form
                  form={form}
                  layout="vertical"
                  size="large"
                  requiredMark
                  onFinish={submitContact}
                >
                  <Form.Item
                    name="name"
                    label="Full name"
                    style={{ marginBottom: 12 }}
                    rules={[{ required: true, message: 'Enter your full name' }]}
                  >
                    <Input placeholder="Enter your full name" />
                  </Form.Item>
                  <Form.Item
                    name="email"
                    label="Email address"
                    style={{ marginBottom: 12 }}
                    rules={[
                      { required: true, message: 'Enter your email address' },
                      { type: 'email', message: 'Enter a valid email address' }
                    ]}
                  >
                    <Input placeholder="Enter your email address" />
                  </Form.Item>
                  <Form.Item
                    name="phone"
                    label="Phone number"
                    style={{ marginBottom: 12 }}
                    rules={[
                      { required: true, message: 'Enter your phone number' },
                      { pattern: /^[+0-9()\-\s]{8,20}$/, message: 'Enter a valid phone number' }
                    ]}
                  >
                    <Input inputMode="tel" placeholder="Enter your phone number" />
                  </Form.Item>
                  <Form.Item
                    name="message"
                    label="Message"
                    style={{ marginBottom: 12 }}
                    rules={[
                      { required: true, message: 'Enter your message' },
                      { min: 10, message: 'Use at least 10 characters' }
                    ]}
                  >
                    <Input.TextArea
                      rows={4}
                      showCount
                      maxLength={2000}
                      placeholder="Describe your question or support request"
                    />
                  </Form.Item>
                  <Button
                    type="primary"
                    size="large"
                    htmlType="submit"
                    block
                    icon={<SendOutlined />}
                    loading={loading}
                  >
                    Send message
                  </Button>
                </Form>
              </Card>
            </Col>
          </Row>
        </Flex>
      </Content>
      <PublicFooter />
    </Layout>
  );
};

export default Contact;
