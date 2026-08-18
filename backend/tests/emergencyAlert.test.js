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

test('emergency alert model stores limited responder context without medical payloads', () => {
  const paths = EmergencyAlert.schema.paths;
  assert.ok(paths.responderName);
  assert.ok(paths.responderPhone);
  assert.equal(paths.latitude, undefined);
  assert.equal(paths.longitude, undefined);
  assert.equal(paths.medicalData, undefined);
});

test('emergency alert model supports expiring acknowledgement links and an action timeline', () => {
  const paths = EmergencyAlert.schema.paths;
  assert.ok(paths.acknowledgementTokenHash);
  assert.ok(paths.acknowledgementTokenExpiresAt);
  assert.ok(paths.acknowledgementHistory);
  const historySchema = paths.acknowledgementHistory.schema.paths;
  assert.ok(historySchema.action);
  assert.ok(historySchema.actorType);
  assert.ok(historySchema.actorId);
  assert.ok(historySchema.createdAt);
});

test('user and admin emergency alert routes register successfully', () => {
  assert.equal(typeof require('../routes/emergencyAlertRoutes'), 'function');
  assert.equal(typeof require('../routes/adminEmergencyAlertRoutes'), 'function');
});
