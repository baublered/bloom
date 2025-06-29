import axios from 'axios';
import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './ResetPassword.css';

const ResetPassword = () => {
    const navigate = useNavigate();
    const location = useLocation();
    
    const { email, otp } = location.state || {};

    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (newPassword !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }
        if (newPassword.length < 6) {
            setError("Password must be at least 6 characters long.");
            return;
        }

        setIsLoading(true);
        setError('');
        setSuccessMessage('');

        try {
            const response = await axios.post('/api/auth/reset-password', {
                email,
                otp,
                newPassword
            });

            if (response.data.success) {
                setSuccessMessage("Password reset successfully! Redirecting...");
                
                // --- UPDATED: Redirect based on the role from the backend ---
                setTimeout(() => {
                    if (response.data.role === 'admin') {
                        navigate('/login'); // Redirect to admin login
                    } else {
                        navigate('/employee-login'); // Redirect to employee login
                    }
                }, 2000);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to reset password.');
        } finally {
            setIsLoading(false);
        }
    };

    if (!email || !otp) {
        return (
            <div>
                <p>Invalid session. Please start the password reset process again.</p>
                <button onClick={() => navigate('/forgot-password')}>Go Back</button>
            </div>
        )
    }

    return (
        <div className="reset-password-page">
            <div className="reset-card">
                <h2>Forgot Password</h2>
                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <input
                            type="password"
                            placeholder="New Password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
                        />
                    </div>
                    <div className="input-group">
                        <input
                            type="password"
                            placeholder="Retype New Password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                        />
                    </div>
                    
                    {error && <p className="error-message">{error}</p>}
                    {successMessage && <p className="success-message">{successMessage}</p>}
                    
                    <button type="submit" className="change-password-btn" disabled={isLoading}>
                        {isLoading ? 'Changing...' : 'Change Password'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ResetPassword;
