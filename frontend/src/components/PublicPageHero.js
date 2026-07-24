import { Button, Carousel, Flex, Space, Tag, Typography } from 'antd';
import { Link } from 'react-router-dom';
import banner1 from '../assests/banner1.jpg';
import banner2 from '../assests/banner2.jpg';
import banner3 from '../assests/banner3.jpg';

const { Title, Paragraph } = Typography;
const banners = [banner1, banner2, banner3];

const PublicPageHero = ({
  eyebrow = 'ELDERLYCARE',
  title,
  description,
  primaryAction,
  secondaryAction,
  image
}) => {
  const slide = (background, index = 0) => (
    <Flex
      vertical
      justify="center"
      align="flex-start"
      gap={16}
      style={{
        minHeight: 'clamp(420px, 62vw, 620px)',
        padding: 'clamp(32px, 8vw, 110px)',
        backgroundImage: `linear-gradient(90deg, rgba(10, 28, 58, .88), rgba(10, 28, 58, .35)), url(${background})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        color: '#fff'
      }}
    >
      <Tag color={index === 1 ? 'orange' : 'blue'}>{eyebrow}</Tag>
      <Title style={{ margin: 0, maxWidth: 820, color: '#fff', fontSize: 'clamp(2.2rem, 5vw, 4rem)' }}>{title}</Title>
      <Paragraph style={{ margin: 0, maxWidth: 720, color: '#fff', fontSize: 18 }}>{description}</Paragraph>
      {(primaryAction || secondaryAction) && (
        <Space wrap size="middle">
          {primaryAction && <Link to={primaryAction.to}><Button type="primary" size="large">{primaryAction.label}</Button></Link>}
          {secondaryAction && <Link to={secondaryAction.to}><Button size="large">{secondaryAction.label}</Button></Link>}
        </Space>
      )}
    </Flex>
  );

  return (
    <section aria-label={`${title} banner`}>
      {image ? slide(image) : (
        <Carousel autoplay autoplaySpeed={4500} arrows draggable dots>
          {banners.map((banner, index) => <div key={banner}>{slide(banner, index)}</div>)}
        </Carousel>
      )}
    </section>
  );
};

export default PublicPageHero;
