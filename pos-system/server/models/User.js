const mongoose = require('mongoose');

// Define the schema for the User
const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  middleInitial: {
    type: String,
    required: false,
  },
  username: {
    type: String,
    required: true,
    unique: true, // Ensure username is unique
  },
  password: {
    type: String,
    required: true,
  },
  contactNumber: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    required: true,
    enum: ['admin', 'employee'], // Ensure role is either 'admin' or 'employee'
  },
});

// Export the User model
module.exports = mongoose.model('User', userSchema);
