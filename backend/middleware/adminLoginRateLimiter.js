const WINDOW_MS = 15 * 60 * 1000;
const MAX_REQUESTS = 10;
const attempts = new Map();

const adminLoginRateLimiter = (req, res, next) => {
  const now = Date.now();
  const key = req.ip || req.socket.remoteAddress || 'unknown';
  const current = attempts.get(key);

  if (!current || current.resetAt <= now) {
    attempts.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return next();
  }

  if (current.count >= MAX_REQUESTS) {
    res.set('Retry-After', Math.ceil((current.resetAt - now) / 1000));
    return res.status(429).json({
      message: 'Too many admin login attempts. Please try again later.',
      code: 'ADMIN_LOGIN_RATE_LIMITED'
    });
  }

  current.count += 1;
  attempts.set(key, current);
  next();
};

module.exports = adminLoginRateLimiter;
