import { Card, Space, Typography } from 'antd';
import { SafetyCertificateOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import MedicalForm from '../components/MedicalForm';

const MedicalProfilePage = () => {
  const navigate = useNavigate();
  return (
    <main className="care-page member-focused-page">
      <div className="member-page-title">
        <Typography.Title level={2}>Medical Profile</Typography.Title>
        <Typography.Text type="secondary">Add or update the information used across your private profile and emergency tools.</Typography.Text>
      </div>
      <Card className="member-content-card" title={<Space><SafetyCertificateOutlined />Health information form</Space>}>
        <MedicalForm onSubmissionSuccess={() => navigate('/profile')} />
      </Card>
    </main>
  );
};

export default MedicalProfilePage;
