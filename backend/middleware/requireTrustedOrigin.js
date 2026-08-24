const normalizeOrigin = (value) =>
  String(value || '')
    .trim()
    .replace(/\/$/, '');

const configuredOrigins = () =>
  String(process.env.FRONTEND_URL || 'http://localhost:3000')
    .split(',')
    .map(normalizeOrigin)
    .filter(Boolean);

const requireTrustedOrigin = (req, res, next) => {
  const origin = normalizeOrigin(req.get('origin'));

  // Non-browser clients omit Origin. Permit them outside production for local
  // development and seed/API testing, but require Origin in production.
  if (!origin && process.env.NODE_ENV !== 'production') return next();

  if (!origin || !configuredOrigins().includes(origin)) {
    return res.status(403).json({
      message: 'Request origin is not allowed',
      code: 'UNTRUSTED_ADMIN_ORIGIN'
    });
  }

  next();
};

module.exports = { configuredOrigins, requireTrustedOrigin };
