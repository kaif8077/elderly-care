import { Alert } from 'antd';
import AdminSubmissionsTable from '../components/AdminSubmissionsTable';

const AdminContacts = () => (
  <>
    <Alert
      type="info"
      showIcon
      message="Contact Us submissions"
      description="Read product questions and support messages submitted through the public Contact Us form."
      style={{ marginBottom: 18 }}
    />
    <AdminSubmissionsTable endpoint="/contacts" type="contact" />
  </>
);

export default AdminContacts;
