import React, { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import {
  Alert, Button, Card, Empty, List, Skeleton, Space, Tag, Typography
} from 'antd';
import {
  DownloadOutlined, HeartOutlined, HistoryOutlined, LikeOutlined, DislikeOutlined, ReloadOutlined
} from '@ant-design/icons';
import './Recommendations.css';

const { Paragraph, Text, Title } = Typography;
const base = import.meta.env.VITE_BACKEND_URI || 'http://localhost:5000';

const Recommendations = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState(false);
  const [error, setError] = useState('');
  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const { data } = await axios.get(`${base}/api/recommendations/health`, { headers });
      setItems(data.recommendations || []);
      setError('');
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to load recommendations.');
    } finally {
      setLoading(false);
    }
  // The token is the current browser session.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  useEffect(() => { load(); }, [load]);

  const generate = async () => {
    setWorking(true);
    setError('');
    try {
      await axios.post(`${base}/api/recommendations/health`, {}, { headers });
      await load();
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Complete your medical profile first.');
    } finally {
      setWorking(false);
    }
  };

  const download = async (id) => {
    try {
      const response = await axios.get(`${base}/api/recommendations/health/${id}/download`, {
        headers,
        responseType: 'blob'
      });
      const url = URL.createObjectURL(response.data);
      const link = document.createElement('a');
      link.href = url;
      link.download = `health-recommendation-${id}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (requestError) {
      setError('Unable to download this recommendation PDF.');
    }
  };
  const sendFeedback = async (id, relevance) => {
    try {
      await axios.patch(`${base}/api/recommendations/health/${id}/feedback`, { relevance }, { headers });
      await load();
    } catch (requestError) { setError('Unable to save recommendation feedback.'); }
  };

  const latest = items[0];
  return (
    <section>
      <Space align="start" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 18 }}>
        <div>
          <Title level={2} className="care-eyebrow">PERSONALIZED WELLNESS</Title>
          <h6 className="care-secondary-heading" style={{ margin: '5px 0' }}><HeartOutlined /> Necessary health guidance</h6>
          <Paragraph type="secondary" style={{ margin: 0 }}>A short list based on your latest medical profile.</Paragraph>
        </div>
        <Button type="primary" icon={<ReloadOutlined />} onClick={generate} loading={working}>Generate new</Button>
      </Space>

      {error && <Alert type="error" showIcon message={error} closable onClose={() => setError('')} />}
      {loading ? <Skeleton active paragraph={{ rows: 5 }} /> : latest ? (
        <div className="recommendations-workspace">
          <Card
            className="recommendation-latest-card"
            size="small"
            title={<Space><Tag color="blue">Latest</Tag><Text>{new Date(latest.generatedAt).toLocaleString()}</Text></Space>}
            extra={<Button icon={<DownloadOutlined />} onClick={() => download(latest._id)}>PDF</Button>}
          >
            <div className="recommendation-content">{latest.content}</div>
            {latest.sourceSummary && <div style={{ marginTop: 16 }}><Text type="secondary">Generated from: </Text><Space wrap>{[
              ...(latest.sourceSummary.conditions || []), ...(latest.sourceSummary.allergies || []),
              ...(latest.sourceSummary.medications || []), ...(latest.sourceSummary.symptoms || [])
            ].slice(0, 8).map((value) => <Tag key={value}>{value}</Tag>)}</Space></div>}
            <Space style={{ marginTop: 16 }}><Text>Was this guidance relevant?</Text><Button type={latest.feedback?.relevance === 'helpful' ? 'primary' : 'default'} icon={<LikeOutlined />} onClick={() => sendFeedback(latest._id, 'helpful')}>Helpful</Button><Button type={latest.feedback?.relevance === 'not_helpful' ? 'primary' : 'default'} icon={<DislikeOutlined />} onClick={() => sendFeedback(latest._id, 'not_helpful')}>Not helpful</Button></Space>
          </Card>
          <Card className="recommendation-history-card" size="small" title={<Space><HistoryOutlined />Recommendation history</Space>}>
            {items.length > 1 ? (
              <List
                dataSource={items.slice(1)}
                renderItem={(item) => (
                  <List.Item actions={[<Button type="link" icon={<DownloadOutlined />} onClick={() => download(item._id)}>PDF</Button>]}>
                    {new Date(item.generatedAt).toLocaleString()}
                  </List.Item>
                )}
              />
            ) : <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No previous recommendations" />}
          </Card>
        </div>
      ) : (
        <Empty description="Complete your medical profile, then generate your first recommendation.">
          <Button type="primary" onClick={generate} loading={working}>Generate recommendation</Button>
        </Empty>
      )}
    </section>
  );
};

export default Recommendations;
