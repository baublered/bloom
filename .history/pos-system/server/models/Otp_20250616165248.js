const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
  phone: { // We'll use the phone number to look up the OTP
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
    expires: 600, // 10 minutes in seconds
  },
});

module.exports = mongoose.model('Otp', otpSchema);
