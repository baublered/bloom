const express = require('express');
const router = express.Router();

// --- FIX: Import the 'resetPassword' function ---
const {
  registerUser,
  login,
  sendOtp,
  verifyOtp,
  resetPassword, 
  getMe,
  updateMe
} = require('../controllers/authController');
const { authenticate } = require('../middleware/authMiddleware'); // Import your auth middleware

// ... (your existing routes for login, register, etc.)

// --- NEW: Protected routes for user profile ---

// GET /api/auth/me - Fetches the logged-in user's profile
router.get('/me', authenticate, getMe);

// PUT /api/auth/me - Updates the logged-in user's profile
router.put('/me', authenticate, updateMe);

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

// --- NEW: Add the route for resetting the password ---
// This defines the endpoint that your ResetPassword.jsx component will call.
// Endpoint: POST /api/auth/reset-password
router.post('/reset-password', resetPassword);


module.exports = router;
