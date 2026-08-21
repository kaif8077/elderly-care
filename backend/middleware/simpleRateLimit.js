const buckets = new Map();

const simpleRateLimit =
  ({ windowMs = 60_000, limit = 20, keyPrefix = 'api' } = {}) =>
  (req, res, next) => {
    const now = Date.now();
    if (buckets.size > 10000) {
      for (const [bucketKey, value] of buckets) {
        if (value.resetAt <= now) buckets.delete(bucketKey);
      }
    }
    const key = `${keyPrefix}:${req.ip || 'unknown'}`;
    const current = buckets.get(key);
    if (!current || current.resetAt <= now) {
      buckets.set(key, { count: 1, resetAt: now + windowMs });
      return next();
    }
    current.count += 1;
    if (current.count > limit) {
      res.set('Retry-After', String(Math.ceil((current.resetAt - now) / 1000)));
      return res
        .status(429)
        .json({ message: 'Too many requests. Please try again shortly.', code: 'RATE_LIMITED' });
    }
    return next();
  };

module.exports = simpleRateLimit;
