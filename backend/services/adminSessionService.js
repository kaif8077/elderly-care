const jwt = require('jsonwebtoken');

const ADMIN_COOKIE_NAME = 'admin_session';
const DEFAULT_SESSION_HOURS = 8;

const getAdminSecret = () => {
  if (!process.env.ADMIN_JWT_SECRET) {
    throw new Error('ADMIN_JWT_SECRET is not configured');
  }
  return process.env.ADMIN_JWT_SECRET;
};

const getSessionHours = () => {
  const hours = Number(process.env.ADMIN_SESSION_HOURS || DEFAULT_SESSION_HOURS);
  return Number.isFinite(hours) && hours > 0 ? Math.min(hours, 24) : DEFAULT_SESSION_HOURS;
};

const createAdminToken = (admin) => jwt.sign({
  sub: String(admin._id),
  role: admin.role,
  sessionVersion: admin.sessionVersion,
  purpose: 'admin_session'
}, getAdminSecret(), { expiresIn: `${getSessionHours()}h` });

const verifyAdminToken = (token) => jwt.verify(token, getAdminSecret());

const cookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.ADMIN_COOKIE_SAME_SITE
    || (process.env.NODE_ENV === 'production' ? 'none' : 'lax'),
  maxAge: getSessionHours() * 60 * 60 * 1000,
  path: '/'
});

const setAdminCookie = (res, token) => {
  res.cookie(ADMIN_COOKIE_NAME, token, cookieOptions());
};

const clearAdminCookie = (res) => {
  const options = cookieOptions();
  delete options.maxAge;
  res.clearCookie(ADMIN_COOKIE_NAME, options);
};

const readCookie = (req, name) => {
  const header = req.headers.cookie || '';
  const cookies = header.split(';').map((item) => item.trim());
  const match = cookies.find((item) => item.startsWith(`${name}=`));
  return match ? decodeURIComponent(match.slice(name.length + 1)) : null;
};

module.exports = {
  ADMIN_COOKIE_NAME,
  clearAdminCookie,
  createAdminToken,
  readCookie,
  setAdminCookie,
  verifyAdminToken
};
