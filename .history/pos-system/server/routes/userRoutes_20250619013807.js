const express = require('express');
const router = express.Router();
// Import both login and the user registration function from your controller
const { login, registerUser } = require('../controllers/userController');

// This route already exists
// POST /api/users/login
router.post('/login', login);

// --- NEW: Add this route for user registration ---
// POST /api/users/register
router.post('/register', registerUser);

module.exports = router;
