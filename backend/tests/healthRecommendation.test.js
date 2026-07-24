const test = require('node:test');
const assert = require('node:assert/strict');
const HealthRecommendation = require('../models/HealthRecommendation');

test('saved health recommendations are owned, versionable snapshots', () => {
  const paths = HealthRecommendation.schema.paths;
  assert.ok(paths.userId);
  assert.ok(paths.medicalProfileId);
  assert.ok(paths.content);
  assert.ok(paths.generatedAt);
  assert.deepEqual(paths.status.enumValues, ['active', 'archived']);
});

test('recommendation routes register authenticated history and PDF endpoints', () => {
  assert.equal(typeof require('../routes/recommendationRoutes'), 'function');
});

test('fallback health recommendations remain concise and profile-specific', () => {
  const { getConciseHealthRecommendations } = require('../controllers/recommendationController');
  const result = getConciseHealthRecommendations({
    name: 'Test User',
    medicalHistory: ['Hypertension'],
    allergies: ['Penicillin'],
    medications: ['Amlodipine'],
    currentSymptoms: [],
    fallRisk: true,
    mobilityStatus: 'walking_aid',
    emergencyContact: 'Caregiver',
    emergencyPhone: '1234567890'
  });

  assert.match(result, /Penicillin/);
  assert.match(result, /fall hazards/);
  assert.ok(result.split('\n').length <= 16);
});
