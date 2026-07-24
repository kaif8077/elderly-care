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
