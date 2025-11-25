const express = require('express');
const router = express.Router();
const feedbackController = require('../controllers/feedbackController');

router.post('/', feedbackController.submitFeedback); // Will handle POST /api/feedback

module.exports = router;