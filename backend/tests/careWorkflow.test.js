const test = require('node:test');
const assert = require('node:assert/strict');

process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret';

const CareRelationship = require('../models/CareRelationship');
const MedicalDocument = require('../models/MedicalDocument');
const MedicalProfile = require('../models/MedicalProfile');
const NotificationPreference = require('../models/NotificationPreference');
const QrAccessLog = require('../models/QrAccessLog');
const Reminder = require('../models/Reminder');
const { detectContentType } = require('../services/medicalDocumentService');

test('care workflow and secure document routes register successfully', () => {
  assert.doesNotThrow(() => require('../routes/careWorkflowRoutes'));
  assert.doesNotThrow(() => require('../routes/medicalDocumentRoutes'));
});

test('medical-profile privacy settings use backend-enforced visibility levels', () => {
  const path = MedicalProfile.schema.path('visibilitySettings');
  assert.ok(path);
  const profile = new MedicalProfile({
    userId: '507f1f77bcf86cd799439011',
    name: 'Test User',
    dob: '1950-01-01',
    gender: 'male',
    bloodGroup: 'O+',
    height: 170,
    weight: 70,
    dietPreference: 'Vegetarian'
  });
  assert.equal(profile.visibilitySettings.get('bloodGroup'), 'public_emergency');
  assert.equal(profile.visibilitySettings.get('insurance'), 'owner_only');
});

test('new care records remain owner-scoped and avoid storing document bytes in MongoDB', () => {
  assert.ok(CareRelationship.schema.path('elderUserId'));
  assert.ok(NotificationPreference.schema.path('userId'));
  assert.ok(Reminder.schema.path('userId'));
  assert.ok(QrAccessLog.schema.path('ipHash').options.select === false);
  assert.ok(MedicalDocument.schema.path('storageFileId').options.select === false);
  assert.equal(MedicalDocument.schema.path('buffer'), undefined);
});

test('document signature validation recognizes supported content only', () => {
  assert.equal(detectContentType(Buffer.from('%PDF-1.7')), 'application/pdf');
  assert.equal(
    detectContentType(Buffer.from([0xff, 0xd8, 0xff, 0x00, 0x00, 0x00, 0x00, 0x00])),
    'image/jpeg'
  );
  assert.equal(detectContentType(Buffer.from('not a medical document')), null);
});
