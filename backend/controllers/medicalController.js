const MedicalProfile = require('../models/MedicalProfile');
const requiredForCompletion = [
  'firstName',
  'lastName',
  'dob',
  'gender',
  'bloodGroup',
  'height',
  'weight',
  'dietPreference',
  'preferredLanguage',
  'mobilityStatus',
  'maritalStatus',
  'phone',
  'address'
];

const createElderlyCareId = () =>
  Array.from({ length: 12 }, () => Math.floor(Math.random() * 10)).join('');

const normalizeProfileData = (body, userId) => {
  const data = { ...body, userId };
  if (body.firstName || body.lastName) {
    data.name = [body.firstName, body.lastName].filter(Boolean).join(' ').trim();
  }
  if (body.dob) data.dob = new Date(body.dob);
  if (body.height !== undefined) {
    data.height = Number(body.height);
    if (body.heightUnit === 'inches') data.height = Math.round(data.height * 2.54);
  }
  if (body.weight !== undefined) data.weight = Number(body.weight);
  [
    'medicalHistory',
    'allergies',
    'medications',
    'currentSymptoms',
    'preferredLanguage',
    'emergencyContacts'
  ].forEach((field) => {
    if (body[field] !== undefined) data[field] = Array.isArray(body[field]) ? body[field] : [];
  });
  if (data.emergencyContacts?.length) {
    const primary = data.emergencyContacts[0];
    data.emergencyContact = primary.name || '';
    data.emergencyPhone = primary.phone || '';
    data.emergencyRelationship = primary.relationship || '';
  }
  delete data.heightUnit;
  delete data.finalize;
  // Photographs are accepted only by the validated multipart upload endpoint.
  // Never let a browser fake-path or arbitrary JSON replace stored photo metadata.
  delete data.profilePhoto;
  return data;
};

exports.createProfile = async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized: User not logged in' });
  }

  try {
    const profileData = normalizeProfileData(req.body, req.user.id);
    const existingProfile = await MedicalProfile.findOne({ userId: req.user.id }).sort({
      createdAt: -1
    });
    if (!existingProfile) {
      let candidate;
      do {
        candidate = createElderlyCareId();
      } while (await MedicalProfile.exists({ elderlyCareId: candidate }));
      profileData.elderlyCareId = candidate;
    }

    // A section save must not revalidate unrelated legacy fields. Atomic updates
    // validate only the submitted section while preserving all other sections.
    if (existingProfile && !req.body.finalize) {
      if (!existingProfile.elderlyCareId) {
        let candidate;
        do {
          candidate = createElderlyCareId();
        } while (await MedicalProfile.exists({ elderlyCareId: candidate }));
        profileData.elderlyCareId = candidate;
      }
      const profile = await MedicalProfile.findByIdAndUpdate(
        existingProfile._id,
        { $set: profileData },
        { new: true, runValidators: true, context: 'query' }
      );
      return res.status(200).json({ message: 'Profile section saved', profile });
    }

    const profile = existingProfile || new MedicalProfile();
    Object.assign(profile, profileData);
    if (req.body.finalize) {
      const missing = requiredForCompletion.filter((field) => {
        const value = profile[field];
        return (
          value === undefined ||
          value === null ||
          value === '' ||
          (Array.isArray(value) && !value.length)
        );
      });
      if (
        !profile.emergencyContacts?.length ||
        !profile.emergencyContacts[0]?.name ||
        !profile.emergencyContacts[0]?.phone ||
        !profile.emergencyContacts[0]?.relationship
      ) {
        missing.push('emergencyContacts');
      }
      if (!profile.profilePhoto?.fileId) missing.push('profilePhoto');
      if (missing.length) {
        return res.status(400).json({
          message: 'Complete all mandatory profile fields before saving.',
          fields: [...new Set(missing)]
        });
      }
      profile.profileStatus = 'completed';
    }
    await profile.save();

    res.status(existingProfile ? 200 : 201).json({
      message: req.body.finalize
        ? 'Medical profile completed successfully'
        : 'Profile section saved',
      profile
    });
  } catch (error) {
    console.error('Error creating medical profile:', {
      name: error.name,
      code: error.code,
      message: error.message,
      fields: Object.keys(error.errors || {})
    });
    const isValidation = error.name === 'ValidationError' || error.name === 'CastError';
    const isDuplicate = error.code === 11000;
    res.status(isValidation || isDuplicate ? 400 : 500).json({
      message: isValidation
        ? 'Please correct the medical profile fields.'
        : isDuplicate
          ? 'A profile identifier conflict occurred. Please retry.'
          : 'Unable to save the medical profile right now.',
      code: isValidation
        ? 'PROFILE_VALIDATION_FAILED'
        : isDuplicate
          ? 'PROFILE_ID_CONFLICT'
          : 'PROFILE_SAVE_FAILED',
      fields: isValidation
        ? Object.fromEntries(
            Object.entries(error.errors || {}).map(([key, value]) => [key, value.message])
          )
        : undefined
    });
  }
};

exports.getMedicalProfile = async (req, res) => {
  const { userId } = req.params;

  try {
    // Authorization check
    if (req.user.id !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized access to medical profile' });
    }

    const medicalProfile = await MedicalProfile.findOne({ userId })
      .sort({ createdAt: -1 })
      .lean()
      .exec();

    if (!medicalProfile) {
      return res.status(404).json({ message: 'Medical profile not found' });
    }

    // Format response
    const { profilePhoto, ...safeProfile } = medicalProfile;
    const response = {
      ...safeProfile,
      dob: medicalProfile.dob ? medicalProfile.dob.toISOString().split('T')[0] : null,
      profilePhoto: profilePhoto?.fileId
        ? {
            contentType: profilePhoto.contentType,
            bytes: profilePhoto.bytes,
            uploadedAt: profilePhoto.uploadedAt,
            url: '/api/medical/' + userId + '/photo'
          }
        : null
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('Error fetching medical profile:', error);
    res.status(500).json({
      message: 'Error fetching medical profile',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

exports.updateProfile = async (req, res) => {
  const { userId } = req.params;

  try {
    // Authorization check
    if (req.user.id !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized to update this profile' });
    }

    // Find existing profile
    const existingProfile = await MedicalProfile.findOne({ userId });
    if (!existingProfile) {
      return res.status(404).json({ message: 'Medical profile not found' });
    }

    // Process updates
    const updates = { ...req.body };

    // Handle height conversion if needed
    if (updates.height) {
      updates.height = Number(updates.height);
      if (req.body.heightUnit === 'inches') {
        updates.height = Math.round(updates.height * 2.54);
      }
    }

    // Convert weight to number if present
    if (updates.weight) {
      updates.weight = Number(updates.weight);
    }

    // Convert date if present
    if (updates.dob) {
      updates.dob = new Date(updates.dob);
    }

    // Update and save profile
    Object.assign(existingProfile, updates);
    await existingProfile.save();

    res.status(200).json({
      message: 'Medical profile updated successfully',
      profile: existingProfile
    });
  } catch (error) {
    console.error('Error updating medical profile:', error);
    res.status(500).json({
      message: 'Error updating medical profile',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

exports.getQRCode = async (req, res) => {
  const { userId } = req.params;

  try {
    // Authorization check
    if (req.user.id !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized access to QR code' });
    }

    const profile = await MedicalProfile.findOne({ userId });
    if (!profile || !profile.qrCodeImage) {
      return res.status(404).json({ message: 'QR code not found' });
    }

    res.status(200).json({ qrCodeImage: profile.qrCodeImage });
  } catch (error) {
    console.error('Error fetching QR code:', error);
    res.status(500).json({
      message: 'Error fetching QR code',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

exports.normalizeProfileData = normalizeProfileData;
