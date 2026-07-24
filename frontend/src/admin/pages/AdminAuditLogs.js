import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Alert, Button, Card, Empty, Input, Select, Space, Table, Tag, Typography } from 'antd';
import { ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import adminApi from '../../services/adminApi';

const { Text } = Typography;

const AdminAuditLogs = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [data, setData] = useState({ logs: [], pagination: { page: 1, pages: 1, total: 0, limit: 20 } });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
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
      setData((await adminApi.get('/audit-logs', { params: query })).data);
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
    { title: 'Reason / description', key: 'description', width: 300, render: (_, log) => log.reason || log.description || '—' }
  ];

  return (
    <Space direction="vertical" size={18} style={{ width: '100%' }}>
      <Alert type="info" showIcon message="Administrative activity" description="Passwords, tokens, and complete medical records are not stored in audit logs." />
      {error && <Alert type="error" showIcon message={error} action={<Button onClick={load}>Retry</Button>} />}
      <Card>
        <Space wrap>
          <Space.Compact>
            <Input value={search} onChange={(event) => setSearch(event.target.value)} onPressEnter={() => updateQuery({ search: search.trim() })} prefix={<SearchOutlined />} placeholder="Action, resource, or reason" allowClear />
            <Button type="primary" onClick={() => updateQuery({ search: search.trim() })}>Search</Button>
          </Space.Compact>
          <Select allowClear value={query.success} onChange={(value) => updateQuery({ success: value })} placeholder="Result" style={{ width: 140 }} options={[{ value: 'true', label: 'Succeeded' }, { value: 'false', label: 'Failed' }]} />
          <Button icon={<ReloadOutlined />} onClick={load}>Refresh</Button>
        </Space>
      </Card>
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
