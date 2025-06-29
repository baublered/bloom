const User = require('../models/User');
const Otp = require('../models/Otp');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken'); // Import jsonwebtoken

// --- User Registration Function (Stays the same) ---
const registerUser = async (req, res) => {
    // ... your existing registerUser logic
};

// --- UPDATED: User Login Function ---
const login = async (req, res) => {
    try {
        const { employeeId, password, role } = req.body;

        // 1. Check if user with the given employeeId AND role exists
        const user = await User.findOne({ employeeId, role });
        if (!user) {
            // Use a generic message to avoid telling attackers which field was wrong
            return res.status(401).json({ message: 'Invalid credentials or role.' });
        }

        // 2. Compare the provided password with the hashed password in the database
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials or role.' });
        }

        // 3. If login is successful, create a secure JSON Web Token (JWT)
        const payload = {
            user: {
                id: user.id,
                name: user.name,
                role: user.role
            }
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET, // Your secret key from your .env file
            { expiresIn: '1h' }, // Token expires in 1 hour
            (err, token) => {
                if (err) throw err;
                res.status(200).json({ success: true, token });
            }
        );

    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({ message: 'Server error during login.' });
    }
};


// --- OTP Functions (Stay the same) ---
const sendOtp = async (req, res) => {
    // ... your existing sendOtp logic
};
const verifyOtp = async (req, res) => {
    // ... your existing verifyOtp logic
};


module.exports = {
    registerUser,
    login,
    sendOtp,
    verifyOtp,
};
