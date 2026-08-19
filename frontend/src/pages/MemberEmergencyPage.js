import { useContext, useEffect, useRef, useState } from 'react';
import { Alert, Button, Card, Descriptions, Empty, Skeleton, Space, Typography } from 'antd';
import { PhoneOutlined, QrcodeOutlined, ReloadOutlined } from '@ant-design/icons';
import { AuthContext } from '../context/AuthContext';
import UserIdCard from '../components/UserIdCard';
import api from '../services/api';

const MemberEmergencyPage = () => {
  const { user } = useContext(AuthContext);
  const photoUrlRef = useRef('');
  const [state, setState] = useState({ loading: true, working: false, profile: null, qrCode: '', photoUrl: '', error: '' });

  const load = async (generateMissing = true) => {
    setState((current) => ({ ...current, loading: true, error: '' }));
    let objectUrl = '';
    try {
      const { data: profile } = await api.get(`/api/medical/${user._id}`);
      const photo = profile.profilePhoto
        ? await api.get(`/api/medical/${user._id}/photo`, { responseType: 'blob' }).catch(() => null)
        : null;
      if (photo?.data) objectUrl = URL.createObjectURL(photo.data);
      let qrCode = '';
      try {
        const { data } = await api.get(`/api/qr/${user._id}`);
        qrCode = data.qrCode?.data || '';
      } catch (error) {
        if (error.response?.status !== 404 || !generateMissing) throw error;
        const { data } = await api.post('/api/qr', { userId: user._id });
        qrCode = data.qrCode?.data || '';
      }
      if (photoUrlRef.current) URL.revokeObjectURL(photoUrlRef.current);
      photoUrlRef.current = objectUrl;
      setState({ loading: false, working: false, profile, qrCode, photoUrl: objectUrl, error: '' });
    } catch (error) {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
      setState((current) => ({ ...current, loading: false, working: false, error: error.response?.data?.message || 'Complete your medical profile before creating the emergency ID card.' }));
    }
  };

  useEffect(() => {
    if (user?._id) load();
    return () => {
      if (photoUrlRef.current) URL.revokeObjectURL(photoUrlRef.current);
      photoUrlRef.current = '';
    };
    // The authenticated member ID determines this page data.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?._id]);

  const regenerate = async () => {
    setState((current) => ({ ...current, working: true, error: '' }));
    try {
      const { data } = await api.post('/api/qr', { userId: user._id });
      setState((current) => ({ ...current, working: false, qrCode: data.qrCode?.data || '' }));
    } catch (error) {
      setState((current) => ({ ...current, working: false, error: error.response?.data?.message || 'Unable to regenerate the emergency QR.' }));
    }
  };

  if (state.loading) return <main className="care-page"><Skeleton active avatar paragraph={{ rows: 8 }} /></main>;

  const primary = state.profile?.emergencyContacts?.[0];
  return (
    <main className="care-page member-focused-page">
      <div className="member-page-title">
        <Typography.Title level={2}>Emergency ID Card</Typography.Title>
        <Typography.Text type="secondary">Your current profile and QR are combined into a printable emergency card.</Typography.Text>
      </div>
      {state.error && <Alert type="error" showIcon message={state.error} action={<Button onClick={() => load()}>Retry</Button>} />}
      {!state.profile ? <Empty description="Complete your medical profile to generate an ID card"><Button type="primary" href="/medical-profile">Complete profile</Button></Empty> : (
        <Space direction="vertical" size={18} style={{ width: '100%' }}>
          <Card className="member-content-card" title={<Space><QrcodeOutlined />Emergency card</Space>} extra={<Button icon={<ReloadOutlined />} loading={state.working} onClick={regenerate}>Regenerate QR</Button>}>
            <UserIdCard profile={state.profile} qrCode={state.qrCode} photoUrl={state.photoUrl} />
          </Card>
          <Card className="member-content-card" title="Primary emergency contact">
            <Descriptions column={{ xs: 1, sm: 3 }} items={[
              { key: 'name', label: 'Name', children: primary?.name || 'Not provided' },
              { key: 'relation', label: 'Relationship', children: primary?.relationship || 'Not provided' },
              { key: 'phone', label: 'Phone', children: primary?.phone ? <a href={`tel:${primary.phone}`}><PhoneOutlined /> {primary.phone}</a> : 'Not provided' }
            ]} />
          </Card>
        </Space>
      )}
    </main>
  );
};

export default MemberEmergencyPage;
