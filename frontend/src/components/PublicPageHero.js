import { Button, Flex, Space, Tag, Typography } from 'antd';
import { Link } from 'react-router-dom';
import homeHero from '../assests/home-hero-v2.jpg';

const { Title, Paragraph } = Typography;

const PublicPageHero = ({
  eyebrow = 'ELDERLYCARE',
  title,
  description,
  primaryAction,
  secondaryAction,
  image,
  compact = false,
  centered = false,
  headingOnly = false
}) => {
  const background = image || homeHero;

  return (
    <section aria-label={`${title} banner`}>
      <Flex
        vertical
        justify="center"
        align={centered ? 'center' : 'flex-start'}
        gap={16}
        style={{
          minHeight: compact ? 'clamp(210px, 25vw, 300px)' : 'clamp(420px, 62vw, 620px)',
          padding: compact ? 'clamp(20px, 4vw, 48px)' : 'clamp(32px, 8vw, 110px)',
          backgroundImage: `url(${background})`,
          backgroundColor: 'rgba(10, 28, 58, .42)',
          backgroundBlendMode: 'multiply',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          color: '#fff',
          textAlign: centered ? 'center' : 'left'
        }}
      >
        {!headingOnly && <Tag color="blue">{eyebrow}</Tag>}
        <Title style={{ margin: 0, maxWidth: 820, color: '#fff', fontSize: 'clamp(2.2rem, 5vw, 4rem)', textShadow: '0 2px 12px rgba(0, 0, 0, .45)' }}>{title}</Title>
        {!headingOnly && description && <Paragraph style={{ margin: 0, maxWidth: 720, color: '#fff', fontSize: 18, textShadow: '0 2px 10px rgba(0, 0, 0, .45)' }}>{description}</Paragraph>}
        {!headingOnly && (primaryAction || secondaryAction) && (
          <Space wrap size="middle">
            {primaryAction && <Link to={primaryAction.to}><Button type="primary" size="large">{primaryAction.label}</Button></Link>}
            {secondaryAction && <Link to={secondaryAction.to}><Button size="large">{secondaryAction.label}</Button></Link>}
          </Space>
        )}
      </Flex>
    </section>
  );
};

export default PublicPageHero;
