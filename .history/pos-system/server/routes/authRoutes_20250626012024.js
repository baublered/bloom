const express = require('express');
const router = express.Router();

const {
  registerUser,
  login,
  sendOtp,
  verifyOtp,
  resetPassword,
  getMe,
  updateMe
} = require('../controllers/authController');

// --- CORRECT: Import the middleware ---
const { authenticate, adminOnly } = require('../middleware/authMiddleware');


// === Public Routes ===
router.post('/login', login);
router.post('/send-otp', sendOtp);
router.post('/verify-otp', verifyOtp);
router.post('/reset-password', resetPassword);

// === Protected Admin-Only Route ===
// The 'authenticate' and 'adminOnly' middleware run before the 'registerUser' function.
router.post('/register', authenticate, adminOnly, registerUser);


// === Protected User Profile Routes ===
// The 'authenticate' middleware runs first to check for a valid token.
router.get('/me', authenticate, getMe);
router.put('/me', authenticate, updateMe);


module.exports = router;
