const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// --- UPDATED AND COMPLETE LOGIN FUNCTION ---
const login = async (req, res) => {
    try {
        const { employeeId, password, role } = req.body;

        // 1. Check if a user with the given employeeId AND role exists
        const user = await User.findOne({ employeeId, role });
        if (!user) {
            // Use a generic message to avoid telling attackers which field was wrong
            return res.status(401).json({ success: false, message: 'Invalid credentials or role.' });
        }

        // 2. Compare the provided password with the hashed password in the database
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid credentials or role.' });
        }

        // 3. If login is successful, create a secure JSON Web Token (JWT)
        const payload = {
            user: {
                id: user.id,
                name: user.name,
                role: user.role
            }
        };

        // Make sure you have a JWT_SECRET in your .env file
        jwt.sign(
            payload,
            process.env.JWT_SECRET || 'your_default_secret_key', // Fallback for safety
            { expiresIn: '1h' }, // Token expires in 1 hour
            (err, token) => {
                if (err) throw err;
                // THIS IS THE CRUCIAL RESPONSE a successful login needs to send
                res.status(200).json({ success: true, token });
            }
        );

    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({ success: false, message: 'Server error during login.' });
    }
};

// You can keep the rest of your exported functions (registerUser, sendOtp, etc.)
// module.exports = { login, ... };
