import React, { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import {
  Alert, Button, Card, Empty, List, Skeleton, Space, Tag, Typography
} from 'antd';
import {
  DownloadOutlined, HeartOutlined, HistoryOutlined, ReloadOutlined
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

  const latest = items[0];
  return (
    <section>
      <Space align="start" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 18 }}>
        <div>
          <Text className="care-eyebrow">PERSONALIZED WELLNESS</Text>
          <Title level={3} style={{ margin: '5px 0' }}><HeartOutlined /> Necessary health guidance</Title>
          <Paragraph type="secondary" style={{ margin: 0 }}>A short list based on your latest medical profile.</Paragraph>
        </div>
        <Button type="primary" icon={<ReloadOutlined />} onClick={generate} loading={working}>Generate new</Button>
      </Space>

      {error && <Alert type="error" showIcon message={error} closable onClose={() => setError('')} />}
      {loading ? <Skeleton active paragraph={{ rows: 5 }} /> : latest ? (
        <>
          <Card
            size="small"
            title={<Space><Tag color="blue">Latest</Tag><Text>{new Date(latest.generatedAt).toLocaleString()}</Text></Space>}
            extra={<Button icon={<DownloadOutlined />} onClick={() => download(latest._id)}>PDF</Button>}
          >
            <div className="recommendation-content">{latest.content}</div>
          </Card>
          {items.length > 1 && (
            <Card size="small" title={<Space><HistoryOutlined />Previous recommendations</Space>} style={{ marginTop: 14 }}>
              <List
                dataSource={items.slice(1)}
                renderItem={(item) => (
                  <List.Item actions={[<Button type="link" icon={<DownloadOutlined />} onClick={() => download(item._id)}>PDF</Button>]}>
                    {new Date(item.generatedAt).toLocaleString()}
                  </List.Item>
                )}
              />
            </Card>
          )}
        </>
      ) : (
        <Empty description="Complete your medical profile, then generate your first recommendation.">
          <Button type="primary" onClick={generate} loading={working}>Generate recommendation</Button>
        </Empty>
      )}
    </section>
  );
};

export default Recommendations;
