const { Readable } = require('stream');
const mongoose = require('mongoose');

const bucket = () => {
  if (!mongoose.connection.db) throw new Error('Database storage is unavailable');
  return new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
    bucketName: 'medicalDocuments'
  });
};

const detectContentType = (buffer) => {
  if (!Buffer.isBuffer(buffer) || buffer.length < 8) return null;
  if (buffer.subarray(0, 4).toString() === '%PDF') return 'application/pdf';
  if (buffer.subarray(0, 3).equals(Buffer.from([0xff, 0xd8, 0xff]))) return 'image/jpeg';
  if (buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])))
    return 'image/png';
  if (
    buffer.subarray(0, 4).toString('ascii') === 'RIFF' &&
    buffer.subarray(8, 12).toString('ascii') === 'WEBP'
  )
    return 'image/webp';
  return null;
};

const store = ({ buffer, contentType, userId }) =>
  new Promise((resolve, reject) => {
    const stream = bucket().openUploadStream(`medical-document-${userId}-${Date.now()}`, {
      contentType,
      metadata: { ownerId: String(userId), purpose: 'medical_document' }
    });
    stream.on('error', reject);
    stream.on('finish', () => resolve(stream.id));
    Readable.from(buffer).pipe(stream);
  });

module.exports = { bucket, detectContentType, store };
