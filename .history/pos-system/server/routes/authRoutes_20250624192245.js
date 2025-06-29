const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const User = require('../models/User'); // Adjust path if necessary
// Import all the necessary functions from your single, clean authController
const {
  registerUser,
  login,
  sendOtp,
  verifyOtp,
  resetPassword // Import the new function
} = require('../controllers/authController');

// It's good practice to have middleware for protected routes,
// but for now we can add it later.
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

// Handles resetting the password after OTP verification
// Endpoint: POST /api/auth/reset-password
router.post('/reset-password', resetPassword);

module.exports = router;
