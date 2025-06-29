const User = require('../models/User');
const Otp = require('../models/Otp');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

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
        
        // Add debugging
        console.log('Login attempt:');
        console.log('- employeeId:', employeeId);
        console.log('- role:', role);
        
        // First check if user exists with just employeeId
        const userCheck = await User.findOne({ employeeId });
        console.log('User found with employeeId only:', userCheck ? 'YES' : 'NO');
        if (userCheck) {
            console.log('User role in DB:', userCheck.role);
            console.log('Requested role:', role);
            console.log('Role match:', userCheck.role === role);
        }
        
        // Original query
        const user = await User.findOne({ employeeId, role });
        console.log('User found with both employeeId and role:', user ? 'YES' : 'NO');
        
        if (!user) {
            return res.status(401).json({ success: false, message: 'Invalid credentials or role.' });
        }
        
        const isMatch = await bcrypt.compare(password, user.password);
        console.log('Password match:', isMatch);
        
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid credentials or role.' });
        }
        
        const payload = { user: { id: user.id, name: user.name, role: user.role } };
        const jwtSecret = process.env.JWT_SECRET || 'your_default_secret_key';
        console.log('[DEBUG] Creating token with secret:', jwtSecret.substring(0, 5) + '...');
        
        jwt.sign(
            payload,
            jwtSecret,
            { expiresIn: '24h' }, // Extended to 24 hours for better user experience
            (err, token) => {
                if (err) throw err;
                console.log('[DEBUG] Token created successfully');
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
        
        // Check for existing employeeId
        const existingUser = await User.findOne({ employeeId });
        if (existingUser) {
            return res.status(400).json({ message: 'A user with this Employee ID already exists.' });
        }
        
        // Check for existing username (in case frontend sends different values)
        const existingUsername = await User.findOne({ username: employeeId });
        if (existingUsername) {
            return res.status(400).json({ message: 'A user with this username already exists.' });
        }
        
        // Check for existing email
        const existingEmail = await User.findOne({ email });
        if (existingEmail) {
            return res.status(400).json({ message: 'A user with this email already exists.' });
        }
        
        // Check for existing phone
        const existingPhone = await User.findOne({ phone });
        if (existingPhone) {
            return res.status(400).json({ message: 'A user with this phone number already exists.' });
        }
        
        // Create new user with both username and employeeId
        const newUser = new User({ 
            name, 
            employeeId, 
            username: employeeId, // Set username = employeeId for login
            phone, 
            password, 
            role, 
            email 
        });
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
        console.log('[DEBUG] getMe called with user:', req.user);
        
        // req.user.id comes from the decoded token in your authMiddleware
        const user = await User.findById(req.user.id).select('-password');
        console.log('[DEBUG] User found in DB:', user ? 'YES' : 'NO');
        
        if (!user) {
            console.log('[DEBUG] User not found in database');
            return res.status(404).json({ message: 'User not found' });
        }
        
        // Include profile photo URL if it exists
        const userData = user.toObject();
        if (userData.profilePhoto) {
            userData.profilePhotoUrl = `/${userData.profilePhoto}`;
        }
        
        console.log('[DEBUG] Returning user data:', userData);
        res.json(userData);
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

// --- NEW: Upload Profile Photo ---
const uploadProfilePhoto = async (req, res) => {
    try {
        console.log('[DEBUG] uploadProfilePhoto called with user:', req.user);
        console.log('[DEBUG] File uploaded:', req.file);

        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No file uploaded' });
        }

        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Delete old profile photo if it exists
        if (user.profilePhoto) {
            const oldPhotoPath = path.join(__dirname, '..', user.profilePhoto);
            if (fs.existsSync(oldPhotoPath)) {
                fs.unlinkSync(oldPhotoPath);
            }
        }

        // Save new profile photo path to user
        const photoPath = `uploads/profiles/${req.file.filename}`;
        user.profilePhoto = photoPath;
        await user.save();

        console.log('[DEBUG] Profile photo saved:', photoPath);
        
        res.json({
            success: true,
            message: 'Profile photo uploaded successfully',
            photoUrl: `/${photoPath}` // Return URL path for frontend
        });
    } catch (error) {
        console.error('Error uploading profile photo:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// --- NEW: Remove Profile Photo ---
const removeProfilePhoto = async (req, res) => {
    try {
        console.log('[DEBUG] removeProfilePhoto called with user:', req.user);

        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Delete profile photo file if it exists
        if (user.profilePhoto) {
            const photoPath = path.join(__dirname, '..', user.profilePhoto);
            if (fs.existsSync(photoPath)) {
                fs.unlinkSync(photoPath);
            }
        }

        // Remove profile photo from user record
        user.profilePhoto = null;
        await user.save();

        console.log('[DEBUG] Profile photo removed');
        
        res.json({
            success: true,
            message: 'Profile photo removed successfully'
        });
    } catch (error) {
        console.error('Error removing profile photo:', error);
        res.status(500).json({ success: false, message: 'Server error' });
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
    updateMe,
    uploadProfilePhoto,
    removeProfilePhoto
};
