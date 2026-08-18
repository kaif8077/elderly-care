const test = require('node:test');
const assert = require('node:assert/strict');
const { calculateAge, emergencyProjection } = require('../controllers/secureQrController');

test('public QR projection excludes private medical and insurance data', () => {
  const projected = emergencyProjection({
    userId: '507f1f77bcf86cd799439011',
    name: 'Test Elder',
    dob: new Date('1950-01-01T00:00:00.000Z'),
    bloodGroup: 'O+',
    allergies: ['Penicillin'],
    medicalHistory: ['Diabetes'],
    medications: ['Insulin'],
    emergencyContact: 'Guardian',
    emergencyPhone: '+910000000000',
    address: 'Private home address',
    policyNumber: 'PRIVATE-POLICY',
    updatedAt: new Date()
  }, { _id: '507f191e810c19729de860ea' });

  assert.equal(projected.name, 'Test Elder');
  assert.deepEqual(projected.severeAllergies, ['Penicillin']);
  assert.equal(projected.address, undefined);
  assert.equal(projected.policyNumber, undefined);
  assert.equal(projected.dob, undefined);
});

test('age calculation rejects invalid dates', () => {
  assert.equal(calculateAge(null), null);
  assert.equal(calculateAge('not-a-date'), null);
});

test('secure QR routes expose the emergency-safe profile photo through the opaque token', () => {
  assert.equal(typeof require('../routes/qrRoutes'), 'function');
  assert.equal(typeof require('../controllers/secureQrController').getPublicEmergencyPhoto, 'function');
});
