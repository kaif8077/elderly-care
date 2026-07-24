const test = require('node:test');
const assert = require('node:assert/strict');
const MedicalProfile = require('../models/MedicalProfile');
const { normalizeProfileData } = require('../controllers/medicalController');

test('medical profile accepts the new structured personal and emergency fields', async () => {
  const profile = new MedicalProfile({
    userId: '507f1f77bcf86cd799439011',
    elderlyCareId: '123456789012',
    firstName: 'Asha',
    lastName: 'Sharma',
    name: 'Asha Sharma',
    dob: '1950-01-01',
    gender: 'female',
    bloodGroup: 'O+',
    height: 158,
    weight: 58,
    dietPreference: 'Vegetarian',
    preferredLanguage: ['Hindi', 'English'],
    maritalStatus: 'widowed',
    mobilityStatus: 'walking_aid',
    emergencyContacts: [{ name: 'Ravi', phone: '9999999999', relationship: 'Son' }]
  });
  await profile.validate();
  assert.deepEqual(profile.preferredLanguage, ['Hindi', 'English']);
  assert.equal(profile.emergencyContacts[0].relationship, 'Son');
  assert.equal(profile.elderlyCareId.length, 12);
});

test('blood group remains mandatory for emergency readiness', async () => {
  const profile = new MedicalProfile({
    userId: '507f1f77bcf86cd799439011',
    name: 'Asha Sharma',
    dob: '1950-01-01',
    gender: 'female',
    height: 158,
    weight: 58,
    dietPreference: 'Vegetarian'
  });
  await assert.rejects(profile.validate(), /bloodGroup/);
});

test('JSON profile updates discard browser fake paths for photographs', () => {
  const normalized = normalizeProfileData({
    firstName: 'Asha',
    lastName: 'Sharma',
    profilePhoto: 'C:\\fakepath\\signature.jpg'
  }, '507f1f77bcf86cd799439011');
  assert.equal(Object.hasOwn(normalized, 'profilePhoto'), false);
});
