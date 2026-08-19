import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert, Button, Card, Descriptions, Drawer, Empty, Select, Space, Table, Tag, Timeline, Typography
} from 'antd';
import { EnvironmentOutlined, ReloadOutlined } from '@ant-design/icons';
import { useSearchParams } from 'react-router-dom';
import adminApi from '../../services/adminApi';

const readable = (value) => String(value || 'Not available').replaceAll('_', ' ');
const statusColor = (status) => status === 'resolved' ? 'blue' : status === 'failed' ? 'red' : status === 'acknowledged' ? 'cyan' : 'orange';

const AdminEmergencyAlerts = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [data, setData] = useState({ alerts: [], pagination: { page: 1, limit: 10, total: 0 } });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const query = useMemo(() => Object.fromEntries(searchParams.entries()), [searchParams]);

  const updateQuery = (updates) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, value]) => value ? next.set(key, value) : next.delete(key));
    if (!Object.hasOwn(updates, 'page')) next.set('page', '1');
    setSearchParams(next);
  };

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try { setData((await adminApi.get('/emergency-alerts', { params: { limit: 10, ...query } })).data); }
    catch (requestError) { setError(requestError.response?.data?.message || 'Unable to load emergency alerts.'); }
    finally { setLoading(false); }
  }, [query]);

  useEffect(() => { load(); }, [load]);

  const openDetail = async (id) => {
    setDetailLoading(true); setDetail({ id });
    try { setDetail((await adminApi.get(`/emergency-alerts/${id}`)).data.alert); }
    catch (requestError) { setError(requestError.response?.data?.message || 'Unable to load alert details.'); setDetail(null); }
    finally { setDetailLoading(false); }
  };

  const columns = [
    { title: 'Created', dataIndex: 'createdAt', width: 180, render: (value) => new Date(value).toLocaleString() },
    { title: 'ElderlyCare ID', dataIndex: 'elderlyCareId', width: 150, render: (value) => value || '—' },
    { title: 'Elderly person', key: 'person', width: 210, render: (_, row) => <div><Typography.Text strong>{row.elderlyPerson?.name || 'Unknown'}</Typography.Text><br /><Typography.Text type="secondary">{row.elderlyPerson?.email || '—'}</Typography.Text></div> },
    { title: 'Situation', dataIndex: 'emergencyType', render: readable },
    { title: 'Delivery', key: 'delivery', render: (_, row) => (row.deliveryStatuses || []).map((item) => <Tag key={item.channel} color={item.status === 'failed' ? 'red' : 'blue'}>{item.channel}: {item.status}</Tag>) },
    { title: 'Status', dataIndex: 'status', render: (value) => <Tag color={statusColor(value)}>{readable(value)}</Tag> },
    { title: 'Acknowledgement', dataIndex: 'acknowledgementAction', render: (value) => value ? readable(value) : 'Waiting' },
    { title: 'Actions', fixed: 'right', width: 110, render: (_, row) => <Button onClick={() => openDetail(row.id)}>Details</Button> }
  ];

  const timeline = detail?.id && detail.createdAt ? [
    { color: 'blue', children: `Alert created · ${new Date(detail.createdAt).toLocaleString()}` },
    ...(detail.deliveryStatuses || []).map((item) => ({ color: item.status === 'failed' ? 'red' : 'blue', children: `${readable(item.channel)} notification ${readable(item.status)}` })),
    ...(detail.acknowledgementHistory || []).map((item) => ({ color: item.action === 'resolved' ? 'blue' : 'orange', children: `${item.actorName || item.actorId?.name || 'Emergency contact'}: ${readable(item.action)} · ${new Date(item.createdAt).toLocaleString()}` }))
  ] : [];

  return (
    <Space direction="vertical" size={18} style={{ width: '100%' }}>
      <Alert type="info" showIcon message="Emergency alert monitoring" description="Review delivery and acknowledgement progress. Administrators monitor alerts but do not acknowledge on behalf of family members." />
      {error && <Alert type="error" showIcon message={error} action={<Button onClick={load}>Retry</Button>} />}
      <Card><Space wrap><Select allowClear value={query.status} placeholder="Alert status" style={{ width: 180 }} onChange={(value) => updateQuery({ status: value })} options={['sent', 'failed', 'acknowledged', 'resolved', 'false_alarm'].map((value) => ({ value, label: readable(value) }))} /><Select allowClear value={query.emergencyType} placeholder="Situation type" style={{ width: 210 }} onChange={(value) => updateQuery({ emergencyType: value })} options={['person_found', 'medical_emergency', 'fall', 'lost_confused', 'accident', 'other'].map((value) => ({ value, label: readable(value) }))} /><Button icon={<ReloadOutlined />} onClick={load}>Refresh</Button></Space></Card>
      <Card><Table rowKey="id" loading={loading} dataSource={data.alerts} columns={columns} scroll={{ x: 1250 }} locale={{ emptyText: <Empty description="No emergency alerts found" /> }} pagination={{ current: data.pagination.page, pageSize: data.pagination.limit, total: data.pagination.total, showSizeChanger: true, pageSizeOptions: [10, 20, 50], showTotal: (total) => `${total} alerts`, onChange: (page, limit) => updateQuery({ page: String(page), limit: String(limit) }) }} /></Card>
      <Drawer width={720} open={Boolean(detail)} loading={detailLoading} title="Emergency alert details" onClose={() => setDetail(null)}>
        {detail?.createdAt && <Space direction="vertical" size={18} style={{ width: '100%' }}>
          <Descriptions bordered size="small" column={1} items={[
            { key: 'person', label: 'Elderly person', children: `${detail.elderlyPerson?.name || 'Unknown'}${detail.elderlyCareId ? ` · ${detail.elderlyCareId}` : ''}` },
            { key: 'type', label: 'Situation', children: readable(detail.emergencyType) },
            { key: 'status', label: 'Status', children: <Tag color={statusColor(detail.status)}>{readable(detail.status)}</Tag> },
            { key: 'responder', label: 'Responder', children: detail.responderName || 'Not provided' },
            { key: 'phone', label: 'Responder phone', children: detail.responderPhone || 'Not provided' },
            { key: 'message', label: 'Message', children: detail.responderMessage || 'Not provided' },
            { key: 'location', label: 'Location', children: detail.location?.mapUrl ? <a href={detail.location.mapUrl} target="_blank" rel="noreferrer"><EnvironmentOutlined /> Open map</a> : 'Not shared' }
          ]} />
          <Card size="small" title="Alert timeline"><Timeline items={timeline} /></Card>
        </Space>}
      </Drawer>
    </Space>
  );
};

export default AdminEmergencyAlerts;
