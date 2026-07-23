const test = require('node:test');
const assert = require('node:assert/strict');

process.env.ADMIN_JWT_SECRET = 'test-admin-secret-that-is-not-used-in-production';
process.env.ADMIN_SESSION_HOURS = '2';
process.env.NODE_ENV = 'test';

const {
  ADMIN_COOKIE_NAME,
  createAdminToken,
  readCookie,
  verifyAdminToken
} = require('../services/adminSessionService');
const {
  DEFAULT_ADMIN_PERMISSIONS,
  getPermissions
} = require('../middleware/requirePermission');
const { configuredOrigins } = require('../middleware/requireTrustedOrigin');
const { calculateCompletion, isProfileComplete, parseQuery } = require('../services/adminUserQueryService');
const { getAdminUserDetail } = require('../services/adminUserDetailService');

test('admin session token contains only expected authorization claims', () => {
  const admin = {
    _id: '507f1f77bcf86cd799439011',
    role: 'admin',
    sessionVersion: 3
  };

  const decoded = verifyAdminToken(createAdminToken(admin));

  assert.equal(decoded.sub, String(admin._id));
  assert.equal(decoded.role, 'admin');
  assert.equal(decoded.sessionVersion, 3);
  assert.equal(decoded.purpose, 'admin_session');
  assert.equal(decoded.password, undefined);
  assert.equal(decoded.email, undefined);
});

test('admin cookie parser reads the named cookie without exposing other cookies', () => {
  const req = {
    headers: {
      cookie: `theme=large; ${ADMIN_COOKIE_NAME}=signed-token-value; preference=high-contrast`
    }
  };

  assert.equal(readCookie(req, ADMIN_COOKIE_NAME), 'signed-token-value');
  assert.equal(readCookie(req, 'missing'), null);
});

test('default admin permissions exclude settings management and hard deletion', () => {
  const permissions = getPermissions({ role: 'admin', permissions: [] });

  assert.deepEqual(permissions, DEFAULT_ADMIN_PERMISSIONS);
  assert.equal(permissions.includes('settings.manage'), false);
  assert.equal(permissions.includes('users.hardDelete'), false);
});

test('super admin receives wildcard permission', () => {
  assert.deepEqual(getPermissions({ role: 'super_admin', permissions: [] }), ['*']);
});

test('trusted origin configuration normalizes trailing slashes', () => {
  process.env.FRONTEND_URL = 'http://localhost:3000/,https://elderlycare.example.com';
  assert.deepEqual(configuredOrigins(), [
    'http://localhost:3000',
    'https://elderlycare.example.com'
  ]);
});

test('admin user query pagination is bounded and sort fields are allowlisted', () => {
  assert.deepEqual(parseQuery({ page: '-2', limit: '500', sortBy: 'password', sortOrder: 'asc' }), {
    page: 1,
    limit: 50,
    sortBy: 'createdAt',
    sortOrder: 1
  });
});

test('profile completion is calculated from the minimized directory projection', () => {
  assert.equal(calculateCompletion(null), 0);
  assert.equal(calculateCompletion({
    name: 'Test User',
    dob: new Date(),
    gender: 'other',
    bloodGroup: 'O+',
    height: 170,
    weight: 70,
    phone: '+910000000000',
    address: 'Test',
    emergencyContact: 'Contact',
    emergencyPhone: '+910000000001',
    dietPreference: 'Vegetarian'
  }), 100);
});

test('profile completeness requires emergency-ready contact fields', () => {
  assert.equal(isProfileComplete(null), false);
  assert.equal(isProfileComplete({ name: 'Test User' }), false);
  assert.equal(isProfileComplete({
    name: 'Test User',
    dob: new Date(),
    gender: 'other',
    phone: '+910000000000',
    address: 'Test',
    emergencyContact: 'Contact',
    emergencyPhone: '+910000000001'
  }), true);
});

test('admin user detail rejects malformed identifiers before querying MongoDB', async () => {
  assert.equal(await getAdminUserDetail('not-a-mongodb-id'), null);
});
