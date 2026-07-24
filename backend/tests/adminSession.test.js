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
  getPermissions,
  requireRole
} = require('../middleware/requirePermission');
const { configuredOrigins, requireTrustedOrigin } = require('../middleware/requireTrustedOrigin');
const { calculateCompletion, isProfileComplete, parseQuery } = require('../services/adminUserQueryService');
const { getAdminUserDetail } = require('../services/adminUserDetailService');
const { getCard } = require('../services/adminIdCardService');
const QRCodeModel = require('../models/QRCode');
const { parseAuditQuery } = require('../services/adminAuditQueryService');
const { validateArchiveRequest } = require('../services/adminUserLifecycleService');
const securityHeaders = require('../middleware/securityHeaders');

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

test('admin ID card lookup rejects malformed identifiers before querying MongoDB', async () => {
  assert.equal(await getCard('not-a-mongodb-id'), null);
});

test('QR records support opaque tokens and revocation metadata', () => {
  const paths = QRCodeModel.schema.paths;
  assert.ok(paths.token);
  assert.ok(paths.status);
  assert.ok(paths.revokedAt);
  assert.ok(paths.revokedBy);
  assert.deepEqual(paths.status.enumValues, ['active', 'revoked']);
});

test('archive validation requires a reason and exact confirmation word', () => {
  assert.equal(validateArchiveRequest({ reason: 'User request', confirmation: 'DELETE' }), null);
  assert.match(validateArchiveRequest({ reason: 'User request', confirmation: 'delete' }), /DELETE/);
  assert.match(validateArchiveRequest({ reason: '', confirmation: 'DELETE' }), /reason/);
});

test('audit pagination is bounded', () => {
  assert.deepEqual(parseAuditQuery({ page: '-5', limit: '1000' }), { page: 1, limit: 100 });
});

test('admin route modules register without invalid middleware callbacks', () => {
  assert.equal(typeof require('../routes/adminUserRoutes'), 'function');
  assert.equal(typeof require('../routes/adminIdCardRoutes'), 'function');
  assert.equal(typeof require('../routes/adminAuditRoutes'), 'function');
});

test('security headers prevent framing and MIME sniffing', () => {
  const headers = {};
  const res = { set: (values) => Object.assign(headers, values) };
  let called = false;
  securityHeaders({}, res, () => { called = true; });
  assert.equal(called, true);
  assert.equal(headers['X-Frame-Options'], 'DENY');
  assert.equal(headers['X-Content-Type-Options'], 'nosniff');
  assert.equal(headers['Referrer-Policy'], 'no-referrer');
});

test('normal users fail the backend admin role boundary', () => {
  const middleware = requireRole('admin', 'super_admin');
  let statusCode;
  let body;
  let nextCalled = false;
  middleware(
    { admin: { role: 'user' } },
    { status: (code) => { statusCode = code; return { json: (value) => { body = value; } }; } },
    () => { nextCalled = true; }
  );
  assert.equal(statusCode, 403);
  assert.equal(body.code, 'ADMIN_ROLE_REQUIRED');
  assert.equal(nextCalled, false);
});

test('untrusted browser origins fail state-changing admin requests', () => {
  const previousNodeEnv = process.env.NODE_ENV;
  const previousFrontendUrl = process.env.FRONTEND_URL;
  process.env.NODE_ENV = 'production';
  process.env.FRONTEND_URL = 'https://elderlycare.example.com';
  let statusCode;
  let body;
  let nextCalled = false;
  requireTrustedOrigin(
    { get: () => 'https://attacker.example.com' },
    { status: (code) => { statusCode = code; return { json: (value) => { body = value; } }; } },
    () => { nextCalled = true; }
  );
  process.env.NODE_ENV = previousNodeEnv;
  process.env.FRONTEND_URL = previousFrontendUrl;
  assert.equal(statusCode, 403);
  assert.equal(body.code, 'UNTRUSTED_ADMIN_ORIGIN');
  assert.equal(nextCalled, false);
});
