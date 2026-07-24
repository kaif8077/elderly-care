const securityHeaders = (req, res, next) => {
  res.set({
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'Referrer-Policy': 'no-referrer',
    'Permissions-Policy': 'camera=(), microphone=(), payment=(), usb=()',
    'Cross-Origin-Resource-Policy': 'same-site'
  });
  next();
};

module.exports = securityHeaders;
