const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Route for sending the OTP
// POST /api/auth/send-otp
router.post('/send-otp', authController.sendOtp);

// Route for verifying the OTP
// POST /api/auth/verify-otp
router.post('/verify-otp', authController.verifyOtp);

module.exports = router;
