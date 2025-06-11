const OTP = require('../models/Otp');
const Employee = require('../models/employee');

// Mock function - replace with real database queries
const findEmployee = async (employeeId) => {
    return { 
        _id: 'sample-employee-id',
        employeeId,
        phone: '+1234567890' 
    };
};

exports.sendOTP = async (req, res) => {
    try {
        const { employeeId } = req.body;
        
        // 1. Find employee (mock version)
        const employee = await findEmployee(employeeId);
        if (!employee) {
            return res.status(404).json({ error: 'Employee not found' });
        }

        // 2. Generate OTP
        const otp = Math.floor(100000 + Math.random() * 900000);
        console.log(`[DEV] OTP for ${employeeId}: ${otp}`); // For testing

        // 3. In a real app, you would save to database here
        // await OTP.create({ employeeId, otp, phone: employee.phone });

        res.json({ 
            success: true,
            message: 'OTP generated (check console)',
            otp // Remove this in production!
        });
        
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

exports.verifyOTP = async (req, res) => {
    try {
        const { employeeId, otp } = req.body;
        
        // 1. In a real app, you would verify against database
        // const valid = await OTP.findOne({ employeeId, otp });
        
        // 2. Mock verification - accepts any 6-digit code
        const isValid = /^\d{6}$/.test(otp);
        
        if (!isValid) {
            return res.status(400).json({ error: 'Invalid OTP' });
        }

        // 3. Generate mock token
        const token = `mock-token-${Date.now()}`;
        
        res.json({ 
            success: true,
            token,
            employee: { employeeId }
        });
        
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};