const multer = require('multer');

module.exports = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024, files: 1 },
  fileFilter: (req, file, done) => {
    if (!['application/pdf', 'image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype)) {
      return done(new multer.MulterError('LIMIT_UNEXPECTED_FILE', file.fieldname));
    }
    return done(null, true);
  }
}).single('document');
