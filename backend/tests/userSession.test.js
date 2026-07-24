const test = require('node:test');
const assert = require('node:assert/strict');
const { normalizeSessionVersion, sessionMatches } = require('../services/userSessionService');

test('legacy session versions normalize safely', () => {
  assert.equal(normalizeSessionVersion(undefined), 0);
  assert.equal(normalizeSessionVersion(null), 0);
  assert.equal(normalizeSessionVersion('2'), 2);
  assert.equal(normalizeSessionVersion(-1), 0);
  assert.equal(normalizeSessionVersion('invalid'), 0);
});

test('session comparison accepts equivalent legacy values but rejects revocation', () => {
  assert.equal(sessionMatches(undefined, 0), true);
  assert.equal(sessionMatches('3', 3), true);
  assert.equal(sessionMatches(2, 3), false);
});
