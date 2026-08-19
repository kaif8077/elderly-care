import { Typography } from 'antd';
import MedicalDocuments from '../components/MedicalDocuments';

const DocumentsPage = () => (
  <main className="care-page member-focused-page">
    <div className="member-page-title">
      <Typography.Title level={2}>Secure Documents</Typography.Title>
      <Typography.Text type="secondary">Upload, preview, download, or remove your private medical documents.</Typography.Text>
    </div>
    <MedicalDocuments />
  </main>
);

export default DocumentsPage;
