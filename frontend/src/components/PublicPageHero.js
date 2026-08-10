import { Button, Carousel, Flex, Space, Tag, Typography } from 'antd';
import { Link } from 'react-router-dom';
import banner1 from '../assests/banner1.jpg';
import banner2 from '../assests/banner2.jpg';

const { Title, Paragraph } = Typography;
const homeBanners = [banner1, banner2];

const PublicPageHero = ({
  eyebrow = 'ELDERLYCARE',
  title,
  description,
  primaryAction,
  secondaryAction,
  image,
  compact = false,
  centered = false,
  headingOnly = false,
  showEyebrow = true
}) => {
  const backgrounds = image ? [image] : homeBanners;

  return (
    <section aria-label={`${title} banner`}>
      <Carousel autoplay={backgrounds.length > 1} autoplaySpeed={4500} arrows={backgrounds.length > 1} draggable={backgrounds.length > 1} dots={backgrounds.length > 1}>
        {backgrounds.map((banner, index) => (
          <div key={banner}>
            <Flex
              className={!image ? `care-home-banner-slide care-home-banner-slide-${index + 1}` : undefined}
              vertical
              justify="center"
              align={centered ? 'center' : 'flex-start'}
              gap={compact ? 12 : 18}
              style={{
                minHeight: compact ? 'clamp(210px, 25vw, 300px)' : 'clamp(420px, 62vw, 620px)',
                padding: compact ? 'clamp(20px, 4vw, 48px)' : 'clamp(32px, 8vw, 110px)',
                backgroundImage: `url(${banner})`,
                backgroundColor: 'rgba(10, 28, 58, .48)',
                backgroundBlendMode: 'multiply',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                color: '#fff',
                textAlign: centered ? 'center' : 'left'
              }}
            >
              {!headingOnly && showEyebrow && <Tag color="blue">{eyebrow}</Tag>}
              <Title style={{ margin: 0, maxWidth: 900, color: '#fff', fontSize: 'clamp(2.2rem, 5vw, 4rem)', lineHeight: 1.08, textShadow: '0 2px 12px rgba(0, 0, 0, .45)' }}>{title}</Title>
              {!headingOnly && description && <Paragraph style={{ margin: 0, maxWidth: 660, color: '#ff6b00', fontSize: compact ? 15 : 16, fontWeight: 700, lineHeight: 1.5, textShadow: '0 1px 6px rgba(0, 0, 0, .65)' }}>{description}</Paragraph>}
              {!headingOnly && (primaryAction || secondaryAction) && (
                <Space wrap size="middle">
                  {primaryAction && <Link to={primaryAction.to}><Button type="primary" size="large">{primaryAction.label}</Button></Link>}
                  {secondaryAction && <Link to={secondaryAction.to}><Button size="large">{secondaryAction.label}</Button></Link>}
                </Space>
              )}
            </Flex>
          </div>
        ))}
      </Carousel>
    </section>
  );
};

export default PublicPageHero;
