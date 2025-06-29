const Employee = require('../models/employee');
const Otp = require('../models/Otp');
// const twilio = require('twilio'); // Make sure you have twilio configured

// Initialize Twilio client (replace with your actual credentials)
// const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

exports.sendOtp = async (req, res) => {
  try {
    const { contactNumber } = req.body;
    
    // Find an employee with the provided contact number
    const employee = await Employee.findOne({ phone: contactNumber });
    if (!employee) {
      return res.status(404).json({ message: 'No user found with this contact number.' });
    }

    // Generate a 6-digit OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Save the OTP to the database, linked to the phone number
    await Otp.create({ phone: contactNumber, otp: otpCode });

    // --- YOUR TWILIO LOGIC GOES HERE ---
    // Use the twilioClient to send the SMS
    // await twilioClient.messages.create({
    //   body: `Your BloomTrack verification code is: ${otpCode}`,
    //   from: process.env.TWILIO_PHONE_NUMBER,
    //   to: contactNumber,
    // });
    
    // For now, we log it to the console for testing
    console.log(`[DEV MODE] OTP for ${contactNumber} is: ${otpCode}`);

    res.status(200).json({ success: true, message: 'OTP has been sent successfully.' });

  } catch (error) {
    console.error('Error sending OTP:', error);
    res.status(500).json({ message: 'Failed to send OTP. Please try again.' });
  }
};

exports.verifyOtp = async (req, res) => {
    try {
        const { contactNumber, otp } = req.body;

        // Find the most recent OTP for the given phone number
        const otpRecord = await Otp.findOne({
            phone: contactNumber,
            otp: otp,
        });

        if (!otpRecord) {
            // The 'expires' property in the schema handles the expiration
            return res.status(400).json({ message: 'Invalid or expired OTP.' });
        }

        // If OTP is correct, delete it so it can't be used again
        await Otp.deleteOne({ _id: otpRecord._id });
        
        // Respond with success
        res.status(200).json({ success: true, message: 'OTP verified successfully.' });

    } catch (error) {
        console.error('Error verifying OTP:', error);
        res.status(500).json({ message: 'Failed to verify OTP.' });
    }
};
