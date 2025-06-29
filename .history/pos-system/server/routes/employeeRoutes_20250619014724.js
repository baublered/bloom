// In routes/employeeRoutes.js

const express = require('express');
const router = express.Router();
// --- FIX: Import 'registerUser' and rename it to 'registerEmployee' for this file ---
const {
  registerUser: registerEmployee, // Use 'registerUser' from the controller
  getEmployees,
  sendEmployeeOTP,
  verifyEmployeeOTP
} = require('../controllers/userController');
const { authenticate, adminOnly } = require('../middleware/authMiddleware');

// Admin-only routes
router.post('/register', authenticate, adminOnly, registerEmployee);
router.get('/', authenticate, adminOnly, getEmployees);

// OTP routes
router.post('/send-otp', sendEmployeeOTP);
router.post('/verify-otp', verifyEmployeeOTP);

module.exports = router;