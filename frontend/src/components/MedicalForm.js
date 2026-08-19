import React, { useContext, useEffect, useMemo, useState } from 'react';
import dayjs from 'dayjs';
import { toast } from 'react-toastify';
import {
  Alert, Button, Card, Checkbox, Col, DatePicker, Divider, Form, Grid, Image, Input,
  InputNumber, Row, Select, Space, Steps, Switch, Typography, Upload
} from 'antd';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';

const { Title, Text, Paragraph } = Typography;
const languages = [
  'English', 'Hindi', 'Bengali', 'Marathi', 'Telugu',
  'Tamil', 'Gujarati', 'Urdu', 'Kannada', 'Malayalam', 'Other'
];
const medicalOptions = {
  medicalHistory: ['Diabetes', 'Hypertension', 'Asthma', 'Heart Disease', 'Stroke', 'Kidney Disease'],
  allergies: ['Penicillin', 'Aspirin', 'Food allergy', 'Dust', 'Pollen', 'Latex'],
  medications: ['Metformin', 'Amlodipine', 'Insulin', 'Aspirin', 'Warfarin', 'Inhaler'],
  currentSymptoms: ['Dizziness', 'Chest pain', 'Fatigue', 'Shortness of breath', 'Swelling', 'Joint pain']
};
const labels = {
  medicalHistory: 'Known conditions',
  allergies: 'Allergies',
  medications: 'Current medications',
  currentSymptoms: 'Current symptoms'
};
const initialValues = {
  firstName: '', lastName: '', dob: null, gender: undefined, bloodGroup: undefined,
  height: null, weight: null, preferredLanguage: [], otherLanguage: '',
  mobilityStatus: undefined, dietPreference: undefined, maritalStatus: undefined,
  phone: '', address: '', emergencyContacts: [{ name: '', phone: '', relationship: '', email: '', priority: 1, isPrimary: true, canReceiveAlerts: true, canAccessReports: false, canManageAccount: false, preferredChannel: 'phone' }],
  medicalHistory: [], allergies: [], medications: [], currentSymptoms: [],
  doctorName: '', doctorPhone: '', preferredHospital: '', fallRisk: false,
  hasInsurance: false, insuranceProvider: '', policyNumber: '', reviewConfirmed: false
};
const stepItems = ['Personal information', 'Address & contacts', 'Medical information', 'Review'].map((title) => ({ title }));
const required = (message) => [{ required: true, message }];
const { useBreakpoint } = Grid;

const MedicalForm = ({ onSubmissionSuccess }) => {
  const [form] = Form.useForm();
  const { user } = useContext(AuthContext);
  const screens = useBreakpoint();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState(null);
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState('');
  const [values, setValues] = useState(initialValues);

  const fullName = useMemo(
    () => [values.firstName, values.lastName].filter(Boolean).join(' '),
    [values.firstName, values.lastName]
  );

  useEffect(() => {
    if (!user?._id) return;
    api.get(`/api/medical/${user._id}`).then(({ data }) => {
      const loaded = {
        ...initialValues,
        ...data,
        dob: data.dob ? dayjs(data.dob) : null,
        preferredLanguage: Array.isArray(data.preferredLanguage)
          ? data.preferredLanguage
          : data.preferredLanguage ? [data.preferredLanguage] : [],
        emergencyContacts: data.emergencyContacts?.length
          ? data.emergencyContacts
          : [{ name: data.emergencyContact || '', phone: data.emergencyPhone || '', relationship: data.emergencyRelationship || '', priority: 1, isPrimary: true, canReceiveAlerts: true, preferredChannel: 'phone' }]
      };
      form.setFieldsValue(loaded);
      setValues(loaded);
      setProfile(data);
      if (data.profilePhoto) {
        api.get(`/api/medical/${user._id}/photo`, { responseType: 'blob' })
          .then((response) => setPhotoPreview(URL.createObjectURL(response.data)))
          .catch(() => {});
      }
    }).catch((error) => {
      if (error.response?.status !== 404) toast.error('Unable to load your saved profile.');
    });
  }, [form, user]);

  useEffect(() => () => {
    if (photoPreview?.startsWith('blob:')) URL.revokeObjectURL(photoPreview);
  }, [photoPreview]);

  const stepFields = [
    ['firstName', 'lastName', 'dob', 'gender', 'bloodGroup', 'height', 'weight', 'preferredLanguage', 'mobilityStatus', 'dietPreference', 'maritalStatus'],
    ['phone', 'address', 'emergencyContacts'],
    ['medicalHistory', 'allergies', 'medications', 'currentSymptoms'],
    ['reviewConfirmed']
  ];

  const serialize = (raw, finalize = false, fields = null) => {
    const { reviewConfirmed, profilePhoto, ...clean } = raw;
    const data = fields
      ? Object.fromEntries(fields.filter((field) => field !== 'profilePhoto').map((field) => [field, clean[field]]))
      : clean;
    return {
      ...data,
      ...(data.dob ? { dob: data.dob?.format?.('YYYY-MM-DD') || data.dob } : {}),
      finalize
    };
  };

  const savePhoto = async () => {
    if (!photo || !user?._id) return;
    const body = new FormData();
    body.append('photo', photo);
    await api.post(`/api/medical/${user._id}/photo`, body, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    setProfile((current) => ({ ...(current || {}), profilePhoto: { uploadedAt: new Date().toISOString() } }));
  };

  const saveStep = async (nextStep) => {
    setSaving(true);
    try {
      await form.validateFields(stepFields[step]);
      if (step === 0 && !photo && !profile?.profilePhoto) {
        form.setFields([{ name: 'profilePhoto', errors: ['Profile photograph is required'] }]);
        throw new Error('PHOTO_REQUIRED');
      }
      const { data } = await api.post(
        '/api/medical',
        serialize(form.getFieldsValue(true), false, stepFields[step])
      );
      if (step === 0) await savePhoto();
      setProfile(data.profile);
      toast.success(`${stepItems[step].title} saved`);
      setStep(nextStep);
    } catch (error) {
      if (error.errorFields || error.message === 'PHOTO_REQUIRED') {
        toast.error('Complete the mandatory fields before continuing.');
      } else {
        toast.error(error.response?.data?.message || 'Unable to save this section.');
      }
    } finally {
      setSaving(false);
    }
  };

  const submit = async () => {
    setSaving(true);
    try {
      await form.validateFields();
      const { data } = await api.post('/api/medical', serialize(form.getFieldsValue(true), true));
      setProfile(data.profile);
      toast.success('Medical profile saved successfully.');
      onSubmissionSuccess?.(data.profile);
    } catch (error) {
      if (error.errorFields?.length) {
        const firstError = error.errorFields[0]?.errors?.[0];
        toast.error(firstError || 'Review the highlighted mandatory fields.');
      } else {
        const response = error.response?.data;
        const fields = Array.isArray(response?.fields)
          ? response.fields.join(', ')
          : response?.fields && typeof response.fields === 'object'
            ? Object.keys(response.fields).join(', ')
            : '';
        toast.error(`${response?.message || 'Unable to save the medical profile.'}${fields ? ` Missing or invalid: ${fields}.` : ''}`);
      }
    } finally {
      setSaving(false);
    }
  };

  const photoFile = (file) => {
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 3 * 1024 * 1024) {
      toast.error('Choose a JPEG, PNG or WebP photograph up to 3 MB.');
      return Upload.LIST_IGNORE;
    }
    if (photoPreview?.startsWith('blob:')) URL.revokeObjectURL(photoPreview);
    setPhoto(file);
    setPhotoPreview(URL.createObjectURL(file));
    form.setFields([{ name: 'profilePhoto', errors: [] }]);
    return false;
  };

  return (
    <section className="medical-form">
      <div className="medical-form-progress"><Text type="secondary">Step {step + 1} of 4 · Each step is saved before you continue.</Text></div>
      <Steps size="small" current={step} items={stepItems} responsive />

      <Form
        form={form}
        size={screens.md ? 'middle' : 'small'}
        layout={screens.md ? 'horizontal' : 'vertical'}
        labelAlign="left"
        labelCol={screens.md ? { flex: '132px' } : undefined}
        wrapperCol={screens.md ? { flex: 1 } : undefined}
        colon={false}
        initialValues={initialValues}
        requiredMark
        onValuesChange={() => setValues(form.getFieldsValue(true))}
      >
        {step === 0 && (
          <Card size="small" className="medical-step-card">
            <Title level={4}>Personal details</Title>
            <Form.Item name="profilePhoto" label="Profile photograph" required>
              <Space align="center" wrap>
                {photoPreview && <Image width={78} height={88} src={photoPreview} preview={false} style={{ objectFit: 'cover', borderRadius: 8 }} />}
                <Upload beforeUpload={photoFile} maxCount={1} showUploadList={false} accept="image/jpeg,image/png,image/webp">
                  <Button>{photoPreview ? 'Replace photograph' : 'Choose photograph'}</Button>
                </Upload>
                <Text type="secondary">JPEG, PNG or WebP · maximum 3 MB</Text>
              </Space>
            </Form.Item>
            <Row gutter={16}>
              <Col xs={24} md={12}><Form.Item name="firstName" label="First name" rules={required('Enter first name')}><Input placeholder="Enter first name" /></Form.Item></Col>
              <Col xs={24} md={12}><Form.Item name="lastName" label="Last name" rules={required('Enter last name')}><Input placeholder="Enter last name" /></Form.Item></Col>
              <Col xs={24} md={12}><Form.Item name="gender" label="Gender" rules={required('Select gender')}><Select placeholder="Select gender" options={['male', 'female', 'other'].map((value) => ({ value, label: value[0].toUpperCase() + value.slice(1) }))} /></Form.Item></Col>
              <Col xs={24} md={12}><Form.Item name="bloodGroup" label="Blood group" rules={required('Select blood group')}><Select placeholder="Select blood group" options={['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((value) => ({ value, label: value }))} /></Form.Item></Col>
              <Col xs={24} md={12}><Form.Item name="height" label="Height (cm)" rules={required('Enter height')}><InputNumber placeholder="Enter height" min={80} max={250} style={{ width: '100%' }} /></Form.Item></Col>
              <Col xs={24} md={12}><Form.Item name="weight" label="Weight (kg)" rules={required('Enter weight')}><InputNumber placeholder="Enter weight" min={20} max={300} style={{ width: '100%' }} /></Form.Item></Col>
              <Col xs={24} md={12}><Form.Item name="dob" label="Date of birth" rules={required('Select date of birth')}><DatePicker placeholder="Select date of birth" disabledDate={(date) => date && date.isAfter(dayjs(), 'day')} style={{ width: '100%' }} /></Form.Item></Col>
              <Col xs={24} md={12}><Form.Item name="preferredLanguage" label="Languages" rules={required('Select at least one language')}><Select mode="multiple" placeholder="Select languages" options={languages.map((value) => ({ value, label: value }))} /></Form.Item></Col>
              {values.preferredLanguage?.includes('Other') && <Col span={24}><Form.Item name="otherLanguage" label="Other language" rules={required('Enter the other language')}><Input placeholder="Type another language" /></Form.Item></Col>}
              <Col xs={24} md={12}><Form.Item name="mobilityStatus" label="Mobility" rules={required('Select mobility')}><Select placeholder="Select mobility" options={[['independent', 'Independent'], ['walking_aid', 'Walking aid'], ['wheelchair', 'Wheelchair'], ['bed_assistance', 'Bed assistance']].map(([value, label]) => ({ value, label }))} /></Form.Item></Col>
              <Col xs={24} md={12}><Form.Item name="dietPreference" label="Diet preference" rules={required('Select diet preference')}><Select placeholder="Select diet preference" options={['Vegetarian', 'Non-Vegetarian', 'Vegan', 'Eggetarian'].map((value) => ({ value, label: value }))} /></Form.Item></Col>
              <Col xs={24} md={12}><Form.Item name="maritalStatus" label="Marital status" rules={required('Select marital status')}><Select placeholder="Select marital status" options={['single', 'married', 'widowed', 'divorced', 'separated'].map((value) => ({ value, label: value[0].toUpperCase() + value.slice(1) }))} /></Form.Item></Col>
            </Row>
          </Card>
        )}

        {step === 1 && (
          <Card size="small" className="medical-step-card">
            <Title level={4}>Address and emergency contacts</Title>
            <Alert showIcon type="info" message="Add at least one complete emergency contact. You can add more contacts when needed." style={{ marginBottom: 20 }} />
            <Row gutter={16}>
              <Col xs={24} md={8}><Form.Item name="phone" label="Contact number" rules={required('Enter contact number')}><Input type="tel" placeholder="Enter contact number" /></Form.Item></Col>
              <Col xs={24} md={16}><Form.Item name="address" label="Residential address" rules={required('Enter residential address')}><Input placeholder="Enter complete residential address" /></Form.Item></Col>
            </Row>
            <Form.List name="emergencyContacts">
              {(fields, { add, remove }) => (
                <Space direction="vertical" size={14} style={{ width: '100%' }}>
                  {fields.map((field, index) => (
                    <Card size="small" title={`Emergency contact ${index + 1}`} key={field.key} extra={fields.length > 1 && <Button type="text" danger onClick={() => remove(field.name)}>Remove</Button>}>
                      <Row gutter={16}>
                        <Col xs={24} md={12}><Form.Item {...field} name={[field.name, 'name']} label="Contact name" rules={required('Enter contact name')}><Input placeholder="Enter emergency contact name" /></Form.Item></Col>
                        <Col xs={24} md={12}><Form.Item {...field} name={[field.name, 'phone']} label="Contact number" rules={required('Enter contact number')}><Input type="tel" placeholder="Enter emergency contact number" /></Form.Item></Col>
                        <Col xs={24} md={12}><Form.Item {...field} name={[field.name, 'relationship']} label="Relationship" rules={required('Enter relationship')}><Input placeholder="e.g. Son or daughter" /></Form.Item></Col>
                        <Col xs={24} md={12}><Form.Item {...field} name={[field.name, 'email']} label="Email"><Input type="email" placeholder="Enter contact email" /></Form.Item></Col>
                        <Col xs={24} md={12}><Form.Item {...field} name={[field.name, 'priority']} label="Priority"><InputNumber min={1} max={10} style={{ width: '100%' }} /></Form.Item></Col>
                        <Col xs={24} md={12}><Form.Item {...field} name={[field.name, 'preferredChannel']} label="Preferred channel"><Select options={['phone', 'email', 'sms', 'telegram'].map((value) => ({ value, label: value }))} /></Form.Item></Col>
                        <Col xs={24}><Space wrap className="medical-contact-permissions"><Form.Item {...field} name={[field.name, 'isPrimary']} valuePropName="checked"><Checkbox>Primary</Checkbox></Form.Item><Form.Item {...field} name={[field.name, 'canReceiveAlerts']} valuePropName="checked"><Checkbox>Receive alerts</Checkbox></Form.Item><Form.Item {...field} name={[field.name, 'canAccessReports']} valuePropName="checked"><Checkbox>Access reports</Checkbox></Form.Item><Form.Item {...field} name={[field.name, 'canManageAccount']} valuePropName="checked"><Checkbox>Manage account</Checkbox></Form.Item></Space></Col>
                      </Row>
                    </Card>
                  ))}
                  <Button type="dashed" block onClick={() => add({ name: '', phone: '', relationship: '', priority: fields.length + 1, canReceiveAlerts: true, preferredChannel: 'phone' })}>Add another emergency contact</Button>
                </Space>
              )}
            </Form.List>
          </Card>
        )}

        {step === 2 && (
          <Card size="small" className="medical-step-card">
            <Title level={4}>Medical information</Title>
            <Paragraph type="secondary">Select an option or type a new value and press Enter.</Paragraph>
            <Row gutter={16}>
              {Object.entries(medicalOptions).map(([field, options]) => (
                <Col xs={24} md={12} key={field}>
                  <Form.Item name={field} label={labels[field]}>
                    <Select mode="tags" tokenSeparators={[',']} placeholder={`Select or type ${labels[field].toLowerCase()}`} options={options.map((value) => ({ value, label: value }))} />
                  </Form.Item>
                </Col>
              ))}
              <Col xs={24} md={12}><Form.Item name="doctorName" label="Treating doctor"><Input placeholder="Enter treating doctor name" /></Form.Item></Col>
              <Col xs={24} md={12}><Form.Item name="doctorPhone" label="Doctor phone"><Input placeholder="Enter doctor phone number" /></Form.Item></Col>
              <Col xs={24} md={12}><Form.Item name="preferredHospital" label="Preferred hospital"><Input placeholder="Enter preferred hospital" /></Form.Item></Col>
              <Col xs={24} md={12}><Form.Item name="fallRisk" label="Fall risk" valuePropName="checked"><Switch checkedChildren="Yes" unCheckedChildren="No" /></Form.Item></Col>
            </Row>
          </Card>
        )}

        {step === 3 && (
          <Card size="small" className="medical-step-card">
            <Title level={4}>Review summary</Title>
            <Card size="small">
              <Row gutter={[18, 18]}>
                <Col xs={24} md={8}><Text type="secondary">Name</Text><div><Text strong>{fullName || 'Not entered'}</Text></div></Col>
                <Col xs={24} md={8}><Text type="secondary">Blood group</Text><div><Text strong>{values.bloodGroup || 'Not selected'}</Text></div></Col>
                <Col xs={24} md={8}><Text type="secondary">Known conditions</Text><div><Text strong>{values.medicalHistory?.join(', ') || 'None entered'}</Text></div></Col>
                <Col span={24}><Text type="secondary">Emergency contacts</Text><div><Text strong>{values.emergencyContacts?.map((contact) => `${contact.name} (${contact.relationship})`).join(', ') || 'Not entered'}</Text></div></Col>
              </Row>
            </Card>
            <Form.Item name="reviewConfirmed" valuePropName="checked" rules={[{ validator: (_, checked) => checked ? Promise.resolve() : Promise.reject(new Error('Confirm the summary before saving')) }]} style={{ marginTop: 18 }}>
              <Checkbox>I reviewed these details and confirm they are correct.</Checkbox>
            </Form.Item>
          </Card>
        )}

        <Divider />
        <Space style={{ display: 'flex', justifyContent: 'flex-end' }} wrap>
          {step > 0 && <Button size="middle" onClick={() => setStep((value) => value - 1)}>Previous</Button>}
          {step < 3
            ? <Button type="primary" size="middle" loading={saving} onClick={() => saveStep(step + 1)}>Save & continue</Button>
            : <Button type="primary" size="middle" loading={saving} onClick={submit}>Save medical profile</Button>}
        </Space>
      </Form>
    </section>
  );
};

export default MedicalForm;
