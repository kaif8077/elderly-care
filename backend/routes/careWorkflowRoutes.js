const express = require('express');
const authMiddleware = require('../middleware/authmiddleware');
const controller = require('../controllers/careWorkflowController');

const router = express.Router();
const safe = (handler) => (req, res, next) =>
  Promise.resolve(handler(req, res, next)).catch((error) => {
    console.error('Care workflow error:', error.message);
    if (!res.headersSent)
      res.status(error.code === 11000 ? 409 : 500).json({
        message:
          error.code === 11000
            ? 'This care-team invitation already exists'
            : 'Unable to complete this care workflow request'
      });
  });
router.post('/emergency-contact-verification/:token', safe(controller.verifyEmergencyContact));
router.use(authMiddleware);
router.get('/overview', safe(controller.getOverview));
router.patch('/privacy', safe(controller.updatePrivacy));
router.patch('/notification-preferences', safe(controller.updatePreferences));
router.post('/reminders', safe(controller.createReminder));
router.patch('/reminders/:id', safe(controller.updateReminder));
router.post('/care-team/invitations', safe(controller.inviteCareMember));
router.post('/care-team/invitations/:token/accept', safe(controller.acceptCareInvitation));
router.delete('/care-team/:id', safe(controller.revokeCareMember));
router.post('/emergency-contacts/:contactId/verify', safe(controller.requestContactVerification));

module.exports = router;
