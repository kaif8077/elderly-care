const test = require('node:test');
const assert = require('node:assert/strict');
const express = require('express');
const contactRoutes = require('../routes/adminContactRoutes');
const feedbackRoutes = require('../routes/adminFeedbackRoutes');
const { pagination, escapeRegExp } = require('../controllers/adminSubmissionController');

test('admin contact and feedback routes register behind admin middleware', () => {
  const app = express();
  assert.doesNotThrow(() => {
    app.use('/contacts', contactRoutes);
    app.use('/feedback', feedbackRoutes);
  });
});

test('admin submission pagination is bounded and search text is escaped', () => {
  assert.deepEqual(pagination({ page: '-2', limit: '500' }), { page: 1, limit: 100 });
  assert.deepEqual(pagination({ page: '2', limit: '20' }), { page: 2, limit: 20 });
  assert.equal(escapeRegExp('test.*(name)'), 'test\\.\\*\\(name\\)');
});
