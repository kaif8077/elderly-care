import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Alert, Button, Card, Descriptions, Drawer, Empty, Input, Select, Space, Table, Tag, Typography } from 'antd';
import { ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import adminApi from '../../services/adminApi';

const { Text } = Typography;

const AdminAuditLogs = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [data, setData] = useState({ logs: [], pagination: { page: 1, pages: 1, total: 0, limit: 10 } });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState(null);
  const query = useMemo(() => Object.fromEntries(searchParams.entries()), [searchParams]);

  const updateQuery = (updates) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, value]) => value ? next.set(key, value) : next.delete(key));
    if (!Object.hasOwn(updates, 'page')) next.set('page', '1');
    setSearchParams(next);
  };

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setData((await adminApi.get('/audit-logs', { params: { limit: 10, ...query } })).data);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to load audit logs.');
    } finally {
      setLoading(false);
    }
  }, [query]);

  useEffect(() => { load(); }, [load]);

  const columns = [
    { title: 'Date', dataIndex: 'createdAt', key: 'createdAt', width: 180, render: (value) => new Date(value).toLocaleString() },
    { title: 'Admin', key: 'actor', width: 210, render: (_, log) => <div><Text strong>{log.actor?.name || 'System'}</Text><br /><Text type="secondary">{log.actor?.email || log.actorRole || 'Unknown'}</Text></div> },
    { title: 'Action', dataIndex: 'action', key: 'action', render: (value) => String(value).replaceAll('_', ' ') },
    { title: 'Resource', key: 'resource', render: (_, log) => <div>{log.resourceType}<br /><Text type="secondary">{log.resourceId || '—'}</Text></div> },
    { title: 'Result', dataIndex: 'success', key: 'success', render: (value) => <Tag color={value ? 'blue' : 'orange'}>{value ? 'Succeeded' : 'Failed'}</Tag> },
    { title: 'Reason / description', key: 'description', width: 300, render: (_, log) => log.reason || log.description || '—' },
    { title: 'Action', key: 'details', fixed: 'right', width: 100, render: (_, log) => <Button onClick={() => setSelected(log)}>Details</Button> }
  ];

  return (
    <Space direction="vertical" size={18} style={{ width: '100%' }}>
      <Alert type="info" showIcon message="Administrative activity" description="Passwords, tokens, and complete medical records are not stored in audit logs." />
      {error && <Alert type="error" showIcon message={error} action={<Button onClick={load}>Retry</Button>} />}
      <Card>
        <Space wrap>
          <Space.Compact className="care-inline-action">
            <Input value={search} onChange={(event) => setSearch(event.target.value)} onPressEnter={() => updateQuery({ search: search.trim() })} prefix={<SearchOutlined />} placeholder="Action, resource, or reason" allowClear />
            <Button type="primary" onClick={() => updateQuery({ search: search.trim() })}>Search</Button>
          </Space.Compact>
          <Select allowClear value={query.success} onChange={(value) => updateQuery({ success: value })} placeholder="Result" style={{ width: 140 }} options={[{ value: 'true', label: 'Succeeded' }, { value: 'false', label: 'Failed' }]} />
          <Button icon={<ReloadOutlined />} onClick={load}>Refresh</Button>
        </Space>
      </Card>
      <Drawer width={720} title="Audit event details" open={Boolean(selected)} onClose={() => setSelected(null)}>
        {selected && <Space direction="vertical" size={18} style={{ width: '100%' }}>
          <Descriptions bordered size="small" column={1} items={[
            { key: 'date', label: 'Date and time', children: new Date(selected.createdAt).toLocaleString() },
            { key: 'admin', label: 'Administrator', children: `${selected.actor?.name || 'System'}${selected.actor?.email ? ` · ${selected.actor.email}` : ''}` },
            { key: 'action', label: 'Action', children: String(selected.action).replaceAll('_', ' ') },
            { key: 'resource', label: 'Resource', children: `${selected.resourceType || 'Unknown'}${selected.resourceId ? ` · ${selected.resourceId}` : ''}` },
            { key: 'result', label: 'Result', children: <Tag color={selected.success ? 'blue' : 'orange'}>{selected.success ? 'Succeeded' : 'Failed'}</Tag> },
            { key: 'reason', label: 'Reason / description', children: selected.reason || selected.description || 'Not provided' },
            { key: 'device', label: 'Device', children: selected.userAgent || 'Not recorded' }
          ]} />
          <Alert type="info" showIcon message="Sensitive values are excluded" description="Passwords, tokens, and complete medical records are never displayed in audit details." />
        </Space>}
      </Drawer>
      <Card>
        <Table
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={data.logs}
          scroll={{ x: 1050 }}
          locale={{ emptyText: <Empty description="No audit events found" /> }}
          pagination={{
            current: data.pagination.page,
            pageSize: data.pagination.limit,
            total: data.pagination.total,
            showSizeChanger: true,
            pageSizeOptions: [10, 20, 50, 100],
            showTotal: (total) => `${total} events`,
            onChange: (page, limit) => updateQuery({ page: String(page), limit: String(limit) })
          }}
        />
      </Card>
    </Space>
  );
};

export default AdminAuditLogs;
