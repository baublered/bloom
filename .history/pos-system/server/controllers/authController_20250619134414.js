const User = require('../models/User');
const Otp = require('../models/Otp');
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
        const { name, employeeId, phone, password, role } = req.body;
        if (!name || !employeeId || !phone || !password || !role) {
            return res.status(400).json({ message: 'Please provide all required fields.' });
        }
        const existingUser = await User.findOne({ employeeId });
        if (existingUser) {
            return res.status(400).json({ message: 'A user with this Employee ID already exists.' });
        }
        const newUser = new User({ name, employeeId, phone, password, role });
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
        const { contactNumber } = req.body;
        const user = await User.findOne({ phone: contactNumber });
        if (!user) {
            return res.status(404).json({ message: 'No user found with this contact number.' });
        }
        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
        await Otp.create({ phone: contactNumber, otp: otpCode });
        console.log(`[DEV MODE] OTP for ${contactNumber} is: ${otpCode}`);
        res.status(200).json({ success: true, message: 'OTP has been sent successfully.' });
    } catch (error) {
        console.error('Error sending OTP:', error);
        res.status(500).json({ message: 'Failed to send OTP. Please try again.' });
    }
};

// --- OTP Verification Function ---
const verifyOtp = async (req, res) => {
    try {
        const { contactNumber, otp } = req.body;
        const otpRecord = await Otp.findOne({ phone: contactNumber, otp: otp });
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

// Export all the functions
module.exports = {
    login,
    registerUser,
    sendOtp,
    verifyOtp
};
