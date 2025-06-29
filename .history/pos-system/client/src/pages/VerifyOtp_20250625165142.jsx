// ... (imports and other component logic remain the same)

const VerifyOTP = () => {
    // ... (all your existing state and functions remain here)

    const handleContinue = (e) => {
        e.preventDefault();
        if (isVerified) {
            // --- UPDATED: Pass both email and the entered OTP to the next page ---
            navigate('/reset-password', { state: { email: contactNumber, otp: otp } });
        } else {
            setError('Please verify the OTP before continuing.');
        }
    };

    // ... (the rest of your JSX remains the same)
};

export default VerifyOTP;
