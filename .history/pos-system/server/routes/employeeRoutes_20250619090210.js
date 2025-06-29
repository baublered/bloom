const express = require('express');
const router = express.Router();
const {
  registerUser,
  getEmployees,
  sendEmployeeOTP,
  verifyEmployeeOTP
} = require('../controllers/userController');
const { authenticate, adminOnly } = require('../middleware/authMiddleware');

// Admin-only routes
router.post('/register', authenticate, adminOnly, registerUser); 
router.get('/', authenticate, adminOnly, getEmployees);

// OTP routes
router.post('/send-otp', sendEmployeeOTP);
router.post('/verify-otp', verifyEmployeeOTP);

module.exports = router;
