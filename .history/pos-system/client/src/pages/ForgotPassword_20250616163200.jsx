import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './ForgotPassword.css'; // We'll create this CSS file next

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [contactNumber, setContactNumber] = useState('');

  const handleSendOtp = (e) => {
    e.preventDefault();
    // In a real application, you would add logic here to call your backend API
    // to send an OTP to the provided contact number.
    console.log('Sending OTP to:', contactNumber);

    // After successfully sending the OTP, navigate to the OTP verification page.
    // We'll assume the route is '/verify-otp'.
    navigate('/verify-otp');
  };

  return (
    <div className="forgot-password-page">
      <h1 className="page-title">Forgot Password</h1>
      <div className="form-card">
        <h2 className="card-title">Forgot Password</h2>
        <form onSubmit={handleSendOtp}>
          <div className="input-group">
            <label htmlFor="contactNumber">Contact Number</label>
            <input
              type="text"
              id="contactNumber"
              value={contactNumber}
              onChange={(e) => setContactNumber(e.target.value)}
              className="otp-input"
              pattern="[0-9]*" // Allows only numbers
              required
            />
          </div>
          <button type="submit" className="send-otp-button">
            Send OTP
          </button>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;
