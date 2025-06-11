const OTP = require('../models/Otp');
const Employee = require('../models/employee');

exports.sendOTP = async (req, res) => {
    try {
        const { employeeId } = req.body;
        
        // 1. Find employee
        const employee = await Employee.findOne({ employeeId });
        if (!employee) {
            return res.status(404).json({ error: 'Employee not found' });
        }

        // 2. Generate OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 10 * 60000); // 10 minutes

        // 3. Save OTP
        await OTP.create({
            employeeId,
            otp,
            expiresAt,
            phone: employee.phone
        });

        // 4. In development: log to console
        console.log(`OTP for ${employeeId}: ${otp}`);
        
        res.json({ success: true, otp }); // Remove otp in production!
        
    } catch (error) {
        console.error('Send OTP Error:', error);
        res.status(500).json({ error: 'Failed to send OTP' });
    }
};

exports.verifyOTP = async (req, res) => {
    try {
        const { employeeId, otp } = req.body;
        
        // 1. Find valid OTP
        const otpRecord = await OTP.findOne({
            employeeId,
            otp,
            expiresAt: { $gt: new Date() }
        });

        if (!otpRecord) {
            return res.status(401).json({ error: 'Invalid or expired OTP' });
        }

        // 2. Generate token (simplified)
        const token = "sample-token-" + Math.random().toString(36).substring(2);
        
        // 3. Clean up
        await OTP.deleteMany({ employeeId });
        
        res.json({ success: true, token });
        
    } catch (error) {
        console.error('Verify OTP Error:', error);
        res.status(500).json({ error: 'OTP verification failed' });
    }
};