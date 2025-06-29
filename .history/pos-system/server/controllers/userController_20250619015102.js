const User = require('../models/User'); // Assuming you have a User model from a previous step
const bcrypt = require('bcryptjs');

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

        const newUser = new User({
            name,
            employeeId,
            phone,
            password: hashedPassword,
            role,
        });

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

// --- Function to Get All Employees ---
const getEmployees = async (req, res) => {
    try {
        // Find all users/employees and exclude their passwords from the result
        const users = await User.find({}, '-password'); 
        res.status(200).json(users);
    } catch (error) {
        console.error('Error in getEmployees:', error);
        res.status(500).json({ message: 'Server error while fetching employees.' });
    }
};

// --- Placeholder function for sending OTP ---
const sendEmployeeOTP = async (req, res) => {
    // Logic for sending OTP will go here
    res.status(200).json({ message: "sendEmployeeOTP endpoint successfully hit" });
};

// --- Placeholder function for verifying OTP ---
const verifyEmployeeOTP = async (req, res) => {
    // Logic for verifying OTP will go here
    res.status(200).json({ message: "verifyEmployeeOTP endpoint successfully hit" });
};


// Export all the functions so your router can use them
module.exports = {
    registerUser,
    login,
    getEmployees,
    sendEmployeeOTP,
    verifyEmployeeOTP,
};
