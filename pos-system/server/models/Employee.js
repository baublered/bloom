// server/models/employee.js
const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
  employeeId: {
    type: String,
    required: true,
    unique: true
  },
  name: String,
  email: String, // optional, depending on your setup
});

module.exports = mongoose.model('Employee', employeeSchema);
