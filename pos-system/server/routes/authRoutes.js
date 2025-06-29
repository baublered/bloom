const express = require('express');
const multer = require('multer');
const path = require('path');
const router = express.Router();

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


module.exports = router;
