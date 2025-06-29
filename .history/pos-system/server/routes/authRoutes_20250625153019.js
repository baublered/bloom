const express = require('express');
const router = express.Router();

const {
  registerUser,
  login,
  sendOtp,
  verifyOtp,
} = require('../controllers/authController');

// It's good practice to have middleware for protected routes,
// which can be added back later if needed.
// const { authenticate, adminOnly } = require('../middleware/authMiddleware');


// === USER REGISTRATION & LOGIN ===

// Handles new user registration
// Endpoint: POST /api/auth/register
router.post('/register', registerUser);

// Handles user login
// Endpoint: POST /api/auth/login
router.post('/login', login);


// === OTP and PASSWORD RESET ===

// Handles sending an OTP for password reset
// Endpoint: POST /api/auth/send-otp
router.post('/send-otp', sendOtp);

// Handles verifying the OTP
// Endpoint: POST /api/auth/verify-otp
router.post('/verify-otp', verifyOtp);

module.exports = router;
