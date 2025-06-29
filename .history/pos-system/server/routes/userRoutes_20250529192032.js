const express = require('express');
const router = express.Router();
const { login } = require('../controllers/userController');

// POST /api/auth/login
router.post('/login', login);

module.exports = router;