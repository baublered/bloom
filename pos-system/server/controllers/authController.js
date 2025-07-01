const User = require('../models/User');
const Otp = require('../models/Otp');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const { logUserAction } = require('../utils/userLogger');

// --- Read RSA Keys ---
// Load RSA keys from environment variables and properly format them
let privateKey = process.env.RSA_PRIVATE_KEY;
let publicKey = process.env.RSA_PUBLIC_KEY;

if (!privateKey || !publicKey) {
    console.error('Error: RSA_PRIVATE_KEY and RSA_PUBLIC_KEY must be set in environment variables');
    process.exit(1);
}

// Clean up the keys - remove extra quotes and handle escaped newlines
privateKey = privateKey.replace(/^["']|["']$/g, '').replace(/\\n/g, '\n');
publicKey = publicKey.replace(/^["']|["']$/g, '').replace(/\\n/g, '\n');

// Debug: Check if keys are properly formatted
console.log('[DEBUG] Private key starts with:', privateKey.substring(0, 50));
console.log('[DEBUG] Private key ends with:', privateKey.substring(privateKey.length - 50));
console.log('[DEBUG] Private key length:', privateKey.length);
console.log('[DEBUG] Has proper BEGIN/END markers:', 
    privateKey.includes('-----BEGIN PRIVATE KEY-----') && 
    privateKey.includes('-----END PRIVATE KEY-----'));
console.log('Private key length:', privateKey.length);

console.log('Successfully loaded RSA keys from environment variables.');

// --- Nodemailer Transporter Setup ---
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// --- User Login Function ---
const login = async (req, res) => {
    try {
        const { username, password, role } = req.body;
        
        // Add debugging
        console.log('Login attempt:');
        console.log('- username:', username);
        console.log('- role:', role);
        
        // First check if user exists with just username
        const userCheck = await User.findOne({ username });
        console.log('User found with username only:', userCheck ? 'YES' : 'NO');
        if (userCheck) {
            console.log('User role in DB:', userCheck.role);
            console.log('Requested role:', role);
            console.log('Role match:', userCheck.role === role);
        }
        
        // Original query
        const user = await User.findOne({ username, role });
        console.log('User found with both username and role:', user ? 'YES' : 'NO');
        
        if (!user) {
            return res.status(401).json({ success: false, message: 'Invalid credentials or role.' });
        }
        
        const isMatch = await bcrypt.compare(password, user.password);
        console.log('Password match:', isMatch);
        
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid credentials or role.' });
        }
        
        const payload = { user: { id: user.id, name: user.name, role: user.role } };
        
        console.log('[DEBUG] Creating token with RS256 algorithm.');
        
        jwt.sign(
            payload,
            privateKey,
            { algorithm: 'RS256', expiresIn: '24h' }, // Use private key and RS256
            async (err, token) => {
                if (err) {
                    console.error('[JWT_SIGN_ERROR]', err);
                    return res.status(500).json({ success: false, message: 'Error signing token.' });
                }
                console.log('[DEBUG] Token created successfully');
                
                // Log successful login
                await logUserAction(
                    user.id, 
                    user.name, 
                    'LOGIN', 
                    `User logged in with role: ${user.role}`,
                    null,
                    req
                );
                
                res.status(200).json({ success: true, token });
            }
        );
    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({ success: false, message: 'Server error during login.' });
    }
};

// --- User Registration Function ---
const registerUser = async (req, res) => {
    console.log('[REGISTER_USER] Received request');
    try {
        console.log('[REGISTER_USER] Request body:', req.body);
        const { name, username, phone, password, role, email } = req.body;

        if (!name || !username || !phone || !password || !role || !email) {
            console.log('[REGISTER_USER] Validation failed: Missing required fields.');
            return res.status(400).json({ message: 'Please provide all required fields.' });
        }
        
        console.log('[REGISTER_USER] Checking for existing user...');
        // Check for existing username
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            console.log('[REGISTER_USER] Conflict: Username already exists.');
            return res.status(409).json({ message: 'A user with this username already exists.' });
        }
        
        // Check for existing email
        const existingEmail = await User.findOne({ email });
        if (existingEmail) {
            console.log('[REGISTER_USER] Conflict: Email already exists.');
            return res.status(409).json({ message: 'A user with this email already exists.' });
        }
        
        // Check for existing phone
        const existingPhone = await User.findOne({ phone });
        if (existingPhone) {
            console.log('[REGISTER_USER] Conflict: Phone number already exists.');
            return res.status(409).json({ message: 'A user with this phone number already exists.' });
        }
        
        console.log('[REGISTER_USER] Creating new user instance...');
        // Create new user
        const newUser = new User({ 
            name, 
            username,
            phone, 
            password, 
            role, 
            email 
        });

        console.log('[REGISTER_USER] Saving new user to database...');
        await newUser.save();
        console.log('[REGISTER_USER] User saved successfully!');

        // Log user creation
        if (req.user) {
            await logUserAction(
                req.user.id,
                req.user.name,
                'CREATE_USER',
                `Created new user: ${newUser.name} (${newUser.username}) with role: ${newUser.role}`,
                newUser.name,
                req
            );
        }

        res.status(201).json({ 
            success: true, 
            message: 'User registered successfully!',
            user: { id: newUser._id, name: newUser.name, role: newUser.role }
        });
    } catch (error) {
        console.error('[REGISTER_USER] CATCH BLOCK: An error occurred.');
        console.error('[REGISTER_USER] Error Name:', error.name);
        console.error('[REGISTER_USER] Error Code:', error.code);
        console.error('[REGISTER_USER] Error Message:', error.message);
        console.error('[REGISTER_USER] Full Error Object:', error);

        // Detailed error handling for duplicate key errors
        if (error.code === 11000) {
            const field = Object.keys(error.keyValue)[0];
            console.log(`[REGISTER_USER] Duplicate key error for field: ${field}`);
            return res.status(409).json({ message: `An account with this ${field} already exists.` });
        }
        
        // Handle Mongoose validation errors
        if (error.name === 'ValidationError') {
            console.log('[REGISTER_USER] Mongoose validation error.');
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({ message: messages.join(' ') });
        }

        console.error('Error in registerUser (unhandled):', error);
        res.status(500).json({ message: 'Server error during user registration.' });
    }
};

// --- Send OTP Function ---
const sendOtp = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ success: false, message: 'Email is required.' });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ success: false, message: 'Invalid email format.' });
        }

        // Check if user exists with this email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ success: false, message: 'No user found with this email address.' });
        }

        // Check for existing OTP requests (rate limiting)
        const existingOtp = await Otp.findOne({ email });
        if (existingOtp) {
            const timeSinceCreation = Date.now() - existingOtp.createdAt.getTime();
            const minWaitTime = 60000; // 1 minute between requests
            
            if (timeSinceCreation < minWaitTime) {
                const remainingTime = Math.ceil((minWaitTime - timeSinceCreation) / 1000);
                return res.status(429).json({ 
                    success: false, 
                    message: `Please wait ${remainingTime} seconds before requesting another OTP.` 
                });
            }
        }

        // Generate a secure 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // Save OTP to database (will auto-expire after 10 minutes)
        await Otp.findOneAndDelete({ email }); // Remove any existing OTP for this email
        const otpDoc = new Otp({ 
            email, 
            otp, 
            isVerified: false, 
            attempts: 0 
        });
        await otpDoc.save();

        // Prepare email content
        const mailOptions = {
            from: `"BloomTrack" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'Password Reset OTP - BloomTrack',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa;">
                    <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                        <div style="text-align: center; margin-bottom: 30px;">
                            <h1 style="color: #333; margin: 0; font-size: 28px;">🌸 BloomTrack</h1>
                        </div>
                        
                        <h2 style="color: #333; margin-bottom: 20px; text-align: center;">Password Reset Request</h2>
                        
                        <p style="color: #666; font-size: 16px; line-height: 1.6; margin-bottom: 25px;">
                            Hello,<br><br>
                            You have requested to reset your password for your BloomTrack account. 
                            Please use the following One-Time Password (OTP) to continue:
                        </p>
                        
                        <div style="text-align: center; margin: 30px 0;">
                            <div style="background: linear-gradient(135deg, #007bff, #0056b3); color: white; padding: 20px 30px; border-radius: 8px; display: inline-block; font-size: 32px; font-weight: bold; letter-spacing: 4px; box-shadow: 0 4px 15px rgba(0,123,255,0.3);">
                                ${otp}
                            </div>
                        </div>
                        
                        <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; border-radius: 6px; padding: 15px; margin: 25px 0;">
                            <p style="color: #856404; margin: 0; font-size: 14px;">
                                <strong>⚠️ Security Notice:</strong><br>
                                • This OTP will expire in <strong>10 minutes</strong><br>
                                • Do not share this code with anyone<br>
                                • If you didn't request this, please ignore this email
                            </p>
                        </div>
                        
                        <p style="color: #666; font-size: 14px; text-align: center; margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px;">
                            <strong>BloomTrack System</strong><br>
                            This is an automated message, please do not reply.
                        </p>
                    </div>
                </div>
            `
        };

        // Send email
        await transporter.sendMail(mailOptions);

        console.log(`OTP sent to ${email}: ${otp}`); // For debugging (remove in production)

        res.status(200).json({ 
            success: true, 
            message: 'OTP has been sent to your email address. Please check your inbox and spam folder.',
            expiresIn: '10 minutes'
        });

    } catch (error) {
        console.error('Send OTP Error:', error);
        
        // Handle specific email errors
        if (error.code === 'EAUTH') {
            res.status(500).json({ 
                success: false, 
                message: 'Email service authentication failed. Please contact administrator.' 
            });
        } else if (error.code === 'ENOTFOUND') {
            res.status(500).json({ 
                success: false, 
                message: 'Email service is currently unavailable. Please try again later.' 
            });
        } else {
            res.status(500).json({ 
                success: false, 
                message: 'Failed to send OTP. Please try again later.' 
            });
        }
    }
};

// --- Verify OTP Function ---
const verifyOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({ 
                success: false, 
                message: 'Email and OTP are required.' 
            });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ success: false, message: 'Invalid email format.' });
        }

        // Validate OTP format (6 digits)
        if (!/^\d{6}$/.test(otp)) {
            return res.status(400).json({ 
                success: false, 
                message: 'OTP must be a 6-digit number.' 
            });
        }

        // Find OTP in database
        const otpDoc = await Otp.findOne({ email });

        if (!otpDoc) {
            return res.status(400).json({ 
                success: false, 
                message: 'No OTP found for this email or OTP has expired.' 
            });
        }

        // Check if OTP has already been verified
        if (otpDoc.isVerified) {
            return res.status(400).json({ 
                success: false, 
                message: 'OTP has already been used. Please request a new one.' 
            });
        }

        // Check if too many attempts have been made
        if (otpDoc.attempts >= 5) {
            await Otp.findOneAndDelete({ email }); // Delete OTP after max attempts
            return res.status(429).json({ 
                success: false, 
                message: 'Too many invalid attempts. Please request a new OTP.' 
            });
        }

        // Check if OTP matches
        if (otpDoc.otp !== otp) {
            // Increment attempts
            otpDoc.attempts += 1;
            await otpDoc.save();
            
            const remainingAttempts = 5 - otpDoc.attempts;
            return res.status(400).json({ 
                success: false, 
                message: `Invalid OTP. ${remainingAttempts} attempts remaining.` 
            });
        }

        // OTP is valid - mark as verified but don't delete yet
        otpDoc.isVerified = true;
        await otpDoc.save();

        res.status(200).json({ 
            success: true, 
            message: 'OTP verified successfully. You can now reset your password.' 
        });

    } catch (error) {
        console.error('Verify OTP Error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to verify OTP. Please try again.' 
        });
    }
};

// --- Reset Password Function ---
const resetPassword = async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body;

        if (!email || !otp || !newPassword) {
            return res.status(400).json({ 
                success: false, 
                message: 'Email, OTP, and new password are required.' 
            });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ success: false, message: 'Invalid email format.' });
        }

        // Validate password strength
        if (newPassword.length < 6) {
            return res.status(400).json({ 
                success: false, 
                message: 'Password must be at least 6 characters long.' 
            });
        }

        if (newPassword.length > 128) {
            return res.status(400).json({ 
                success: false, 
                message: 'Password must be less than 128 characters long.' 
            });
        }

        // Check for basic password requirements
        const hasUpperCase = /[A-Z]/.test(newPassword);
        const hasLowerCase = /[a-z]/.test(newPassword);
        const hasNumbers = /\d/.test(newPassword);
        
        if (!hasUpperCase || !hasLowerCase || !hasNumbers) {
            return res.status(400).json({ 
                success: false, 
                message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number.' 
            });
        }

        // Verify OTP is valid and has been verified
        const otpDoc = await Otp.findOne({ email, otp });
        if (!otpDoc) {
            return res.status(400).json({ 
                success: false, 
                message: 'Invalid or expired OTP. Please request a new one.' 
            });
        }

        if (!otpDoc.isVerified) {
            return res.status(400).json({ 
                success: false, 
                message: 'OTP has not been verified. Please verify your OTP first.' 
            });
        }

        // Find user
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ 
                success: false, 
                message: 'User not found.' 
            });
        }

        // Check if new password is different from current password
        const isSamePassword = await bcrypt.compare(newPassword, user.password);
        if (isSamePassword) {
            return res.status(400).json({ 
                success: false, 
                message: 'New password must be different from your current password.' 
            });
        }

        // Set new password - the User model's pre('save') hook will handle hashing
        user.password = newPassword;
        user.passwordResetAt = new Date(); // Track when password was reset
        await user.save();

        // Delete the OTP after successful password reset
        await Otp.findOneAndDelete({ email, otp });

        console.log(`Password reset successful for user: ${email}`);

        res.status(200).json({ 
            success: true, 
            message: 'Password has been reset successfully. You can now log in with your new password.' 
        });

    } catch (error) {
        console.error('Reset Password Error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to reset password. Please try again.' 
        });
    }
};

// --- NEW: Get Logged-In User's Profile ---
const getMe = async (req, res) => {
    try {
        console.log('[DEBUG] getMe called with user:', req.user);
        
        // req.user.id comes from the decoded token in your authMiddleware
        const user = await User.findById(req.user.id).select('-password');
        console.log('[DEBUG] User found in DB:', user ? 'YES' : 'NO');
        
        if (!user) {
            console.log('[DEBUG] User not found in database');
            return res.status(404).json({ message: 'User not found' });
        }
        
        // Include profile photo URL if it exists
        const userData = user.toObject();
        if (userData.profilePhoto) {
            userData.profilePhotoUrl = `/${userData.profilePhoto}`;
        }
        
        console.log('[DEBUG] Returning user data:', userData);
        res.json(userData);
    } catch (error) {
        console.error('Error fetching user profile:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// --- NEW: Update Logged-In User's Profile ---
const updateMe = async (req, res) => {
    try {
        const { name, email, phone } = req.body;
        
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.name = name || user.name;
        user.email = email || user.email;
        user.phone = phone || user.phone;

        const updatedUser = await user.save();
        
        res.json({
            success: true,
            message: "Profile updated successfully!",
            user: {
                id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                phone: updatedUser.phone,
                role: updatedUser.role
            }
        });
    } catch (error) {
        console.error('Error updating user profile:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// --- NEW: Upload Profile Photo ---
const uploadProfilePhoto = async (req, res) => {
    try {
        console.log('[DEBUG] uploadProfilePhoto called with user:', req.user);
        console.log('[DEBUG] File uploaded:', req.file);

        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No file uploaded' });
        }

        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Delete old profile photo if it exists
        if (user.profilePhoto) {
            const oldPhotoPath = path.join(__dirname, '..', user.profilePhoto);
            if (fs.existsSync(oldPhotoPath)) {
                fs.unlinkSync(oldPhotoPath);
            }
        }

        // Save new profile photo path to user
        const photoPath = `uploads/profiles/${req.file.filename}`;
        user.profilePhoto = photoPath;
        await user.save();

        console.log('[DEBUG] Profile photo saved:', photoPath);
        
        res.json({
            success: true,
            message: 'Profile photo uploaded successfully',
            photoUrl: `/${photoPath}` // Return URL path for frontend
        });
    } catch (error) {
        console.error('Error uploading profile photo:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// --- NEW: Remove Profile Photo ---
const removeProfilePhoto = async (req, res) => {
    try {
        console.log('[DEBUG] removeProfilePhoto called with user:', req.user);

        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Delete profile photo file if it exists
        if (user.profilePhoto) {
            const photoPath = path.join(__dirname, '..', user.profilePhoto);
            if (fs.existsSync(photoPath)) {
                fs.unlinkSync(photoPath);
            }
        }

        // Remove profile photo from user record
        user.profilePhoto = null;
        await user.save();

        console.log('[DEBUG] Profile photo removed');
        
        res.json({
            success: true,
            message: 'Profile photo removed successfully'
        });
    } catch (error) {
        console.error('Error removing profile photo:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// --- UPDATED: Export all functions, including the new ones ---
module.exports = {
    login,
    registerUser,
    sendOtp,
    verifyOtp,
    resetPassword,
    getMe,
    updateMe,
    uploadProfilePhoto,
    removeProfilePhoto
};
