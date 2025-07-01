const mongoose = require('mongoose');

const userLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  userName: {
    type: String,
    required: true
  },
  action: {
    type: String,
    required: true,
    enum: [
      'LOGIN',
      'LOGOUT', 
      'CREATE_USER',
      'UPDATE_USER',
      'DELETE_USER',
      'CHANGE_PASSWORD',
      'RESET_PASSWORD',
      'UPDATE_PROFILE',
      'UPLOAD_PROFILE_PHOTO',
      'REMOVE_PROFILE_PHOTO'
    ]
  },
  details: {
    type: String,
    default: ''
  },
  targetUser: {
    type: String, // Name or ID of the user being acted upon
    default: null
  },
  ipAddress: {
    type: String,
    default: null
  },
  userAgent: {
    type: String,
    default: null
  }
}, {
  timestamps: true // This will create `createdAt` and `updatedAt` fields
});

// Index for better query performance
userLogSchema.index({ userId: 1, createdAt: -1 });
userLogSchema.index({ action: 1, createdAt: -1 });

module.exports = mongoose.model('UserLog', userLogSchema);
