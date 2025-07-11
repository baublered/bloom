const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); // We'll need this for a pre-save hook

// This single schema will represent all users in your system,
// combining the best fields from your old User and Employee models.
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  // This will serve as the login username.
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  // This is crucial for the OTP functionality.
  phone: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  profilePhoto: {
    type: String,
    default: null,
  },
  resetPasswordOtp: String,
  resetPasswordExpires: Date,
  passwordResetAt: {
    type: Date,
    default: null,
  },
  role: {
    type: String,
    required: true,
    enum: ['admin', 'employee'], // Ensures role is one of these values
    default: 'employee',
  },
}, {
  timestamps: true // Adds createdAt and updatedAt fields
});


// Optional but recommended: Hash password before saving a new user.
// This hook automatically runs before a `save()` command.
userSchema.pre('save', async function(next) {
    // Only hash the password if it has been modified (or is new)
    if (!this.isModified('password')) {
        return next();
    }
    try {
        const salt = await bcrypt.genSalt(12); // Increased salt rounds for better security
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});


module.exports = mongoose.model('User', userSchema);
