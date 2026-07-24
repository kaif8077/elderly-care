const express = require('express');
const authMiddleware = require('../middleware/authmiddleware');
const { createProfile, getMedicalProfile } = require('../controllers/medicalController');
const photoController = require('../controllers/profilePhotoController');
const profilePhotoUpload = require('../middleware/profilePhotoUpload');
const router = express.Router();

router.post('/', authMiddleware, createProfile);
router.post('/:userId/photo', authMiddleware, profilePhotoUpload, photoController.upload);
router.get('/:userId/photo', authMiddleware, photoController.get);
router.delete('/:userId/photo', authMiddleware, photoController.remove);
router.get('/:userId', authMiddleware, getMedicalProfile);

module.exports = router;