import { useCallback, useEffect, useState } from 'react';
import {
  Alert, Button, Card, Empty, Input, Modal, Rate, Space, Table, Typography
} from 'antd';
import { EyeOutlined, ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import adminApi from '../../services/adminApi';

const { Paragraph, Text } = Typography;

const AdminSubmissionsTable = ({ endpoint, type }) => {
  const [data, setData] = useState({ items: [], pagination: { page: 1, pages: 1, total: 0, limit: 20 } });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState({ page: 1, limit: 20, search: '' });
  const [selected, setSelected] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await adminApi.get(endpoint, { params: query });
      setData(response.data);
    } catch (requestError) {
      setError(requestError.response?.data?.message || `Unable to load ${type}.`);
    } finally {
      setLoading(false);
    }
  }, [endpoint, query, type]);

  useEffect(() => { load(); }, [load]);

  const contentKey = type === 'feedback' ? 'comments' : 'message';
  const columns = [
    { title: 'Submitted', dataIndex: 'createdAt', key: 'createdAt', render: (value) => new Date(value).toLocaleString(), sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt) },
    { title: 'Name', dataIndex: 'name', key: 'name', render: (value) => <Text strong>{value}</Text> },
    { title: 'Email', dataIndex: 'email', key: 'email', render: (value) => <a href={`mailto:${value}`}>{value}</a> },
    ...(type === 'feedback' ? [{ title: 'Rating', dataIndex: 'rating', key: 'rating', render: (value) => <Rate disabled value={value} /> }] : []),
    { title: type === 'feedback' ? 'Comments' : 'Message', dataIndex: contentKey, key: contentKey, ellipsis: true },
    { title: 'Action', key: 'action', render: (_, record) => <Button type="link" icon={<EyeOutlined />} onClick={() => setSelected(record)}>View</Button> }
  ];

  return (
    <Space direction="vertical" size={18} style={{ width: '100%' }}>
      {error && <Alert type="error" showIcon message={error} action={<Button onClick={load}>Retry</Button>} />}
      <Card>
        <Space.Compact style={{ width: '100%', maxWidth: 520 }}>
          <Input value={search} onChange={(event) => setSearch(event.target.value)} onPressEnter={() => setQuery((current) => ({ ...current, page: 1, search: search.trim() }))} prefix={<SearchOutlined />} placeholder="Search name, email, or message" allowClear />
          <Button type="primary" onClick={() => setQuery((current) => ({ ...current, page: 1, search: search.trim() }))}>Search</Button>
          <Button icon={<ReloadOutlined />} onClick={load}>Refresh</Button>
        </Space.Compact>
      </Card>
      <Card>
        <Table
          rowKey="_id"
          loading={loading}
          columns={columns}
          dataSource={data.items}
          scroll={{ x: 820 }}
          locale={{ emptyText: <Empty description={`No ${type} submissions found`} /> }}
          pagination={{
            current: data.pagination.page,
            pageSize: data.pagination.limit,
            total: data.pagination.total,
            showSizeChanger: true,
            pageSizeOptions: [10, 20, 50, 100],
            showTotal: (total) => `${total} submissions`,
            onChange: (page, limit) => setQuery((current) => ({ ...current, page, limit }))
          }}
        />
      </Card>
      <Modal title={type === 'feedback' ? 'Feedback details' : 'Contact message'} open={Boolean(selected)} onCancel={() => setSelected(null)} footer={<Button onClick={() => setSelected(null)}>Close</Button>}>
        {selected && <Space direction="vertical" size={14} style={{ width: '100%' }}>
          <div><Text type="secondary">Name</Text><br /><Text strong>{selected.name}</Text></div>
          <div><Text type="secondary">Email</Text><br /><a href={`mailto:${selected.email}`}>{selected.email}</a></div>
          {type === 'feedback' && <div><Text type="secondary">Rating</Text><br /><Rate disabled value={selected.rating} /></div>}
          <div><Text type="secondary">{type === 'feedback' ? 'Comments' : 'Message'}</Text><Paragraph>{selected[contentKey]}</Paragraph></div>
          <Text type="secondary">Submitted {new Date(selected.createdAt).toLocaleString()}</Text>
        </Space>}
      </Modal>
    </Space>
  );
};

export default AdminSubmissionsTable;
