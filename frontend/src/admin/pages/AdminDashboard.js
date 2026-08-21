import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Button,
  Card,
  Col,
  Progress,
  Row,
  Skeleton,
  Space,
  Statistic,
  Tag,
  Typography
} from 'antd';
import {
  AlertOutlined,
  IdcardOutlined,
  ReloadOutlined,
  UserAddOutlined,
  UserOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import adminApi from '../../services/adminApi';
const items = (data) => [
  ['Registered users', data.users.total, UserOutlined, '/admin/users'],
  [
    'Registered today',
    data.users.registeredToday,
    UserAddOutlined,
    '/admin/users?sortBy=createdAt'
  ],
  [
    'Complete profiles',
    data.profiles.complete,
    IdcardOutlined,
    '/admin/users?profileStatus=complete'
  ],
  [
    'Incomplete profiles',
    data.profiles.incomplete,
    IdcardOutlined,
    '/admin/users?profileStatus=incomplete'
  ],
  ['Alerts today', data.emergencyAlerts.today, AlertOutlined, '/admin/emergency-alerts'],
  [
    'Unresolved alerts',
    data.emergencyAlerts.unresolved,
    AlertOutlined,
    '/admin/emergency-alerts?status=open'
  ]
];
const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setData((await adminApi.get('/dashboard')).data);
    } catch (e) {
      setError(e.response?.data?.message || 'Unable to load dashboard statistics.');
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    load();
  }, [load]);
  if (loading)
    return (
      <Row gutter={[16, 16]}>
        {Array.from({ length: 8 }, (_, i) => (
          <Col xs={24} sm={12} xl={6} key={i}>
            <Card>
              <Skeleton active paragraph={{ rows: 1 }} />
            </Card>
          </Col>
        ))}
      </Row>
    );
  if (error)
    return (
      <Alert
        type="error"
        showIcon
        message="Dashboard unavailable"
        description={error}
        action={<Button onClick={load}>Try again</Button>}
      />
    );
  return (
    <div>
      <Row justify="space-between" align="middle" gutter={[16, 16]} style={{ marginBottom: 20 }}>
        <Col>
          <Typography.Paragraph style={{ margin: 0 }}>
            Operational overview without exposing complete medical information.
          </Typography.Paragraph>
          <Typography.Text type="secondary">
            Last refreshed: {new Date(data.refreshedAt).toLocaleString()}
          </Typography.Text>
        </Col>
        <Col>
          <Button icon={<ReloadOutlined />} onClick={load}>
            Refresh
          </Button>
        </Col>
      </Row>
      <Row gutter={[16, 16]}>
        {items(data).map(([label, value, Icon, to]) => (
          <Col xs={24} sm={12} xl={6} key={label}>
            <Card
              hoverable
              onClick={() => navigate(to)}
              style={{ height: '100%', cursor: 'pointer' }}
            >
              <Statistic
                title={label}
                value={value}
                prefix={<Icon style={{ color: '#0066ff' }} />}
              />
            </Card>
          </Col>
        ))}
      </Row>
      <Row gutter={[20, 20]} style={{ marginTop: 20 }}>
        <Col xs={24} lg={14}>
          <Card title="Registration activity · Last six months">
            <Row gutter={[12, 16]} align="bottom">
              {data.registrationsByMonth.map((item) => (
                <Col flex="1" key={item.key} style={{ textAlign: 'center' }}>
                  <Progress
                    type="dashboard"
                    size={88}
                    percent={Math.min(
                      100,
                      Math.round(
                        (item.count /
                          Math.max(...data.registrationsByMonth.map((x) => x.count), 1)) *
                          100
                      )
                    )}
                    format={() => item.count}
                    strokeColor="#0066ff"
                  />
                  <div>
                    <Typography.Text type="secondary">{item.label}</Typography.Text>
                  </div>
                </Col>
              ))}
            </Row>
          </Card>
        </Col>
        <Col xs={24} lg={10}>
          <Card title="System readiness">
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              <Space style={{ justifyContent: 'space-between', width: '100%' }}>
                Secure QR management<Tag color="blue">Available</Tag>
              </Space>
              <Space style={{ justifyContent: 'space-between', width: '100%' }}>
                Emergency alert tracking<Tag color="blue">Available</Tag>
              </Space>
              <Space style={{ justifyContent: 'space-between', width: '100%' }}>
                Legacy QR migrations
                <Tag color={data.qrCodes.legacy ? 'orange' : 'blue'}>
                  {data.qrCodes.legacy || 'Complete'}
                </Tag>
              </Space>
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  );
};
export default AdminDashboard;
