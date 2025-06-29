// controllers/authController.js
const OTP = require('../models/employee');
const Employee = require('../models/employee'); 

// Generate and send OTP
exports.sendOTP = async (req, res) => {
  try {
    const { employeeId } = req.body;
    
    // 1. Find employee
    const employee = await Employee.findOne({ employeeId });
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    // 2. Generate OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60000); // 10 minutes

    // 3. Save to database
    await OTP.create({
      employeeId,
      code: otpCode,
      expiresAt,
      phone: employee.phone
    });

    // 4. In development: log OTP to console
    console.log(`OTP for ${employeeId}: ${otpCode}`);
    
    res.json({ success: true, message: 'OTP sent' });
  } catch (error) {
    res.status(500).json({ message: 'Error sending OTP' });
  }
};

// Verify OTP
exports.verifyOTP = async (req, res) => {
  try {
    const { employeeId, otp } = req.body;
    
    // 1. Find valid OTP
    const otpRecord = await OTP.findOne({
      employeeId,
      code: otp,
      expiresAt: { $gt: new Date() }
    });

    if (!otpRecord) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    // 2. Find employee
    const employee = await Employee.findOne({ employeeId });
    
    // 3. Create token (simplified)
    const token = 'generated-jwt-token';
    
    // 4. Clean up
    await OTP.deleteMany({ employeeId });
    
    res.json({ token, employee });
  } catch (error) {
    res.status(500).json({ message: 'Error verifying OTP' });
  }
};