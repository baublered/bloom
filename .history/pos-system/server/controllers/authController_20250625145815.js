const User = require('../models/User');
const Otp = require('../models/Otp');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer'); // Make sure nodemailer is installed

// --- Nodemailer Transporter Setup ---
// This uses the credentials from your .env file
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER, // The email address you're sending from
        pass: process.env.EMAIL_PASS  // The 16-character App Password you generated
    }
});

// --- User Login Function ---
const login = async (req, res) => {
    // ... (Your existing login logic remains the same)
};

// --- User Registration Function ---
const registerUser = async (req, res) => {
    // ... (Your existing registration logic remains the same)
};

// --- UPDATED: sendOtp function to use email ---
const sendOtp = async (req, res) => {
  try {
    // The frontend should now send the user's email instead of contactNumber
    const { email } = req.body;
    
    // Find a user with the provided email address
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'No user found with this email address.' });
    }

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Save the OTP to the database, linked to the user's email
    await Otp.create({ email: user.email, otp: otpCode });
    
    // --- Send the OTP via Email ---
    await transporter.sendMail({
        from: `"BloomTrack Support" <${process.env.EMAIL_USER}>`,
        to: user.email,
        subject: 'Your BloomTrack Password Reset Code',
        text: `Your password reset code is: ${otpCode}. It will expire in 10 minutes.`,
        html: `<b>Your password reset code is: ${otpCode}</b><p>It will expire in 10 minutes.</p>`
    });

    console.log(`[DEV MODE] OTP sent to ${user.email}: ${otpCode}`);
    res.status(200).json({ success: true, message: 'OTP has been sent to your email successfully.' });

  } catch (error) {
    console.error('Error sending OTP:', error);
    res.status(500).json({ message: 'Failed to send OTP email. Please try again.' });
  }
};

// --- UPDATED: verifyOtp function to use email ---
const verifyOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;
        const otpRecord = await Otp.findOne({ email, otp });

        if (!otpRecord) {
            return res.status(400).json({ message: 'Invalid or expired OTP.' });
        }
        await Otp.deleteOne({ _id: otpRecord._id });
        
        res.status(200).json({ success: true, message: 'OTP verified successfully.' });
    } catch (error) {
        console.error('Error verifying OTP:', error);
        res.status(500).json({ message: 'Failed to verify OTP.' });
    }
};

module.exports = {
    login,
    registerUser,
    sendOtp,
    verifyOtp,
};
