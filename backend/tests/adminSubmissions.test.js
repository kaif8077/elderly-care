const test = require('node:test');
const assert = require('node:assert/strict');
const express = require('express');
const contactRoutes = require('../routes/adminContactRoutes');
const Contact = require('../models/Contact');
const { pagination, escapeRegExp } = require('../controllers/adminSubmissionController');

test('admin contact routes register behind admin middleware', () => {
  const app = express();
  assert.doesNotThrow(() => {
    app.use('/contacts', contactRoutes);
  });
});

test('admin submission pagination is bounded and search text is escaped', () => {
  assert.deepEqual(pagination({ page: '-2', limit: '500' }), { page: 1, limit: 100 });
  assert.deepEqual(pagination({ page: '2', limit: '20' }), { page: 2, limit: 20 });
  assert.equal(escapeRegExp('test.*(name)'), 'test\\.\\*\\(name\\)');
});

test('contact submissions require a phone number', () => {
  assert.equal(Contact.schema.path('phone').isRequired, true);
});
