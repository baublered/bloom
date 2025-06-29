import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './VerifyOtp.css';

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
      const response = await fetch('http://localhost:5000/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contactNumber, otp }),
      });
      
      // If the response is not 'ok' (e.g., 404, 500), handle it specifically
      if (!response.ok) {
        const contentType = response.headers.get("content-type");
        // If the server sends a JSON error message, use it
        if (contentType && contentType.indexOf("application/json") !== -1) {
            const errorData = await response.json();
            throw new Error(errorData.message || `Server error: ${response.status}`);
        } else {
            // If the server sends HTML (like a 404 page), give a more specific error
            throw new Error(`Error: Received status ${response.status} (Not Found). Please check that your backend server is running on port 5000 and the API route '/api/auth/verify-otp' is correct.`);
        }
      }

      const data = await response.json();
      console.log('OTP Verified Successfully!', data);
      setIsVerified(true);
      setError('');

    } catch (err) {
      // This will now display the more helpful error message we created
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
