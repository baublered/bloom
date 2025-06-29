const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
  employeeId: {
    type: String,
    required: true,
    unique: true
  },
  name: String,
  email: String,
  // IMPORTANT: Add the phone field to store the user's contact number
  phone: {
    type: String,
    required: true,
    unique: true,
  },
  password: { // You'll also need a password field to reset it later
    type: String,
    required: true,
  }
});

module.exports = mongoose.model('Employee', employeeSchema);
