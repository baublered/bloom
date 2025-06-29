// At the top of your file, make sure these are imported
const User = require('../models/User');
const bcrypt = require('bcryptjs');

// ... (keep all your existing functions: login, registerUser, sendOtp, etc.)


// --- NEW: Get Logged-In User's Profile ---
// This function uses the ID from the JWT to find the current user
exports.getMe = async (req, res) => {
    try {
        // req.user is added by your authMiddleware from the decoded token
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
exports.updateMe = async (req, res) => {
    try {
        const { name, email, phone } = req.body;
        
        // Find the user by the ID from their token
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Update fields
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

// Make sure to export the new functions at the bottom
// module.exports = { ... getMe, updateMe };
