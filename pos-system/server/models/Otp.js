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
  isVerified: {
    type: Boolean,
    default: false,
  },
  attempts: {
    type: Number,
    default: 0,
    max: 5, // Maximum 5 attempts before blocking
  },
  createdAt: {
    type: Date,
    default: Date.now,
    // This will automatically delete the OTP document after 10 minutes
    expires: 600, 
  },
});

module.exports = mongoose.model('Otp', otpSchema);
