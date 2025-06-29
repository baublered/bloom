import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './ForgotPassword.css';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [contactNumber, setContactNumber] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Using the full backend URL for direct testing
      const response = await fetch('http://localhost:5000/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contactNumber }),
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
            throw new Error(`Error: Received status ${response.status} (Not Found). Please check that your backend server is running on port 5000 and the API route '/api/auth/send-otp' is correct.`);
        }
      }

      const data = await response.json();
      console.log('OTP sent successfully:', data.message);
      // On success, navigate to the verification page
      navigate('/verify-otp', { state: { contactNumber } });

    } catch (err) {
      // This will now display the more helpful error message
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="forgot-password-page">
      <h1 className="page-title">Forgot Password</h1>
      <div className="form-card">
        <h2 className="card-title">Forgot Password</h2>
        <form onSubmit={handleSendOtp}>
          {error && <p className="error-message">{error}</p>}
          <div className="input-group">
            <label htmlFor="contactNumber">Contact Number</label>
            <input
              type="tel"
              id="contactNumber"
              value={contactNumber}
              onChange={(e) => setContactNumber(e.target.value)}
              className="otp-input"
              placeholder="Enter your phone number"
              pattern="[0-9]*"
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
