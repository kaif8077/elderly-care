import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert, Button, Card, Col, Descriptions, Empty, List, Modal, Pagination, Row, Select, Space, Spin, Tag, Timeline, Typography, message
} from 'antd';
import { AlertOutlined, EnvironmentOutlined, PhoneOutlined, ReloadOutlined } from '@ant-design/icons';
import { useSearchParams } from 'react-router-dom';
import api from '../services/api';

const ACTIONS = [
  { value: 'received', label: 'I received this alert' },
  { value: 'calling', label: 'I am calling the person' },
  { value: 'going_to_location', label: 'I am going to the location' },
  { value: 'services_contacted', label: 'Emergency services contacted' },
  { value: 'resolved', label: 'Alert resolved' }
];
const readable = (value) => String(value || 'Not available').replaceAll('_', ' ');
const statusColor = (status) => status === 'resolved' ? 'blue' : status === 'failed' ? 'red' : status === 'acknowledged' ? 'cyan' : 'orange';

const EmergencyAlerts = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [data, setData] = useState({ alerts: [], pagination: { page: 1, total: 0, limit: 10 } });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [action, setAction] = useState();
  const [saving, setSaving] = useState(false);
  const selectedId = searchParams.get('alert');
  const page = Math.max(Number(searchParams.get('page')) || 1, 1);
  const status = searchParams.get('status') || undefined;

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try { setData((await api.get('/api/emergency-alerts/mine', { params: { page, limit: 10, status } })).data); }
    catch (requestError) { setError(requestError.response?.data?.message || 'Unable to load emergency alerts.'); }
    finally { setLoading(false); }
  }, [page, status]);

  const loadDetail = useCallback(async (id) => {
    if (!id) { setDetail(null); return; }
    setDetailLoading(true);
    try { setDetail((await api.get(`/api/emergency-alerts/mine/${id}`)).data.alert); }
    catch (requestError) { message.error(requestError.response?.data?.message || 'Unable to load alert details.'); setSearchParams({ page: String(page), ...(status ? { status } : {}) }); }
    finally { setDetailLoading(false); }
  }, [page, setSearchParams, status]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { loadDetail(selectedId); }, [loadDetail, selectedId]);

  const timeline = useMemo(() => {
    if (!detail) return [];
    return [
      { color: 'blue', children: `Alert created · ${new Date(detail.createdAt).toLocaleString()}` },
      ...(detail.deliveryStatuses || []).map((delivery) => ({ color: delivery.status === 'failed' ? 'red' : 'blue', children: `${readable(delivery.channel)} notification ${readable(delivery.status)}` })),
      ...(detail.acknowledgementHistory || []).map((entry) => ({ color: entry.action === 'resolved' ? 'blue' : 'orange', children: `${entry.actorName || 'Emergency contact'}: ${readable(entry.action)} · ${new Date(entry.createdAt).toLocaleString()}` }))
    ];
  }, [detail]);

  const acknowledge = async () => {
    if (!action || !detail) return;
    setSaving(true);
    try {
      await api.patch(`/api/emergency-alerts/mine/${detail.id}/acknowledge`, { action });
      message.success(action === 'resolved' ? 'Alert resolved.' : 'Acknowledgement saved.');
      setAction(); await Promise.all([load(), loadDetail(detail.id)]);
    } catch (requestError) { message.error(requestError.response?.data?.message || 'Unable to save acknowledgement.'); }
    finally { setSaving(false); }
  };

  return (
    <main className="care-page">
      <Card className="care-section-card">
        <Row justify="space-between" align="middle" gutter={[16, 16]}>
          <Col><Typography.Title level={2}><AlertOutlined /> Emergency alerts</Typography.Title><Typography.Paragraph type="secondary">Review alerts, delivery status, location, and care-team acknowledgements.</Typography.Paragraph></Col>
          <Col><Space wrap><Select allowClear value={status} placeholder="Filter status" style={{ width: 180 }} onChange={(value) => setSearchParams(value ? { status: value } : {})} options={['sent', 'failed', 'acknowledged', 'resolved', 'false_alarm'].map((value) => ({ value, label: readable(value) }))} /><Button icon={<ReloadOutlined />} onClick={load}>Refresh</Button></Space></Col>
        </Row>
      </Card>
      {error && <Alert type="error" showIcon message={error} action={<Button onClick={load}>Retry</Button>} />}
      <Card className="care-section-card">
        <Spin spinning={loading}>
          <List
            dataSource={data.alerts}
            locale={{ emptyText: <Empty description="No emergency alerts found" /> }}
            renderItem={(item) => <List.Item actions={[<Button key="details" onClick={() => setSearchParams({ alert: item.id, page: String(page), ...(status ? { status } : {}) })}>View details</Button>]}><List.Item.Meta title={<Space wrap><Typography.Text strong>{readable(item.emergencyType)}</Typography.Text><Tag color={statusColor(item.status)}>{readable(item.status)}</Tag></Space>} description={`${item.elderlyPerson?.name || 'ElderlyCare member'} · ${new Date(item.createdAt).toLocaleString()}${item.responderMessage ? ` · ${item.responderMessage}` : ''}`} /></List.Item>}
          />
          <Pagination current={data.pagination.page} total={data.pagination.total} pageSize={data.pagination.limit} hideOnSinglePage onChange={(next) => setSearchParams({ page: String(next), ...(status ? { status } : {}) })} />
        </Spin>
      </Card>
      <Modal open={Boolean(selectedId)} width={760} title="Emergency alert details" footer={null} onCancel={() => setSearchParams({ page: String(page), ...(status ? { status } : {}) })}>
        <Spin spinning={detailLoading}>
          {detail && <Space direction="vertical" size={18} style={{ width: '100%' }}>
            <Descriptions bordered size="small" column={{ xs: 1, sm: 2 }} items={[
              { key: 'person', label: 'Elderly person', children: detail.elderlyPerson?.name || '—' },
              { key: 'type', label: 'Situation', children: readable(detail.emergencyType) },
              { key: 'status', label: 'Status', children: <Tag color={statusColor(detail.status)}>{readable(detail.status)}</Tag> },
              { key: 'responder', label: 'Responder', children: detail.responderName || 'Not provided' },
              { key: 'phone', label: 'Responder phone', children: detail.responderPhone ? <a href={`tel:${detail.responderPhone}`}><PhoneOutlined /> {detail.responderPhone}</a> : 'Not provided' },
              { key: 'location', label: 'Location', children: detail.location?.mapUrl ? <a href={detail.location.mapUrl} target="_blank" rel="noreferrer"><EnvironmentOutlined /> Open map</a> : 'Not shared' },
              { key: 'message', label: 'Responder message', span: 2, children: detail.responderMessage || 'Not provided' }
            ]} />
            <Card size="small" title="Alert timeline"><Timeline items={timeline} /></Card>
            {!['resolved', 'false_alarm'].includes(detail.status) && <Card size="small" title="Update your response"><Space wrap><Select value={action} onChange={setAction} placeholder="Choose an action" style={{ minWidth: 260 }} options={ACTIONS} /><Button type="primary" loading={saving} disabled={!action} onClick={acknowledge}>Save acknowledgement</Button></Space></Card>}
          </Space>}
        </Spin>
      </Modal>
    </main>
  );
};

export default EmergencyAlerts;
