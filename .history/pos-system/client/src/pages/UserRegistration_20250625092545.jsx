import axios from 'axios';
import { useState } from 'react';
import './UserRegistration.css';

const UserRegistration = () => {
  const initialFormState = {
    firstName: '',
    middleInitial: '',
    lastName: '',
    contactNumber: '',
    username: '',
    password: '',
    role: '',
  };

  const [formData, setFormData] = useState(initialFormState);
  
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState({ type: '', text: '' });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setStatusMessage({ type: '', text: '' });

    const submissionData = {
        name: `${formData.firstName} ${formData.middleInitial} ${formData.lastName}`.replace(/\s+/g, ' ').trim(),
        employeeId: formData.username,
        phone: formData.contactNumber,
        password: formData.password,
        role: formData.role,
    };

    try {
        // --- FIX: Pointing to the correct, consolidated auth route ---
        const response = await axios.post('/api/auth/register', submissionData);

        setStatusMessage({ type: 'success', text: '✅ User registered successfully!' });
        setFormData(initialFormState);
    } catch (error) {
        console.error("Error registering user:", error);
        const message = error.response?.data?.message || "Failed to register user. Please try again.";
        setStatusMessage({ type: 'error', text: `❌ ${message}` });
    } finally {
        setIsLoading(false);
    }
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
          {statusMessage.text && (
            <div className={`status-message ${statusMessage.type}`}>
              {statusMessage.text}
            </div>
          )}

          <div className="form-row name-group">
            <div className="input-group">
              <input type="text" name="firstName" placeholder="First name" value={formData.firstName} onChange={handleChange} className="registration-input" required />
            </div>
            <div className="input-group initial">
              <input type="text" name="middleInitial" placeholder="M.I." value={formData.middleInitial} onChange={handleChange} className="registration-input" maxLength="2" />
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
              <input type="email" name="Email Address" placeholder="Email Address" value={formData.emailAdress} onChange={handleChange} className="registration-input" required />
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

           <div className="form-row">
            <div className="input-group full-width">
              <select name="role" value={formData.role} onChange={handleChange} className="registration-input" required>
                  <option value="" disabled>Select a Role</option>
                  <option value="admin">Admin</option>
                  <option value="employee">Employee</option>
              </select>
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" className="register-button" disabled={isLoading}>
                {isLoading ? 'Registering...' : 'Register'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserRegistration;
