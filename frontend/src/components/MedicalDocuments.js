import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Button, Card, Col, Empty, Form, Image, Input, Modal, Row, Select,
  Space, Table, Typography, Upload, message
} from 'antd';
import {
  DeleteOutlined, DownloadOutlined, EyeOutlined, UploadOutlined
} from '@ant-design/icons';
import api from '../services/api';

const { Text } = Typography;
const categories = [
  'prescription', 'medical_report', 'insurance_card', 'doctor_note',
  'vaccination', 'discharge_summary', 'identification'
].map((value) => ({ value, label: value.replaceAll('_', ' ') }));

const MedicalDocuments = () => {
  const [form] = Form.useForm();
  const [file, setFile] = useState();
  const [items, setItems] = useState([]);
  const [working, setWorking] = useState(false);
  const [preview, setPreview] = useState(null);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [previewLoadingId, setPreviewLoadingId] = useState(null);
  const previewUrlRef = useRef(null);

  const load = useCallback(async () => {
    try {
      const response = await api.get('/api/medical-documents');
      setItems(response.data.documents || []);
    } catch {
      message.error('Unable to load medical documents.');
    }
  }, []);

  useEffect(() => {
    load();
    return () => {
      if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    };
  }, [load]);

  const upload = async (values) => {
    if (!file) return message.error('Choose a document first.');
    setWorking(true);
    try {
      const body = new FormData();
      body.append('document', file);
      Object.entries(values).forEach(([key, value]) => body.append(key, value));
      await api.post('/api/medical-documents', body, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      form.resetFields();
      setFile(undefined);
      setUploadOpen(false);
      message.success('Document uploaded securely.');
      load();
    } catch (error) {
      message.error(error.response?.data?.message || 'Unable to upload document.');
    } finally {
      setWorking(false);
    }
  };

  const fetchDocument = (item) => api.get(`/api/medical-documents/${item._id}/download`, {
    responseType: 'blob'
  });

  const view = async (item) => {
    setPreviewLoadingId(item._id);
    try {
      const response = await fetchDocument(item);
      if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
      const blob = new Blob([response.data], { type: item.contentType });
      const url = URL.createObjectURL(blob);
      previewUrlRef.current = url;
      setPreview({ item, url });
    } catch (error) {
      message.error(error.response?.data?.message || 'Unable to preview document.');
    } finally {
      setPreviewLoadingId(null);
    }
  };

  const closePreview = () => {
    if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    previewUrlRef.current = null;
    setPreview(null);
  };

  const openPreview = () => {
    if (preview?.url) window.open(preview.url, '_blank', 'noopener,noreferrer');
  };

  const download = async (item) => {
    try {
      const response = await fetchDocument(item);
      const url = URL.createObjectURL(response.data);
      const link = document.createElement('a');
      link.href = url;
      link.download = item.displayName;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      message.error(error.response?.data?.message || 'Unable to download document.');
    }
  };

  const remove = (item) => Modal.confirm({
    title: 'Delete this document?',
    content: `“${item.displayName}” will be removed from your active documents.`,
    okText: 'Delete',
    cancelText: 'Cancel',
    okButtonProps: { danger: true },
    onOk: async () => {
      try {
        await api.delete(`/api/medical-documents/${item._id}`);
        message.success('Document deleted.');
        load();
      } catch (error) {
        message.error(error.response?.data?.message || 'Unable to delete document.');
      }
    }
  });

  const columns = [
    { title: 'Document name', dataIndex: 'displayName', key: 'displayName' },
    { title: 'Category', dataIndex: 'category', key: 'category', render: (value) => value.replaceAll('_', ' ') },
    { title: 'File size', dataIndex: 'bytes', key: 'bytes', render: (value) => `${Math.ceil(value / 1024)} KB` },
    { title: 'Uploaded date', dataIndex: 'createdAt', key: 'createdAt', render: (value) => value ? new Date(value).toLocaleDateString() : '—' },
    { title: 'Actions', key: 'actions', render: (_, item) => <Space size={2}>
      <Button type="text" aria-label={`View ${item.displayName}`} icon={<EyeOutlined />} loading={previewLoadingId === item._id} onClick={() => view(item)} />
      <Button type="text" aria-label={`Download ${item.displayName}`} icon={<DownloadOutlined />} onClick={() => download(item)} />
      <Button type="text" danger aria-label={`Delete ${item.displayName}`} icon={<DeleteOutlined />} onClick={() => remove(item)} />
    </Space> }
  ];

  return (
    <Card className="care-section-card member-documents-card" title="Your documents" extra={<Button type="primary" onClick={() => setUploadOpen(true)}>Upload document</Button>}>
      <Table rowKey="_id" columns={columns} dataSource={items} scroll={{ x: 760 }} pagination={{ defaultPageSize: 10, pageSizeOptions: [10, 20, 50], showSizeChanger: true }} locale={{ emptyText: <Empty description="No documents uploaded" /> }} />

      <Modal title="Upload secure document" open={uploadOpen} onCancel={() => setUploadOpen(false)} footer={null} destroyOnHidden>
      <Form form={form} layout="vertical" size="middle" onFinish={upload}>
        <Row gutter={[16, 8]} align="bottom">
          <Col span={24}>
            <Form.Item name="displayName" label="Document name" rules={[{ required: true }]}>
              <Input placeholder="e.g. Latest prescription" />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item name="category" label="Category" rules={[{ required: true }]}>
              <Select placeholder="Select category" options={categories} />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item label="Document file" required>
              <Upload
                style={{ width: '100%' }}
                beforeUpload={(selected) => { setFile(selected); return false; }}
                onRemove={() => setFile(undefined)}
                fileList={file ? [file] : []}
                maxCount={1}
                accept=".pdf,.jpg,.jpeg,.png,.webp"
                showUploadList={false}
              >
                <Button block size="middle" icon={<UploadOutlined />}>
                  {file ? file.name : 'Choose file'}
                </Button>
              </Upload>
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item label="Upload document">
              <Button block type="primary" size="middle" htmlType="submit" loading={working}>
                Upload securely
              </Button>
            </Form.Item>
          </Col>
        </Row>
      </Form>
      </Modal>

      <Modal
        open={Boolean(preview)}
        title={preview?.item.displayName || 'Document preview'}
        onCancel={closePreview}
        width="min(1200px, 96vw)"
        styles={{ body: { padding: 0, background: '#eef2f7' } }}
        footer={[
          <Button key="close" onClick={closePreview}>Close</Button>,
          <Button key="open" icon={<EyeOutlined />} onClick={openPreview}>Open full screen</Button>,
          <Button key="download" type="primary" icon={<DownloadOutlined />} onClick={() => download(preview.item)}>
            Download
          </Button>
        ]}
        destroyOnHidden
      >
        {preview?.item.contentType === 'application/pdf' ? (
          <iframe
            title={preview.item.displayName}
            src={`${preview.url}#view=FitH&toolbar=1&navpanes=0`}
            style={{ display: 'block', width: '100%', height: '78vh', minHeight: 520, border: 0, background: '#fff' }}
          />
        ) : preview ? (
          <Space direction="vertical" align="center" style={{ width: '100%' }}>
            <Image src={preview.url} alt={preview.item.displayName} preview={false} style={{ maxHeight: '65vh', objectFit: 'contain' }} />
            <Text type="secondary">Private document preview</Text>
          </Space>
        ) : null}
      </Modal>
    </Card>
  );
};

export default MedicalDocuments;
