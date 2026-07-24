const multer = require('multer');

const allowedTypes = new Set(['image/jpeg', 'image/png', 'image/webp']);
const parser = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 3 * 1024 * 1024, files: 1, fields: 1, parts: 2 },
  fileFilter: (req, file, done) => {
    if (!allowedTypes.has(file.mimetype)) return done(new Error('Only JPEG, PNG, and WebP images are allowed'));
    return done(null, true);
  }
}).single('photo');

module.exports = (req, res, next) => parser(req, res, (error) => {
  if (!error) return next();
  const tooLarge = error.code === 'LIMIT_FILE_SIZE';
  return res.status(400).json({
    message: tooLarge ? 'Profile photo must be 3 MB or smaller' : error.message,
    code: tooLarge ? 'PHOTO_TOO_LARGE' : 'INVALID_PHOTO'
  });
});
