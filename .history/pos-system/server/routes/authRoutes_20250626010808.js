const express = require('express');
const router = express.Router();

// Import all necessary controller functions
const {
  registerUser,
  login,
  sendOtp,
  verifyOtp,
  resetPassword,
  getMe,
  updateMe
} = require('../controllers/authController');

// Import your authentication middleware
// Make sure this file exists and is correctly set up
const { authenticate, adminOnly } = require('../middleware/authMiddleware');

// =======================================
//  Public Authentication Routes
// =======================================

// POST /api/auth/login - Handles user login for both roles
router.post('/login', login);

// POST /api/auth/register - Handles new user registration
// Note: We've added `authenticate` and `adminOnly` middleware.
// This ensures ONLY a logged-in admin can create new users.
router.post('/register', authenticate, adminOnly, registerUser);


// =======================================
//  Password Reset Routes
// =======================================

// POST /api/auth/send-otp - Sends a password reset OTP to a user's email
router.post('/send-otp', sendOtp);

// POST /api/auth/verify-otp - Verifies the OTP sent to the user
router.post('/verify-otp', verifyOtp);

// POST /api/auth/reset-password - Resets the user's password after successful OTP verification
router.post('/reset-password', resetPassword);


// =======================================
//  Protected User Profile Routes
// =======================================
// The 'authenticate' middleware will run first on these routes.
// It checks for a valid token before allowing access.

// GET /api/auth/me - Fetches the profile of the currently logged-in user
router.get('/me', authenticate, getMe);

// PUT /api/auth/me - Updates the profile of the currently logged-in user
router.put('/me', authenticate, updateMe);


module.exports = router;
