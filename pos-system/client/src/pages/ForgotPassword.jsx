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

    // Add a timeout to prevent the button from being stuck indefinitely
    const timeoutId = setTimeout(() => {
      setIsLoading(false);
      setError('Request timed out. Please check your connection and try again.');
    }, 30000); // 30 second timeout

    try {
      // --- UPDATED: Sending email to the backend ---
      const response = await axios.post('/api/auth/send-otp', { email });

      clearTimeout(timeoutId);

      if (response.data.success) {
        setSuccessMessage('OTP has been sent to your email. Redirecting...');
        // On success, navigate to the verification page, passing the email along
        setTimeout(() => {
            navigate('/verify-otp', { state: { email } });
        }, 2000);
      } else {
        setError(response.data.message || 'Failed to send OTP.');
      }
    } catch (err) {
      clearTimeout(timeoutId);
      console.error('Send OTP error:', err);
      
      if (err.code === 'ECONNABORTED') {
        setError('Request timed out. Please check your connection and try again.');
      } else if (err.response) {
        // Server responded with an error
        setError(err.response.data?.message || 'Failed to send OTP.');
      } else if (err.request) {
        // Network error
        setError('Network error. Please check your connection and try again.');
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
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
