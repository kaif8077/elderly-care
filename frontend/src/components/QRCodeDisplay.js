import React, { useContext, useEffect, useState } from 'react';
import { Button, Card, Empty, Image, Skeleton, Space, Typography } from 'antd';
import { QrcodeOutlined, ReloadOutlined } from '@ant-design/icons';
import { toast } from 'react-toastify';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import './QRCodeDisplay.css';

const { Title, Paragraph, Text } = Typography;

const QRCodeDisplay = () => {
  const { user } = useContext(AuthContext);
  const [qrCode, setQrCode] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user?._id) return;
    api.get(`/api/qr/${user._id}`)
      .then(({ data }) => setQrCode(data.qrCode?.data || ''))
      .catch((error) => {
        if (error.response?.status !== 404) toast.error('Unable to load the emergency QR code.');
      });
  }, [user]);

  const generate = async () => {
    setLoading(true);
    try {
      const { data } = await api.post('/api/qr', { userId: user._id });
      setQrCode(data.qrCode?.data || '');
      toast.success('Emergency QR code generated.');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Save your medical profile before generating a QR code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="care-section-card qr-full-card">
      <Space direction="vertical" size={18} align="center" style={{ width: '100%' }}>
        <QrcodeOutlined className="qr-heading-icon" />
        <div className="qr-copy">
          <Title level={2}>Emergency QR</Title>
          <Paragraph type="secondary">Generate a revocable emergency-access QR after saving your profile.</Paragraph>
        </div>
        {loading ? <Skeleton.Image active className="qr-skeleton" /> : qrCode
          ? <Image src={qrCode} width={260} preview={false} alt="Emergency QR code" className="qr-image" />
          : <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No emergency QR generated yet" />}
        <Button type="primary" size="large" block icon={qrCode ? <ReloadOutlined /> : <QrcodeOutlined />} loading={loading} onClick={generate}>
          {qrCode ? 'Regenerate emergency QR' : 'Generate emergency QR'}
        </Button>
        {qrCode && <Text type="secondary">Keep this QR on your ElderlyCare ID card for emergency access.</Text>}
      </Space>
    </Card>
  );
};

export default QRCodeDisplay;
