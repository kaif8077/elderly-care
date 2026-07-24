import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Alert, Avatar, Button, Card, Empty, Input, Progress, Select, Space, Table, Tag, Typography
} from 'antd';
import { EyeOutlined, ReloadOutlined, SearchOutlined, UserOutlined } from '@ant-design/icons';
import adminApi from '../../services/adminApi';

const { Text } = Typography;
const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const tagColor = (status) => ['active', 'complete'].includes(status) ? 'blue' : ['suspended', 'revoked'].includes(status) ? 'orange' : 'default';

const AdminUsers = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [data, setData] = useState({ users: [], pagination: { page: 1, pages: 1, total: 0, limit: 10 } });
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
      setData((await adminApi.get('/users', { params: query })).data);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to load users.');
    } finally {
      setLoading(false);
    }
  }, [query]);

  useEffect(() => { load(); }, [load]);

  const columns = [
    {
      title: 'User', key: 'user', fixed: 'left', width: 220,
      render: (_, user) => <Space><Avatar icon={<UserOutlined />} /> <div><Text strong>{user.name}</Text><br /><Text type="secondary">{user.elderlyCareId || 'ID pending'}</Text></div></Space>
    },
    { title: 'Contact', key: 'contact', width: 240, render: (_, user) => <div><a href={`mailto:${user.email}`}>{user.email}</a><br /><Text type="secondary">{user.phone || 'No phone'}</Text></div> },
    { title: 'Blood group', dataIndex: 'bloodGroup', key: 'bloodGroup', render: (value) => value || '—' },
    { title: 'Profile', dataIndex: 'profileCompletion', key: 'profileCompletion', width: 150, render: (value) => <Progress percent={value || 0} size="small" strokeColor="#0066ff" /> },
    { title: 'QR', dataIndex: 'qrStatus', key: 'qrStatus', render: (value) => <Tag color={tagColor(value)}>{value || 'missing'}</Tag> },
    { title: 'Account', dataIndex: 'accountStatus', key: 'accountStatus', render: (value) => <Tag color={tagColor(value)}>{value}</Tag> },
    { title: 'Registered', dataIndex: 'createdAt', key: 'createdAt', render: (value) => value ? new Date(value).toLocaleDateString() : '—' },
    { title: 'Action', key: 'action', fixed: 'right', render: (_, user) => <Link to={`/admin/users/${user.id}`}><Button type="link" icon={<EyeOutlined />}>View</Button></Link> }
  ];

  return (
    <Space direction="vertical" size={18} style={{ width: '100%' }}>
      {error && <Alert type="error" showIcon message={error} action={<Button onClick={load}>Retry</Button>} />}
      <Card>
        <Space wrap>
          <Space.Compact>
            <Input value={search} onChange={(event) => setSearch(event.target.value)} onPressEnter={() => updateQuery({ search: search.trim() })} prefix={<SearchOutlined />} placeholder="Name, email, or phone" allowClear />
            <Button type="primary" onClick={() => updateQuery({ search: search.trim() })}>Search</Button>
          </Space.Compact>
          <Select allowClear value={query.accountStatus} onChange={(value) => updateQuery({ accountStatus: value })} placeholder="Account status" style={{ width: 150 }} options={['active', 'inactive', 'suspended', 'archived'].map((value) => ({ value, label: value }))} />
          <Select allowClear value={query.profileStatus} onChange={(value) => updateQuery({ profileStatus: value })} placeholder="Profile status" style={{ width: 150 }} options={['complete', 'incomplete'].map((value) => ({ value, label: value }))} />
          <Select allowClear value={query.bloodGroup} onChange={(value) => updateQuery({ bloodGroup: value })} placeholder="Blood group" style={{ width: 140 }} options={bloodGroups.map((value) => ({ value, label: value }))} />
          <Select allowClear value={query.qrStatus} onChange={(value) => updateQuery({ qrStatus: value })} placeholder="QR status" style={{ width: 140 }} options={['active', 'revoked', 'generated', 'missing'].map((value) => ({ value, label: value }))} />
          <Button icon={<ReloadOutlined />} onClick={load}>Refresh</Button>
        </Space>
      </Card>
      <Card>
        <Table
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={data.users}
          scroll={{ x: 1100 }}
          locale={{ emptyText: <Empty description="No users found" /> }}
          pagination={{
            current: data.pagination.page,
            pageSize: data.pagination.limit,
            total: data.pagination.total,
            showSizeChanger: true,
            pageSizeOptions: [5, 10, 20, 50],
            showTotal: (total) => `${total} users`,
            onChange: (page, limit) => updateQuery({ page: String(page), limit: String(limit) })
          }}
        />
      </Card>
    </Space>
  );
};

export default AdminUsers;
