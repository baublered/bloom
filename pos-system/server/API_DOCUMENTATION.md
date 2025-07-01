# Password Reset API Documentation

## Overview

The BloomTrack POS system provides a secure password reset workflow using email-based OTP (One-Time Password) verification. This API uses Nodemailer for email delivery and includes robust security features.

## API Endpoints

### 1. Request Password Reset - Send OTP

**Endpoint:** `POST /api/auth/send-otp`

**Description:** Initiates the password reset process by sending an OTP to the user's registered email address.

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "OTP has been sent to your email address. Please check your inbox and spam folder.",
  "expiresIn": "10 minutes"
}
```

**Error Responses:**
- `400` - Invalid email format or missing email
- `404` - No user found with this email address
- `429` - Too many requests (rate limiting - 1 minute between requests)
- `500` - Email service errors

**Security Features:**
- Email format validation
- User existence verification
- Rate limiting (1 OTP per minute per email)
- Auto-expiration after 10 minutes
- Previous OTP invalidation

---

### 2. Verify OTP

**Endpoint:** `POST /api/auth/verify-otp`

**Description:** Verifies the OTP sent to the user's email address.

**Request Body:**
```json
{
  "email": "user@example.com",
  "otp": "123456"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "OTP verified successfully. You can now reset your password."
}
```

**Error Responses:**
- `400` - Invalid email format, invalid OTP format, or incorrect OTP
- `429` - Too many failed attempts (max 5 attempts)
- `500` - Server error

**Security Features:**
- 6-digit numeric OTP validation
- Maximum 5 verification attempts
- OTP marked as verified but not deleted (needed for password reset)
- Attempt tracking with progressive error messages

---

### 3. Reset Password

**Endpoint:** `POST /api/auth/reset-password`

**Description:** Resets the user's password after successful OTP verification.

**Request Body:**
```json
{
  "email": "user@example.com",
  "otp": "123456",
  "newPassword": "NewSecurePassword123"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Password has been reset successfully. You can now log in with your new password."
}
```

**Error Responses:**
- `400` - Invalid inputs, weak password, or OTP not verified
- `404` - User not found
- `500` - Server error

**Password Requirements:**
- Minimum 6 characters, maximum 128 characters
- Must contain at least one uppercase letter
- Must contain at least one lowercase letter
- Must contain at least one number
- Must be different from current password

**Security Features:**
- Strong password validation
- OTP verification requirement
- Current password comparison
- Secure password hashing (bcrypt with 12 salt rounds)
- OTP cleanup after successful reset
- Password reset timestamp tracking

---

## Security Features Summary

### Rate Limiting
- **Send OTP**: 1 request per minute per email address
- **Verify OTP**: Maximum 5 attempts before OTP deletion

### Data Protection
- OTPs auto-expire after 10 minutes
- Secure password hashing with bcrypt
- Email format validation
- Input sanitization

### Audit Trail
- Server-side logging of all operations
- Password reset timestamp tracking
- Failed attempt tracking

### Email Security
- Professional HTML email templates
- Clear security warnings in emails
- Sender verification

---

## Frontend Integration

Your React frontend should implement this flow:

1. **Forgot Password Page**: Collect email, call `/send-otp`
2. **OTP Verification Page**: Collect OTP, call `/verify-otp`
3. **New Password Page**: Collect new password, call `/reset-password`

---

## Environment Setup

### Required Environment Variables

```env
# Email Configuration
EMAIL_USER=your_gmail@gmail.com
EMAIL_PASS=your_16_character_app_password

# Database
MONGO_URI=mongodb://localhost:27017/pos_db
```

### Gmail Setup

1. Enable 2-Factor Authentication on your Gmail account
2. Generate an App Password:
   - Go to Google Account Settings → Security
   - Select "App passwords"
   - Choose "Mail" and generate password
3. Use the 16-character app password (not your regular Gmail password)

---

## Testing

### Manual Testing Flow

1. **Send OTP**: Use a valid registered email
2. **Check Email**: Verify OTP is received (check spam folder)
3. **Verify OTP**: Use the 6-digit code from email
4. **Reset Password**: Provide a strong new password

### Test Script

Run the included test script to verify database connectivity:

```bash
node test_otp.js
```

---

## Error Handling

All endpoints return consistent error format:

```json
{
  "success": false,
  "message": "Descriptive error message"
}
```

Common error scenarios:
- Network connectivity issues
- Database connection problems
- Email service authentication failures
- Invalid input data
- Expired or invalid OTPs

---

## Production Considerations

1. **Remove Debug Logging**: Remove OTP console.log statements
2. **Use HTTPS**: Ensure all API calls use secure connections
3. **Monitor Email Quotas**: Track Gmail API usage
4. **Database Backup**: Regular backups of user data
5. **Rate Limiting**: Consider additional rate limiting middleware
6. **Email Templates**: Customize templates with your branding
