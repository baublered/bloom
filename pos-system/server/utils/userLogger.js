const UserLog = require('../models/UserLog');

const logUserAction = async (userId, userName, action, details = '', targetUser = null, req = null) => {
  try {
    const logData = {
      userId,
      userName,
      action,
      details,
      targetUser
    };

    if (req) {
      logData.ipAddress = req.ip || req.connection.remoteAddress || req.headers['x-forwarded-for'];
      logData.userAgent = req.get('User-Agent');
    }

    await UserLog.create(logData);
  } catch (error) {
    console.error('Error logging user action:', error);
    // Don't throw error to avoid breaking the main operation
  }
};

module.exports = {
  logUserAction
};
