const express = require('express');
const router = express.Router();
// Make sure to import the new registerUser function from your controller
const { login, registerUser } = require('../controllers/userController');

// This route handles user login
// Endpoint: POST /api/users/login
router.post('/login', login);

// --- THIS IS THE CRUCIAL ROUTE ---
// This route handles new user registration
// Endpoint: POST /api/users/register
router.post('/register', registerUser);

module.exports = router;
