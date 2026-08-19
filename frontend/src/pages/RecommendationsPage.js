import { Card, Typography } from 'antd';
import Recommendations from '../components/Recommendations';

const RecommendationsPage = () => (
  <main className="care-page member-focused-page">
    <div className="member-page-title">
      <Typography.Title level={2}>Health Recommendations</Typography.Title>
      <Typography.Text type="secondary">Generate, read, download, and review your personalized guidance.</Typography.Text>
    </div>
    <Card className="member-content-card"><Recommendations /></Card>
  </main>
);

export default RecommendationsPage;
