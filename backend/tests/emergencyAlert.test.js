const test = require('node:test');
const assert = require('node:assert/strict');
const { duplicateKey, hashIp } = require('../services/emergencyAlertService');
const EmergencyAlert = require('../models/EmergencyAlert');

process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret';

test('emergency alert abuse identifiers are one-way hashes', () => {
  const ipHash = hashIp('127.0.0.1');
  assert.equal(ipHash.length, 64);
  assert.notEqual(ipHash, '127.0.0.1');
  assert.equal(duplicateKey({ qrId: 'qr', ipHash }).length, 64);
});

test('emergency alert model excludes responder and medical payload fields', () => {
  const paths = EmergencyAlert.schema.paths;
  assert.equal(paths.responderName, undefined);
  assert.equal(paths.responderPhone, undefined);
  assert.equal(paths.latitude, undefined);
  assert.equal(paths.longitude, undefined);
  assert.equal(paths.medicalData, undefined);
});
