const User = require('../models/User'); // Or your 'Employee' model
const Otp = require('../models/Otp');
const bcrypt = require('bcryptjs');
// const twilio = require('twilio'); // Make sure you have twilio configured

// --- User Registration Function ---
const registerUser = async (req, res) => {
    try {
        const { name, employeeId, phone, password, role } = req.body;

        if (!name || !employeeId || !phone || !password || !role) {
            return res.status(400).json({ message: 'Please provide all required fields.' });
        }
        const existingUser = await User.findOne({ employeeId });
        if (existingUser) {
            return res.status(400).json({ message: 'A user with this Employee ID already exists.' });
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const newUser = new User({ name, employeeId, phone, password: hashedPassword, role });
        await newUser.save();

        res.status(201).json({ 
            success: true, 
            message: 'User registered successfully!',
            user: { id: newUser._id, name: newUser.name, role: newUser.role }
        });
    } catch (error) {
        console.error('Error in registerUser:', error);
        res.status(500).json({ message: 'Server error during user registration.' });
    }
};

// --- User Login Function ---
const login = async (req, res) => {
    // Your login logic can be implemented here later
    res.status(200).json({ message: "Login endpoint successfully hit" });
};

// --- OTP Sending Function ---
const sendOtp = async (req, res) => {
  try {
    const { contactNumber } = req.body;
    
    const user = await User.findOne({ phone: contactNumber });
    if (!user) {
      return res.status(404).json({ message: 'No user found with this contact number.' });
    }

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    await Otp.create({ phone: contactNumber, otp: otpCode });
    
    // Add your Twilio SMS logic here
    console.log(`[DEV MODE] OTP for ${contactNumber} is: ${otpCode}`);

    res.status(200).json({ success: true, message: 'OTP has been sent successfully.' });
  } catch (error) {
    console.error('Error sending OTP:', error);
    res.status(500).json({ message: 'Failed to send OTP. Please try again.' });
  }
};

// --- OTP Verification Function ---
const verifyOtp = async (req, res) => {
    try {
        const { contactNumber, otp } = req.body;
        const otpRecord = await Otp.findOne({ phone: contactNumber, otp: otp });

        if (!otpRecord) {
            return res.status(400).json({ message: 'Invalid or expired OTP.' });
        }
        await Otp.deleteOne({ _id: otpRecord._id });
        
        res.status(200).json({ success: true, message: 'OTP verified successfully.' });
    } catch (error) {
        console.error('Error verifying OTP:', error);
        res.status(500).json({ message: 'Failed to verify OTP.' });
    }
};

module.exports = {
    registerUser,
    login,
    sendOtp,
    verifyOtp,
};
