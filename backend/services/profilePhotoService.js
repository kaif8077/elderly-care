const { Readable } = require('stream');
const mongoose = require('mongoose');

const BUCKET_NAME = 'profilePhotos';

const detectImageType = (buffer) => {
  if (!Buffer.isBuffer(buffer) || buffer.length < 12) return null;
  if (buffer.subarray(0, 3).equals(Buffer.from([0xff, 0xd8, 0xff]))) return 'image/jpeg';
  if (buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return 'image/png';
  if (buffer.subarray(0, 4).toString('ascii') === 'RIFF'
    && buffer.subarray(8, 12).toString('ascii') === 'WEBP') return 'image/webp';
  return null;
};

const bucket = () => {
  if (!mongoose.connection.db) throw new Error('Database storage is unavailable');
  return new mongoose.mongo.GridFSBucket(mongoose.connection.db, { bucketName: BUCKET_NAME });
};

const storePhoto = ({ buffer, contentType, userId }) => new Promise((resolve, reject) => {
  const filename = `profile-${userId}-${Date.now()}`;
  const stream = bucket().openUploadStream(filename, {
    contentType,
    metadata: { ownerId: String(userId), purpose: 'profile_photo' }
  });
  stream.on('error', reject);
  stream.on('finish', () => resolve({
    fileId: stream.id,
    contentType,
    bytes: buffer.length,
    uploadedAt: new Date()
  }));
  Readable.from(buffer).pipe(stream);
});

const removePhoto = async (fileId) => {
  if (!fileId) return;
  await bucket().delete(new mongoose.Types.ObjectId(fileId));
};

module.exports = { bucket, detectImageType, removePhoto, storePhoto };
