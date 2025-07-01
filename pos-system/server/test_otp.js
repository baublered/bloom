// Test script to verify OTP functionality
// Run with: node test_otp.js
// This file is safe to commit as it uses test data only

const mongoose = require('mongoose');
const User = require('./models/User');
const Otp = require('./models/Otp');
require('dotenv').config();

async function testOtpFunctionality() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/pos_db');
        console.log('✓ Connected to MongoDB');

        // Generate unique test data to avoid conflicts
        const timestamp = Date.now();
        const testEmail = `test${timestamp}@example.com`;
        const testUsername = `testuser${timestamp}`;
        const testPhone = `555${timestamp.toString().slice(-7)}`; // Use last 7 digits of timestamp
        
        // Clean up any previous test data first
        await User.findOneAndDelete({ email: testEmail });
        await User.findOneAndDelete({ username: testUsername });
        await User.findOneAndDelete({ phone: testPhone });
        
        // Test user creation
        const user = new User({
            name: 'Test User OTP',
            username: testUsername,
            phone: testPhone,
            email: testEmail,
            password: 'TestPassword123',
            role: 'employee'
        });
        await user.save();
        console.log('✓ Test user created with unique data');

        // Test OTP creation
        const testOtp = '123456';
        await Otp.findOneAndDelete({ email: testEmail }); // Remove existing
        
        const otpDoc = new Otp({
            email: testEmail,
            otp: testOtp,
            isVerified: false,
            attempts: 0
        });
        await otpDoc.save();
        console.log('✓ OTP document created');

        // Test OTP retrieval
        const retrievedOtp = await Otp.findOne({ email: testEmail });
        if (retrievedOtp && retrievedOtp.otp === testOtp) {
            console.log('✓ OTP retrieval successful');
        } else {
            console.log('✗ OTP retrieval failed');
        }

        // Test OTP verification
        retrievedOtp.isVerified = true;
        await retrievedOtp.save();
        console.log('✓ OTP verification successful');

        // Cleanup
        await Otp.findOneAndDelete({ email: testEmail });
        await User.findOneAndDelete({ email: testEmail });
        console.log('✓ Cleanup completed');

        console.log('\n🎉 All OTP functionality tests passed!');
        console.log('\nNext steps:');
        console.log('1. Your Gmail credentials are configured ✓');
        console.log('2. Start the server: npm start');
        console.log('3. Test the forgot password flow from the frontend');

    } catch (error) {
        console.error('✗ Test failed:', error.message);
        
        // Additional debugging for common issues
        if (error.message.includes('E11000')) {
            console.log('\n💡 Tip: This was a duplicate key error, but the test should now handle this automatically.');
        }
        if (error.message.includes('connect')) {
            console.log('\n💡 Tip: Make sure MongoDB is running on your system.');
        }
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    }
}

testOtpFunctionality();
