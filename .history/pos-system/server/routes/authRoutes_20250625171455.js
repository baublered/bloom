const User = require('../models/User');
const Otp = require('../models/Otp');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

// --- Nodemailer Transporter Setup ---
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// --- User Login Function ---
const login = async (req, res) => {
    try {
        const { employeeId, password, role } = req.body;
        const user = await User.findOne({ employeeId, role });
        if (!user) {
            return res.status(401).json({ success: false, message: 'Invalid credentials or role.' });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid credentials or role.' });
        }
        const payload = { user: { id: user.id, name: user.name, role: user.role } };
        jwt.sign(
            payload,
            process.env.JWT_SECRET || 'your_default_secret_key',
            { expiresIn: '1h' },
            (err, token) => {
                if (err) throw err;
                res.status(200).json({ success: true, token });
            }
        );
    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({ success: false, message: 'Server error during login.' });
    }
};

// --- User Registration Function ---
const registerUser = async (req, res) => {
    try {
        const { name, employeeId, phone, password, role, email } = req.body;
        if (!name || !employeeId || !phone || !password || !role || !email) {
            return res.status(400).json({ message: 'Please provide all required fields.' });
        }
        const existingUser = await User.findOne({ employeeId });
        if (existingUser) {
            return res.status(400).json({ message: 'A user with this Employee ID already exists.' });
        }
        const newUser = new User({ name, employeeId, phone, password, role, email });
        await newUser.save();
        res.status(201).json({ 
            success: true, 
            message: 'User registered successfully!',
            user: { id: newUser._id, name: newUser.name, role: newUser.role }
        });
    } catch (error) {
        console.error('Error in registerUser:', error);
        res.status(500).json({ message: 'Server error during user registration.' });
    }
};

// --- OTP Sending Function ---
const sendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'No user found with this email address.' });
    }
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    await Otp.create({ email: user.email, otp: otpCode });
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

// --- OTP Verification Function ---
const verifyOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;
        const otpRecord = await Otp.findOne({ email, otp });
        if (!otpRecord) {
            return res.status(400).json({ message: 'Invalid or expired OTP.' });
        }
        // Do not delete the OTP yet, it's needed for the final reset step
        res.status(200).json({ success: true, message: 'OTP verified successfully.' });
    } catch (error) {
        console.error('Error verifying OTP:', error);
        res.status(500).json({ message: 'Failed to verify OTP.' });
    }
};

// --- Password Reset Function ---
const resetPassword = async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body;

        // Final security check: Verify the OTP is still valid
        const otpRecord = await Otp.findOne({ email, otp });
        if (!otpRecord) {
            return res.status(400).json({ message: 'Invalid or expired OTP. Please try again.' });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        // The pre-save hook in your User model will automatically hash this new password
        user.password = newPassword;
        await user.save();

        // Now that the password is reset, delete the used OTP
        await Otp.deleteOne({ _id: otpRecord._id });

        res.status(200).json({ success: true, message: 'Password has been reset successfully!' });

    } catch (error) {
        console.error("Error resetting password:", error);
        res.status(500).json({ message: 'Failed to reset password.' });
    }
};


// Export all the functions
module.exports = {
    login,
    registerUser,
    sendOtp,
    verifyOtp,
    resetPassword
};
