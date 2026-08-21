const mongoose = require('mongoose');
const MedicalProfile = require('../models/MedicalProfile');
const {
  bucket,
  detectImageType,
  removePhoto,
  storePhoto
} = require('../services/profilePhotoService');

const ownsProfile = (req) => String(req.user.id) === String(req.params.userId);

exports.upload = async (req, res) => {
  if (!ownsProfile(req))
    return res.status(403).json({ message: 'You can only update your own photograph' });
  if (!req.file)
    return res.status(400).json({ message: 'Choose a profile photograph', code: 'PHOTO_REQUIRED' });
  const detected = detectImageType(req.file.buffer);
  if (!detected || detected !== req.file.mimetype) {
    return res.status(400).json({
      message: 'The uploaded file is not a valid supported image',
      code: 'INVALID_PHOTO_CONTENT'
    });
  }

  try {
    const profile = await MedicalProfile.findOne({ userId: req.user.id }).sort({ createdAt: -1 });
    if (!profile)
      return res
        .status(404)
        .json({ message: 'Create a medical profile before uploading a photograph' });
    const previousFileId = profile.profilePhoto?.fileId;
    const stored = await storePhoto({
      buffer: req.file.buffer,
      contentType: detected,
      userId: req.user.id
    });
    profile.profilePhoto = stored;
    await profile.save();
    if (previousFileId) removePhoto(previousFileId).catch(() => {});
    return res.json({
      message: 'Profile photograph updated',
      profilePhoto: { ...stored, url: `/api/medical/${req.user.id}/photo` }
    });
  } catch (error) {
    return res.status(500).json({ message: 'Unable to store the profile photograph' });
  }
};

exports.get = async (req, res) => {
  if (!ownsProfile(req) && !['admin', 'super_admin'].includes(req.user.role)) {
    return res.status(403).json({ message: 'Photograph access denied' });
  }
  try {
    const profile = await MedicalProfile.findOne({ userId: req.params.userId })
      .sort({ createdAt: -1 })
      .select('profilePhoto')
      .lean();
    const photo = profile?.profilePhoto;
    if (!photo?.fileId) return res.status(404).json({ message: 'Profile photograph not found' });
    res.set({
      'Content-Type': photo.contentType,
      'Content-Length': String(photo.bytes),
      'Cache-Control': 'private, max-age=300',
      'Content-Disposition': 'inline; filename="profile-photo"'
    });
    return bucket()
      .openDownloadStream(new mongoose.Types.ObjectId(photo.fileId))
      .on('error', () => {
        if (!res.headersSent) res.status(404).end();
        else res.destroy();
      })
      .pipe(res);
  } catch (error) {
    return res.status(500).json({ message: 'Unable to load the profile photograph' });
  }
};

exports.remove = async (req, res) => {
  if (!ownsProfile(req))
    return res.status(403).json({ message: 'You can only remove your own photograph' });
  try {
    const profile = await MedicalProfile.findOne({ userId: req.user.id }).sort({ createdAt: -1 });
    if (!profile) return res.status(404).json({ message: 'Medical profile not found' });
    const fileId = profile.profilePhoto?.fileId;
    if (fileId) await removePhoto(fileId);
    profile.profilePhoto = undefined;
    await profile.save();
    return res.json({ message: 'Profile photograph removed' });
  } catch (error) {
    return res.status(500).json({ message: 'Unable to remove the profile photograph' });
  }
};
