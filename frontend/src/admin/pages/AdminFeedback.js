import { Alert } from 'antd';
import AdminSubmissionsTable from '../components/AdminSubmissionsTable';

const AdminFeedback = () => (
  <>
    <Alert type="info" showIcon message="User feedback" description="Review ratings and comments submitted through the public feedback form." style={{ marginBottom: 18 }} />
    <AdminSubmissionsTable endpoint="/feedback" type="feedback" />
  </>
);

export default AdminFeedback;
