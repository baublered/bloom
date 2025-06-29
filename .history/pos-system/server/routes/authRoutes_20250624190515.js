const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const User = require('../models/User'); // Adjust path if necessary
// Import all the necessary functions from your single, clean authController
const {
  registerUser,
  login,
  sendOtp,
  verifyOtp
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
router.post('/send-otp', async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      // Note: For security, you might not want to reveal if an email exists.
      // But for development, this is fine.
      return res.status(404).json({ message: 'User with this email does not exist.' });
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.resetPasswordOtp = otp;
    user.resetPasswordExpires = Date.now() + 300000; // 5 minutes
    await user.save();

    // Configure Nodemailer
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Send Email
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Your Password Reset OTP',
      text: `Your OTP for password reset is: ${otp}. It will expire in 5 minutes.`,
    });

    res.status(200).json({ message: 'OTP sent successfully to your email.' });

  } catch (error) {
    console.error('Error sending OTP:', error);
    res.status(500).json({ message: 'Server error. Please try again later.' });
  }
});

// Handles verifying the OTP
// Endpoint: POST /api/auth/verify-otp
router.post('/verify-otp', verifyOtp);

module.exports = router;
