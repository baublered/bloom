import axios from 'axios';
import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './VerifyOtp.css';

const VerifyOTP = () => {
  const navigate = useNavigate();
  const location = useLocation();
  // It correctly gets the email from the previous page
  const email = location.state?.email;

  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [isVerified, setIsVerified] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleVerifyOtp = async () => {
    if (!otp) {
      setError('Please enter the OTP.');
      return;
    }
    setIsLoading(true);
    setError('');

    try {
      // The API call correctly uses email and otp
      const response = await axios.post('/api/auth/verify-otp', { email, otp });

      if (response.data.success) {
        console.log('OTP Verified Successfully!');
        setIsVerified(true);
        setError(''); // Clear any old errors on success
      } else {
          // This handles cases where the API returns success: false
          throw new Error(response.data.message || 'Verification failed.');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to verify OTP.');
      setIsVerified(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleContinue = (e) => {
    e.preventDefault();
    if (isVerified) {
      // --- FIX: Pass both email AND the verified OTP to the reset page ---
      // The ResetPassword page needs both pieces of information for the final step.
      navigate('/reset-password', { state: { email, otp } });
    } else {
      setError('Please verify the OTP before continuing.');
    }
  };

  return (
    <div className="verify-otp-page">
      <h1 className="page-title">Forgot Password</h1>
      <div className="form-card">
        <h2 className="card-title">Verify OTP</h2>
        <p className="instructions">An OTP has been sent to {email}.</p>
        <form onSubmit={handleContinue}>
          {error && <p className="error-message">{error}</p>}
          
          <div className="input-group-inline">
            <input
              type="text"
              id="otp"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="otp-input"
              placeholder="Enter 6-digit OTP"
              required
              maxLength="6"
            />
            <button type="button" onClick={handleVerifyOtp} className="verify-button" disabled={isLoading || isVerified}>
              {isVerified ? '✓ Verified' : (isLoading ? 'Verifying...' : 'Verify OTP')}
            </button>
          </div>
          
          <button type="submit" className="continue-button" disabled={!isVerified}>
            Continue
          </button>
        </form>
      </div>
    </div>
  );
};

export default VerifyOTP;
