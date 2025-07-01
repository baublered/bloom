const express = require('express');
const multer = require('multer');
const path = require('path');
const router = express.Router();

// Import User model
const User = require('../models/User');
const { logUserAction } = require('../utils/userLogger');

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/profiles/');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'profile-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
    },
    fileFilter: function (req, file, cb) {
        if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
            return cb(new Error('Only image files are allowed!'), false);
        }
        cb(null, true);
    }
});

const {
  registerUser,
  login,
  sendOtp,
  verifyOtp,
  resetPassword,
  getMe,
  updateMe,
  uploadProfilePhoto,
  removeProfilePhoto
} = require('../controllers/authController');

// --- CORRECT: Import the middleware ---
const { authenticate, adminOnly } = require('../middleware/authMiddleware');


// === Public Routes ===
router.post('/login', login);
router.post('/send-otp', sendOtp);
router.post('/verify-otp', verifyOtp);
router.post('/reset-password', resetPassword);

// === Protected Admin-Only Route ===
// The 'authenticate' and 'adminOnly' middleware run before the 'registerUser' function.
router.post('/register', authenticate, adminOnly, registerUser);


// === Protected User Profile Routes ===
// The 'authenticate' middleware runs first to check for a valid token.
router.get('/me', authenticate, getMe);
router.put('/me', authenticate, updateMe);
router.post('/upload-profile-photo', authenticate, upload.single('profilePhoto'), uploadProfilePhoto);
router.delete('/remove-profile-photo', authenticate, removeProfilePhoto);

// GET /api/auth/users - Get all users (Admin only)
router.get('/users', authenticate, adminOnly, async (req, res) => {
  try {
    const users = await User.find({}, '-password').sort({ createdAt: -1 });
    res.json({ users });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/auth/users/:id - Delete user (Admin only)
router.delete('/users/:id', authenticate, adminOnly, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Prevent admin from deleting themselves
    if (id === req.user.id) {
      return res.status(400).json({ message: 'Cannot delete your own account' });
    }

    // Find and delete user
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prevent deleting other admins
    if (user.role === 'admin') {
      return res.status(400).json({ message: 'Cannot delete admin accounts' });
    }

    await User.findByIdAndDelete(id);
    
    // Log the action
    await logUserAction(
      req.user.id,
      req.user.name,
      'DELETE_USER',
      `Deleted user: ${user.name} (${user.username})`,
      user.name,
      req
    );

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/auth/user-logs - Get user activity logs (Admin only)
router.get('/user-logs', authenticate, adminOnly, async (req, res) => {
  try {
    try {
      const UserLog = require('../models/UserLog');
      const logs = await UserLog.find({})
        .sort({ createdAt: -1 })
        .limit(1000); // Limit to last 1000 logs

      res.json({ logs });
    } catch (modelError) {
      // If UserLog model doesn't exist, return empty logs
      console.log('UserLog model not found, returning empty logs');
      res.json({ logs: [] });
    }
  } catch (error) {
    console.error('Error fetching user logs:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
