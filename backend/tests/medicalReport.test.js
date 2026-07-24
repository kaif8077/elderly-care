const test = require('node:test');
const assert = require('node:assert/strict');

process.env.ADMIN_JWT_SECRET = 'test-admin-secret-that-is-not-used-in-production';
process.env.JWT_SECRET = 'test-user-secret-that-is-not-used-in-production';

const MedicalReport = require('../models/MedicalReport');
const { parsePage, snapshotProfile } = require('../services/medicalReportService');

test('medical report snapshot excludes QR images and public URLs', () => {
  const snapshot = snapshotProfile({
    _id: 'profile-id',
    name: 'Test User',
    dob: new Date('1950-01-01'),
    gender: 'other',
    bloodGroup: 'O+',
    height: 170,
    weight: 70,
    dietPreference: 'Vegetarian',
    phone: '000',
    address: 'Test address',
    emergencyContact: 'Guardian',
    emergencyPhone: '111',
    allergies: ['Penicillin'],
    medications: ['Medicine'],
    qrCodeImage: 'data:image/png;base64,secret',
    profileUrl: 'https://example.com/private',
    updatedAt: new Date()
  });
  assert.equal(snapshot.personal.name, 'Test User');
  assert.equal(snapshot.medical.allergies[0], 'Penicillin');
  assert.equal(Object.hasOwn(snapshot, 'qrCodeImage'), false);
  assert.equal(Object.hasOwn(snapshot, 'profileUrl'), false);
});

test('report pagination is bounded', () => {
  assert.deepEqual(parsePage('-1', '500'), { page: 1, limit: 50 });
});

test('medical report schema enforces immutable snapshots and version uniqueness', () => {
  assert.equal(MedicalReport.schema.path('snapshotData').options.immutable, true);
  assert.equal(MedicalReport.schema.path('generatedAt').options.immutable, true);
  const versionIndex = MedicalReport.schema.indexes()
    .find(([fields]) => fields.elderProfileId === 1 && fields.reportVersion === 1);
  assert.equal(versionIndex[1].unique, true);
});

test('user and admin report route modules register successfully', () => {
  assert.equal(typeof require('../routes/medicalReportRoutes'), 'function');
  assert.equal(typeof require('../routes/adminReportRoutes'), 'function');
});
