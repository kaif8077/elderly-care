import { useEffect, useState } from 'react';
import { Alert, Button, Card, Empty, List, Skeleton, Space, Tag, Typography } from 'antd';
import { AlertOutlined, ArrowRightOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const readable = (value) => String(value || '').replaceAll('_', ' ');

const EmergencyAlertSummary = () => {
  const navigate = useNavigate();
  const [state, setState] = useState({ loading: true, error: '', alerts: [] });

  useEffect(() => {
    let active = true;
    api
      .get('/api/emergency-alerts/mine', { params: { limit: 5, status: 'open' } })
      .then(({ data }) => {
        if (active) setState({ loading: false, error: '', alerts: data.alerts });
      })
      .catch((error) => {
        if (active)
          setState({
            loading: false,
            error: error.response?.data?.message || 'Unable to load emergency alerts.',
            alerts: []
          });
      });
    return () => {
      active = false;
    };
  }, []);

  return (
    <Card
      className="care-section-card"
      title={
        <Space>
          <AlertOutlined /> Active emergency alerts
        </Space>
      }
      extra={
        <Button type="link" onClick={() => navigate('/emergency-alerts')}>
          View history <ArrowRightOutlined />
        </Button>
      }
    >
      {state.loading && <Skeleton active paragraph={{ rows: 2 }} />}
      {state.error && <Alert type="error" showIcon message={state.error} />}
      {!state.loading && !state.error && !state.alerts.length && (
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No active emergency alerts" />
      )}
      {!state.loading && !state.error && Boolean(state.alerts.length) && (
        <List
          dataSource={state.alerts}
          renderItem={(item) => (
            <List.Item
              actions={[
                <Button key="view" onClick={() => navigate(`/emergency-alerts?alert=${item.id}`)}>
                  View alert
                </Button>
              ]}
            >
              <List.Item.Meta
                title={
                  <Space wrap>
                    <Typography.Text strong>{readable(item.emergencyType)}</Typography.Text>
                    <Tag color="orange">{readable(item.status)}</Tag>
                  </Space>
                }
                description={`${item.elderlyPerson?.name || 'ElderlyCare member'} · ${new Date(item.createdAt).toLocaleString()}`}
              />
            </List.Item>
          )}
        />
      )}
    </Card>
  );
};

export default EmergencyAlertSummary;
