import { useCallback, useEffect, useState } from 'react';
import {
  Button, Card, Col, Empty, Form, Image, Input, List, Modal, Row, Select,
  Space, Typography, Upload, message
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
  const [previewLoading, setPreviewLoading] = useState(false);

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
      if (preview?.url) URL.revokeObjectURL(preview.url);
    };
  }, [load, preview?.url]);

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
    setPreviewLoading(true);
    try {
      const response = await fetchDocument(item);
      const url = URL.createObjectURL(response.data);
      setPreview({ item, url });
    } catch (error) {
      message.error(error.response?.data?.message || 'Unable to preview document.');
    } finally {
      setPreviewLoading(false);
    }
  };

  const closePreview = () => {
    if (preview?.url) URL.revokeObjectURL(preview.url);
    setPreview(null);
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

  return (
    <Card className="care-section-card" title="Secure medical documents">
      <Form form={form} layout="vertical" onFinish={upload}>
        <Row gutter={[16, 8]} align="bottom">
          <Col xs={24} sm={12} lg={6}>
            <Form.Item name="displayName" label="Document name" rules={[{ required: true }]}>
              <Input placeholder="e.g. Latest prescription" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Form.Item name="category" label="Category" rules={[{ required: true }]}>
              <Select placeholder="Select category" options={categories} />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} lg={6}>
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
                <Button block icon={<UploadOutlined />}>
                  {file ? file.name : 'Choose file'}
                </Button>
              </Upload>
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Form.Item label="Upload document">
              <Button block type="primary" htmlType="submit" loading={working}>
                Upload securely
              </Button>
            </Form.Item>
          </Col>
        </Row>
      </Form>

      <List
        dataSource={items}
        locale={{ emptyText: <Empty description="No documents uploaded" /> }}
        renderItem={(item) => (
          <List.Item
            actions={[
              <Button key="view" type="link" icon={<EyeOutlined />} loading={previewLoading} onClick={() => view(item)}>View</Button>,
              <Button key="download" type="link" icon={<DownloadOutlined />} onClick={() => download(item)}>Download</Button>,
              <Button key="delete" danger type="link" icon={<DeleteOutlined />} onClick={() => remove(item)}>Delete</Button>
            ]}
          >
            <List.Item.Meta
              title={item.displayName}
              description={`${item.category.replaceAll('_', ' ')} · ${Math.ceil(item.bytes / 1024)} KB · Account owner only`}
            />
          </List.Item>
        )}
      />

      <Modal
        open={Boolean(preview)}
        title={preview?.item.displayName || 'Document preview'}
        onCancel={closePreview}
        width={820}
        footer={[
          <Button key="cancel" onClick={closePreview}>Cancel</Button>,
          <Button key="download" type="primary" icon={<DownloadOutlined />} onClick={() => download(preview.item)}>
            Download
          </Button>
        ]}
        destroyOnHidden
      >
        {preview?.item.contentType === 'application/pdf' ? (
          <iframe
            title={preview.item.displayName}
            src={preview.url}
            style={{ width: '100%', height: '65vh', border: 0 }}
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
