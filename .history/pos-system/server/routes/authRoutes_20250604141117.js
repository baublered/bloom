const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/User');  // Assuming the User model is in the models folder
const router = express.Router();
const { register, login } = require('../controllers/userController');

// POST route to register a new user
router.post('/register', async (req, res) => {
  // Destructure the role field along with the other fields
  const { firstName, lastName, middleInitial, username, password, contactNumber, role } = req.body;

  // Validate if the data is complete, including the role field
  if (!firstName || !lastName || !username || !password || !contactNumber || !role) {
    return res.status(400).json({ message: 'Please fill all fields' });
  }

  // Validate the role field to ensure it's either 'admin' or 'employee'
  if (!['admin', 'employee'].includes(role)) {
    return res.status(400).json({ message: 'Role must be either admin or employee' });
  }

  try {
    // Check if the username already exists
    const userExists = await User.findOne({ username });
    if (userExists) {
      return res.status(400).json({ message: 'Username already exists' });
    }

    // Hash the password before saving
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create a new user, including the role field
    const newUser = new User({
      firstName,
      lastName,
      middleInitial,
      username,
      contactNumber,
      password: hashedPassword,
      role  // Added role field here
    });

    // Save user to the database
    await newUser.save();
    res.status(201).json({ message: 'User registered successfully!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST route to login a user
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  // Check if both username and password are provided
  if (!username || !password) {
    return res.status(400).json({ message: 'Please enter both username and password' });
  }

  try {
    // Find the user by username
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Compare the entered password with the hashed one in the DB
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Login successful
    res.status(200).json({
      message: 'Login successful',
      user: {
        id: user._id,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        contactNumber: user.contactNumber,
        role: user.role  // Return role with the user details
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
