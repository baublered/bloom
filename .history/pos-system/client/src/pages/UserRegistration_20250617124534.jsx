import { useState } from 'react';
import './UserRegistration.css'; // We'll create the styles for this

const UserRegistration = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    middleInitial: '',
    lastName: '',
    contactNumber: '', // This is the 'phone' field for OTP
    username: '',
    password: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: Connect to a backend endpoint to register the new user.
    // Example: POST /api/employees/register with the formData
    console.log('Submitting new user:', formData);
    alert('User registration form submitted! Check the console.');
  };

  return (
    <div className="user-registration-page">
      <header className="page-header">
        <h1>User Registration</h1>
        <div className="user-profile-button">
            <span className="user-icon">👤</span>
            <span>User Profile</span>
            <span className="dropdown-arrow">▼</span>
        </div>
      </header>

      <div className="registration-card">
        <div className="card-header">
          <h2>Create an account</h2>
          <p className="logo-text">BloomTrack</p>
        </div>

        <form onSubmit={handleSubmit} className="registration-form">
          <div className="form-row name-group">
            <div className="input-group">
              <input type="text" name="firstName" placeholder="First name" value={formData.firstName} onChange={handleChange} className="registration-input" required />
            </div>
            <div className="input-group initial">
              <input type="text" name="middleInitial" placeholder="Middle Initial" value={formData.middleInitial} onChange={handleChange} className="registration-input" maxLength="1" />
            </div>
            <div className="input-group">
              <input type="text" name="lastName" placeholder="Last Name" value={formData.lastName} onChange={handleChange} className="registration-input" required />
            </div>
          </div>

          <div className="form-row">
            <div className="input-group full-width">
              <input type="tel" name="contactNumber" placeholder="Contact Number" value={formData.contactNumber} onChange={handleChange} className="registration-input" required />
            </div>
          </div>
          
          <div className="form-row">
            <div className="input-group full-width">
              <input type="text" name="username" placeholder="Username" value={formData.username} onChange={handleChange} className="registration-input" required />
            </div>
          </div>

          <div className="form-row">
            <div className="input-group full-width">
              <input type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange} className="registration-input" required />
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" className="register-button">Register</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserRegistration;
