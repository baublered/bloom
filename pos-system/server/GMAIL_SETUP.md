# Gmail Setup for OTP Email Functionality

To enable OTP verification via Gmail, you need to configure Gmail with an App Password.

## Steps to Set Up Gmail:

### 1. Enable 2-Factor Authentication
- Go to your Google Account settings (https://myaccount.google.com)
- Navigate to "Security" 
- Enable "2-Step Verification" if not already enabled

### 2. Generate App Password
- In the same Security section, find "App passwords"
- Select "Mail" as the app type
- Copy the generated 16-character password (it will look like: `abcd efgh ijkl mnop`)

### 3. Update Environment Variables
Edit the `.env` file in the `pos-system/server` directory:

```env
EMAIL_USER=your_actual_gmail@gmail.com
EMAIL_PASS=your_16_character_app_password
```

**Important Notes:**
- Use your actual Gmail address for `EMAIL_USER`
- Use the 16-character App Password (not your regular Gmail password) for `EMAIL_PASS`
- Remove any spaces from the app password when pasting it into the .env file

### 4. Restart the Server
After updating the .env file, restart your server:
```bash
npm start
```

## Testing the OTP Functionality

1. Navigate to the "Forgot Password" page
2. Enter a registered email address
3. Click "Send OTP"
4. Check your email for the 6-digit OTP
5. Enter the OTP on the verification page
6. Set your new password

## Troubleshooting

### Common Issues:

1. **"Authentication failed" error:**
   - Make sure you're using an App Password, not your regular Gmail password
   - Verify that 2-Factor Authentication is enabled on your Gmail account

2. **"Send OTP" not working:**
   - Check that the EMAIL_USER and EMAIL_PASS are correctly set in .env
   - Ensure there are no extra spaces in the environment variables
   - Restart the server after changing .env

3. **Email not received:**
   - Check spam/junk folder
   - Verify the email address is registered in the system
   - Check server logs for any email sending errors

4. **OTP expired:**
   - OTPs expire after 10 minutes for security
   - Request a new OTP if the current one has expired

## Security Features

- OTPs are automatically deleted after 10 minutes
- Only one OTP per email address is stored at a time
- Each new OTP request invalidates the previous one
- Password reset requires both valid OTP and email verification
