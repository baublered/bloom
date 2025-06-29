import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './VerifyOtp.css'; // We'll create this CSS file

const VerifyOTP = () => {
  const navigate = useNavigate();
  const location = useLocation();
  // Get the contact number passed from the previous page
  const contactNumber = location.state?.contactNumber;

  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [isVerified, setIsVerified] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // This function would call your backend to verify the OTP
  const handleVerifyOtp = async () => {
    setIsLoading(true);
    setError('');

    try {
      // In a real app, you would make this API call
      // const response = await fetch('/api/auth/verify-otp', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ contactNumber, otp }),
      // });
      // const data = await response.json();
      // if (!response.ok) throw new Error(data.message);

      // For demonstration, we'll simulate a successful verification
      if (otp === '123456') { // Mock OTP
        console.log('OTP Verified Successfully!');
        setIsVerified(true);
      } else {
        throw new Error('Invalid OTP. Please try again.');
      }

    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleContinue = (e) => {
    e.preventDefault();
    if (isVerified) {
      // If OTP is verified, navigate to the final reset password page
      navigate('/reset-password', { state: { contactNumber } });
    } else {
      setError('Please verify the OTP before continuing.');
    }
  };


  return (
    <div className="verify-otp-page">
      <h1 className="page-title">Forgot Password</h1>
      <div className="form-card">
        <h2 className="card-title">Forgot Password</h2>
        <form onSubmit={handleContinue}>
          {error && <p className="error-message">{error}</p>}

          <div className="input-group-inline">
            <input
              type="text"
              id="otp"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="otp-input"
              placeholder="Enter OTP"
              required
            />
            <button type="button" onClick={handleVerifyOtp} className="verify-button" disabled={isLoading}>
              {isLoading ? '...' : 'Verify OTP'}
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
