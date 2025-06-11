// controllers/userController.js
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const OTP = require('../models/Otp');
const twilio = require('twilio');

// Twilio initialization 
const twilioClient = require('twilio')(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

// Register a new user
const register = async (req, res) => {
  const { name, password, role } = req.body;

  try {
    const existing = await User.findOne({ name });
    if (existing) return res.status(400).json({ message: 'User already exists' });

    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({ name, password: hash, role });
    res.status(201).json({ message: 'User created successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Something went wrong' });
  }
};

// Login existing user
const login = async (req, res) => {
  const { name, password } = req.body;

  try {
    const user = await User.findOne({ name });
    if (!user) return res.status(400).json({ message: 'User not found' });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET);
    res.json({ token, role: user.role });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Something went wrong' });
  }
};

// Send OTP to employee
const sendEmployeeOTP = async (req, res) => {
  const { phone } = req.body;
  
  try {
    // Check if employee exists
    const employee = await User.findOne({ phone, role: 'employee' });
    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60000); // 10 minutes expiry

    // Save OTP to database
    await OTP.create({ phone, otp, expiresAt });

    // Send SMS via Twilio
    await twilioClient.messages.create({
      body: `Your verification code is: ${otp}`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phone
    });

    res.json({ success: true });
  } catch (error) {
    console.error('OTP send error:', error);
    res.status(500).json({ error: 'Failed to send OTP' });
  }
};

// Verify employee OTP
const verifyEmployeeOTP = async (req, res) => {
  const { phone, otp } = req.body;

  try {
    // Find the most recent OTP for this phone
    const otpRecord = await OTP.findOne({ 
      phone, 
      expiresAt: { $gt: new Date() } 
    }).sort({ createdAt: -1 });

    if (!otpRecord || otpRecord.otp !== otp) {
      return res.status(401).json({ error: 'Invalid or expired OTP' });
    }

    // OTP is valid - find employee
    const employee = await User.findOne({ phone, role: 'employee' });

    // Generate JWT token
    const token = jwt.sign(
      { id: employee._id, role: 'employee' },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    // Delete used OTP
    await OTP.deleteMany({ phone });

    res.json({ token, employee });
  } catch (error) {
    console.error('OTP verify error:', error);
    res.status(500).json({ error: 'OTP verification failed' });
  }
};


// Add to your existing exports
const registerEmployee = async (req, res) => {
  const { name, password } = req.body;

  try {
    // Verify the requester is admin (from middleware)
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Only admins can register employees' });
    }

    const existing = await User.findOne({ name });
    if (existing) return res.status(400).json({ message: 'User already exists' });

    const employee = await User.create({
      name,
      password: await bcrypt.hash(password, 10),
      role: 'employee',
      registeredBy: req.user.id
    });

    res.status(201).json({
      message: 'Employee registered successfully',
      employee: {
        id: employee._id,
        name: employee.name,
        role: employee.role
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Employee registration failed' });
  }
};

const getEmployees = async (req, res) => {
  try {
    const employees = await User.find({ role: 'employee' })
      .select('-password')
      .populate('registeredBy', 'name');
    res.json(employees);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch employees' });
  }
};

// Update your exports
module.exports = { 
  register,
  login,
  registerEmployee, // Add this
  getEmployees,     // Add this
  sendEmployeeOTP,
  verifyEmployeeOTP
};