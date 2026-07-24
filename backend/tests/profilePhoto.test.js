const test = require('node:test');
const assert = require('node:assert/strict');
const { detectImageType } = require('../services/profilePhotoService');

test('profile photo validation checks content signatures, not only MIME headers', () => {
  assert.equal(detectImageType(Buffer.from([0xff, 0xd8, 0xff, 0, 0, 0, 0, 0, 0, 0, 0, 0])), 'image/jpeg');
  assert.equal(detectImageType(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 0])), 'image/png');
  assert.equal(detectImageType(Buffer.from('not-an-image')), null);
});
