import axios from 'axios';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './ForgotPassword.css'; // Make sure this CSS file exists

const ForgotPassword = () => {
  const navigate = useNavigate();
  // --- UPDATED: State now holds email instead of contactNumber ---
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      // --- UPDATED: Sending email to the backend ---
      const response = await axios.post('/api/auth/send-otp', { email });

      if (response.data.success) {
        setSuccessMessage('OTP has been sent to your email. Redirecting...');
        // On success, navigate to the verification page, passing the email along
        setTimeout(() => {
            navigate('/verify-otp', { state: { email } });
        }, 2000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="forgot-password-page">
      <button className="back-to-login-btn" type="button" onClick={() => navigate('/')}>
        &larr; Back to Login
      </button>
      <h1 className="page-title">Forgot Password</h1>
      <div className="form-card">
        <h2 className="card-title">Reset Password</h2>
        <form onSubmit={handleSendOtp}>
          {error && <p className="error-message">{error}</p>}
          {successMessage && <p className="success-message">{successMessage}</p>}
          <div className="input-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="otp-input"
              placeholder="Enter your registered email"
              required
            />
          </div>
          <button type="submit" className="send-otp-button" disabled={isLoading}>
            {isLoading ? 'Sending...' : 'Send OTP'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;
