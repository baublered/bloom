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
    // ... (Your existing sendOtp logic)
};

// --- OTP Verification Function ---
const verifyOtp = async (req, res) => {
    // ... (Your existing verifyOtp logic)
};

// --- Password Reset Function ---
const resetPassword = async (req, res) => {
    // ... (Your existing resetPassword logic)
};


// --- NEW: Get Logged-In User's Profile ---
const getMe = async (req, res) => {
    try {
        // req.user.id comes from the decoded token in your authMiddleware
        const user = await User.findById(req.user.id).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        console.error('Error fetching user profile:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// --- NEW: Update Logged-In User's Profile ---
const updateMe = async (req, res) => {
    try {
        const { name, email, phone } = req.body;
        
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.name = name || user.name;
        user.email = email || user.email;
        user.phone = phone || user.phone;

        const updatedUser = await user.save();
        
        res.json({
            success: true,
            message: "Profile updated successfully!",
            user: {
                id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                phone: updatedUser.phone,
                role: updatedUser.role
            }
        });
    } catch (error) {
        console.error('Error updating user profile:', error);
        res.status(500).json({ message: 'Server error' });
    }
};


// --- UPDATED: Export all functions, including the new ones ---
module.exports = {
    login,
    registerUser,
    sendOtp,
    verifyOtp,
    resetPassword,
    getMe,
    updateMe
};
