const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
  
  email: { 
    type: String,
    required: true,
  },
  otp: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    // This will automatically delete the OTP document after 10 minutes
    expires: 600, 
  },
});

module.exports = mongoose.model('Otp', otpSchema);
