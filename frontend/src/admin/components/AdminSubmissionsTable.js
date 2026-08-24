import { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Button,
  Card,
  Col,
  Descriptions,
  Drawer,
  Empty,
  Input,
  Row,
  Space,
  Table,
  Typography
} from 'antd';
import { EyeOutlined, ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import adminApi from '../../services/adminApi';

const { Paragraph, Text } = Typography;

const AdminSubmissionsTable = ({ endpoint, type }) => {
  const [data, setData] = useState({
    items: [],
    pagination: { page: 1, pages: 1, total: 0, limit: 10 }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState({ page: 1, limit: 10, search: '' });
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

  useEffect(() => {
    load();
  }, [load]);

  const columns = [
    {
      title: 'Submitted',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (value) => new Date(value).toLocaleString(),
      sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (value) => <Text strong>{value}</Text>
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      render: (value) => <a href={`mailto:${value}`}>{value}</a>
    },
    {
      title: 'Phone',
      dataIndex: 'phone',
      key: 'phone',
      render: (value) => (value ? <a href={`tel:${value}`}>{value}</a> : '—')
    },
    { title: 'Message', dataIndex: 'message', key: 'message', ellipsis: true },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Button type="link" icon={<EyeOutlined />} onClick={() => setSelected(record)}>
          View
        </Button>
      )
    }
  ];

  return (
    <Space direction="vertical" size={18} style={{ width: '100%' }}>
      {error && (
        <Alert
          type="error"
          showIcon
          message={error}
          action={<Button onClick={load}>Retry</Button>}
        />
      )}
      <Card size="small">
        <Row gutter={[12, 12]} align="middle">
          <Col xs={24} lg={10}>
            <Space.Compact block>
              <Input
                size="middle"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                onPressEnter={() =>
                  setQuery((current) => ({ ...current, page: 1, search: search.trim() }))
                }
                prefix={<SearchOutlined />}
                placeholder="Search name, email, or message"
                allowClear
              />
              <Button
                size="middle"
                type="primary"
                onClick={() =>
                  setQuery((current) => ({ ...current, page: 1, search: search.trim() }))
                }
              >
                Search
              </Button>
            </Space.Compact>
          </Col>
          <Col xs={24} sm={12} lg={3}>
            <Button size="middle" block icon={<ReloadOutlined />} onClick={load}>
              Refresh
            </Button>
          </Col>
        </Row>
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
      <Drawer
        width={720}
        title="Contact message details"
        open={Boolean(selected)}
        onClose={() => setSelected(null)}
      >
        {selected && (
          <Space direction="vertical" size={18} style={{ width: '100%' }}>
            <Descriptions
              bordered
              size="small"
              column={1}
              items={[
                { key: 'name', label: 'Name', children: selected.name },
                {
                  key: 'email',
                  label: 'Email',
                  children: <a href={`mailto:${selected.email}`}>{selected.email}</a>
                },
                {
                  key: 'phone',
                  label: 'Phone',
                  children: selected.phone ? (
                    <a href={`tel:${selected.phone}`}>{selected.phone}</a>
                  ) : (
                    'Not provided'
                  )
                },
                {
                  key: 'submitted',
                  label: 'Submitted',
                  children: new Date(selected.createdAt).toLocaleString()
                },
                {
                  key: 'message',
                  label: 'Message',
                  children: (
                    <Paragraph style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
                      {selected.message}
                    </Paragraph>
                  )
                }
              ]}
            />
            <Card size="small" title="Submission information">
              <Text type="secondary">Received through the public ElderlyCare Contact Us form.</Text>
            </Card>
          </Space>
        )}
      </Drawer>
    </Space>
  );
};

export default AdminSubmissionsTable;
