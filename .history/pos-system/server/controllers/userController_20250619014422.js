const User = require('../models/User'); // Assuming you have a User model
const bcrypt = require('bcryptjs');

// --- NEW FUNCTION for User Registration ---
const registerUser = async (req, res) => {
    try {
        const { name, employeeId, phone, password, role } = req.body;

        // 1. Check if all required fields are provided
        if (!name || !employeeId || !phone || !password || !role) {
            return res.status(400).json({ message: 'Please provide all required fields.' });
        }

        // 2. Check if a user with this employeeId already exists
        const existingUser = await User.findOne({ employeeId });
        if (existingUser) {
            return res.status(400).json({ message: 'A user with this Employee ID already exists.' });
        }

        // 3. Hash the password for security
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 4. Create the new user object
        const newUser = new User({
            name,
            employeeId,
            phone,
            password: hashedPassword,
            role,
        });

        // 5. Save the user to the database
        await newUser.save();

        // 6. Send a success response
        res.status(201).json({ 
            success: true, 
            message: 'User registered successfully!',
            user: { id: newUser._id, name: newUser.name, role: newUser.role } // Don't send the password back
        });

    } catch (error) {
        console.error('Error in registerUser:', error);
        res.status(500).json({ message: 'Server error during user registration.' });
    }
};


// This is your existing login function (assuming it exists)
const login = async (req, res) => {
    // Your login logic goes here...
    res.status(200).json({ message: "Login endpoint hit" });
};


module.exports = {
    registerUser,
    login,
};
