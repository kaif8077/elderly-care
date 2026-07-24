const test = require('node:test');
const assert = require('node:assert/strict');

test('normal-user auth routes include a protected session restore endpoint', () => {
  const router = require('../routes/authRoutes');
  const meLayer = router.stack.find(
    (layer) => layer.route?.path === '/me' && layer.route.methods.get
  );

  assert.ok(meLayer, 'GET /me should be registered');
  assert.equal(meLayer.route.stack.length, 2, 'GET /me should include authentication middleware');
});

test('password recovery routes are registered end to end', () => {
  const router = require('../routes/authRoutes');
  const postPaths = router.stack
    .filter((layer) => layer.route?.methods.post)
    .map((layer) => layer.route.path);

  assert.ok(postPaths.includes('/forgot-password'));
  assert.ok(postPaths.includes('/verify-reset-otp'));
  assert.ok(postPaths.includes('/reset-password'));
});
