const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contactController');
const simpleRateLimit = require('../middleware/simpleRateLimit');

router.post(
  '/',
  simpleRateLimit({ windowMs: 60_000, limit: 5, keyPrefix: 'contact' }),
  contactController.submitContact
);

module.exports = router;
