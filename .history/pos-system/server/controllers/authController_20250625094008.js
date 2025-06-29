const User = require('../models/User');
const nodemailer = require('nodemailer');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

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
        const existingUser = await User.findOne({ $or: [{ employeeId }, { email }, { phone }] });
        if (existingUser) {
            if (existingUser.email === email) {
                return res.status(400).json({ message: 'A user with this email already exists.' });
            }
            if (existingUser.phone === phone) {
                return res.status(400).json({ message: 'A user with this contact number already exists.' });
            }
            if (existingUser.employeeId === employeeId) {
                return res.status(400).json({ message: 'A user with this Employee ID already exists.' });
            }
            return res.status(400).json({ message: 'A user with these credentials already exists.' });
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

// Handles sending an OTP for password reset
const sendOtp = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      // Return 404 if email is not registered
      return res.status(404).json({ message: 'No account found with this email.' });
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
};

// --- OTP Verification Function (MODIFIED FOR EMAIL) ---
const verifyOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;
        const user = await User.findOne({
            email,
            resetPasswordOtp: otp,
            resetPasswordExpires: { $gt: Date.now() } // Check if OTP is not expired
        });

        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired OTP.' });
        }

        // OTP is correct. Clear it so it cannot be used again.
        user.resetPasswordOtp = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        res.status(200).json({ success: true, message: 'OTP verified successfully.' });
    } catch (error) {
        console.error('Error verifying OTP:', error);
        res.status(500).json({ message: 'Failed to verify OTP.' });
    }
};

// --- Password Reset Function ---
const resetPassword = async (req, res) => {
    try {
        const { email, newPassword } = req.body;

        if (!email || !newPassword) {
            return res.status(400).json({ message: 'Email and new password are required.' });
        }

        const user = await User.findOne({ email });

        if (!user) {
            // This case should ideally not be hit if the flow is correct
            return res.status(400).json({ message: 'User not found.' });
        }

        // Set the new password. Your User model's pre-save hook will hash it.
        user.password = newPassword;
        await user.save();

        res.status(200).json({ success: true, message: 'Password has been reset successfully.' });

    } catch (error) {
        console.error('Error resetting password:', error);
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
