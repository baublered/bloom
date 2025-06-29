import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './VerifyOTP.css';

const VerifyOTP = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const contactNumber = location.state?.contactNumber;

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
      // Temporarily using the full backend URL for testing
      const response = await fetch('http://localhost:5000/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contactNumber, otp }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to verify OTP.');
      }

      console.log('OTP Verified Successfully!');
      setIsVerified(true);
      setError('');

    } catch (err) {
      setError(err.message);
      setIsVerified(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleContinue = (e) => {
    e.preventDefault();
    if (isVerified) {
      navigate('/reset-password', { state: { contactNumber } });
    } else {
      setError('Please verify the OTP first.');
    }
  };

  return (
    <div className="verify-otp-page">
      <h1 className="page-title">Forgot Password</h1>
      <div className="form-card">
        <h2 className="card-title">Verify OTP</h2>
        <p className="instructions">An OTP has been sent to {contactNumber}.</p>
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
            <button type="button" onClick={handleVerifyOtp} className="verify-button" disabled={isLoading}>
              {isLoading ? 'Verifying...' : 'Verify OTP'}
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
