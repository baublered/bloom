import axios from 'axios';
import { useState } from 'react';
import UserProfile from './UserProfile';
import Sidebar from './Sidebar'; // Add sidebar import
import './UserRegistration.css';
import './Dashboard.css'; // Import dashboard styles for layout

const UserRegistration = () => {
  const initialFormState = {
    firstName: '',
    middleInitial: '',
    lastName: '',
    contactNumber: '',
    email: '',
    username: '',
    password: '',
    role: '',
  };

  const [formData, setFormData] = useState(initialFormState);
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState({ type: '', text: '' });
  const [validationErrors, setValidationErrors] = useState({});

  // Validation function
  const validateForm = () => {
    const errors = {};

    // First Name validation
    if (!formData.firstName.trim()) {
      errors.firstName = 'First name is required';
    } else if (formData.firstName.trim().length < 2) {
      errors.firstName = 'First name must be at least 2 characters';
    } else if (formData.firstName.trim().length > 50) {
      errors.firstName = 'First name must be less than 50 characters';
    } else if (!/^[a-zA-Z\s'-]+$/.test(formData.firstName.trim())) {
      errors.firstName = 'First name can only contain letters, spaces, hyphens, and apostrophes';
    }

    // Last Name validation
    if (!formData.lastName.trim()) {
      errors.lastName = 'Last name is required';
    } else if (formData.lastName.trim().length < 2) {
      errors.lastName = 'Last name must be at least 2 characters';
    } else if (formData.lastName.trim().length > 50) {
      errors.lastName = 'Last name must be less than 50 characters';
    } else if (!/^[a-zA-Z\s'-]+$/.test(formData.lastName.trim())) {
      errors.lastName = 'Last name can only contain letters, spaces, hyphens, and apostrophes';
    }

    // Middle Initial validation (optional but if provided must be valid)
    if (formData.middleInitial.trim()) {
      if (!/^[a-zA-Z]\.?$/.test(formData.middleInitial.trim())) {
        errors.middleInitial = 'Middle initial must be a single letter';
      }
    }

    // Email validation
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else {
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailRegex.test(formData.email.trim())) {
        errors.email = 'Please enter a valid email address';
      } else if (formData.email.trim().length > 254) {
        errors.email = 'Email address is too long';
      }
    }

    // Contact Number validation (exactly 11 digits)
    if (!formData.contactNumber.trim()) {
      errors.contactNumber = 'Contact number is required';
    } else {
      const digitsOnly = formData.contactNumber.replace(/[^0-9]/g, '');
      
      if (!/^[0-9]{11}$/.test(formData.contactNumber.trim())) {
        errors.contactNumber = 'Phone number must be exactly 11 digits (numbers only)';
      } else if (digitsOnly.length !== 11) {
        errors.contactNumber = 'Phone number must be exactly 11 digits';
      }
    }

    // Username validation
    if (!formData.username.trim()) {
      errors.username = 'Username is required';
    } else if (formData.username.trim().length < 3) {
      errors.username = 'Username must be at least 3 characters';
    } else if (formData.username.trim().length > 20) {
      errors.username = 'Username must be less than 20 characters';
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username.trim())) {
      errors.username = 'Username can only contain letters, numbers, and underscores';
    } else if (/^[0-9_]+$/.test(formData.username.trim())) {
      errors.username = 'Username must contain at least one letter';
    }

    // Password validation
    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
    } else if (formData.password.length > 128) {
      errors.password = 'Password must be less than 128 characters';
    } else {
      const hasLower = /[a-z]/.test(formData.password);
      const hasUpper = /[A-Z]/.test(formData.password);
      const hasNumber = /\d/.test(formData.password);
      const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(formData.password);
      
      if (!hasLower) {
        errors.password = 'Password must contain at least one lowercase letter';
      } else if (!hasUpper) {
        errors.password = 'Password must contain at least one uppercase letter';
      } else if (!hasNumber) {
        errors.password = 'Password must contain at least one number';
      } else if (!hasSpecial) {
        errors.password = 'Password must contain at least one special character (!@#$%^&*(),.?":{}|<>)';
      } else if (/\s/.test(formData.password)) {
        errors.password = 'Password cannot contain spaces';
      }
    }

    // Role validation
    if (!formData.role) {
      errors.role = 'Role selection is required';
    } else if (!['admin', 'employee'].includes(formData.role)) {
      errors.role = 'Please select a valid role';
    }

    return errors;
  };

  // Enhanced input validation for real-time feedback
  const validateField = (name, value) => {
    const errors = {};
    
    switch (name) {
      case 'firstName':
      case 'lastName':
        if (value && !/^[a-zA-Z\s'-]*$/.test(value)) {
          errors[name] = `${name === 'firstName' ? 'First' : 'Last'} name can only contain letters, spaces, hyphens, and apostrophes`;
        }
        break;
      case 'middleInitial':
        if (value && value.length > 0 && !/^[a-zA-Z]\.?$/.test(value)) {
          errors[name] = 'Middle initial must be a single letter';
        }
        break;
      case 'email':
        if (value && !/^[a-zA-Z0-9._%+-]*@?[a-zA-Z0-9.-]*\.?[a-zA-Z]*$/.test(value)) {
          errors[name] = 'Invalid email format';
        }
        break;
      case 'contactNumber':
        if (value && !/^[\+]?[0-9\s\-\(\)]*$/.test(value)) {
          errors[name] = 'Phone number can only contain numbers, spaces, hyphens, parentheses, and plus sign';
        }
        break;
      case 'username':
        if (value && !/^[a-zA-Z0-9_]*$/.test(value)) {
          errors[name] = 'Username can only contain letters, numbers, and underscores';
        }
        break;
      default:
        break;
    }
    
    return errors[name];
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Real-time input validation to prevent invalid characters
    const fieldError = validateField(name, value);
    
    // Update form data
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear validation error when user starts typing, or show real-time error
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: fieldError || ''
      }));
    } else if (fieldError) {
      // Show real-time validation error for format issues
      setValidationErrors(prev => ({
        ...prev,
        [name]: fieldError
      }));
    }

    // Clear status message when user starts correcting form
    if (statusMessage.text && statusMessage.type === 'error') {
      setStatusMessage({ type: '', text: '' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setStatusMessage({ type: '', text: '' });

    try {
      // Validate form
      const errors = validateForm();
      if (Object.keys(errors).length > 0) {
        setValidationErrors(errors);
        const errorCount = Object.keys(errors).length;
        setStatusMessage({ 
          type: 'error', 
          text: `❌ Please fix ${errorCount} validation error${errorCount > 1 ? 's' : ''} below.` 
        });
        setIsLoading(false);
        return;
      }

      // Clear validation errors
      setValidationErrors({});

      // Check for duplicate username/email (client-side pre-check)
      if (formData.username.toLowerCase().includes('admin') && formData.role !== 'admin') {
        setValidationErrors({ username: 'Username containing "admin" is reserved for admin accounts' });
        setStatusMessage({ type: 'error', text: '❌ Invalid username for selected role.' });
        setIsLoading(false);
        return;
      }

      const submissionData = {
        name: `${formData.firstName.trim()} ${formData.middleInitial.trim()} ${formData.lastName.trim()}`.replace(/\s+/g, ' ').trim(),
        username: formData.username.trim(),
        phone: formData.contactNumber.trim(),
        password: formData.password,
        role: formData.role,
        email: formData.email.trim(),
      };

      // Get admin token
      const token = localStorage.getItem('token');
      if (!token) {
        setStatusMessage({ 
          type: 'error', 
          text: '❌ Admin session expired. Please log in again.' 
        });
        setIsLoading(false);
        return;
      }

      const config = {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      };

      // Submit registration
      const response = await axios.post('/api/auth/register', submissionData, config);
      
      // Success handling
      setStatusMessage({ 
        type: 'success', 
        text: `✅ User "${submissionData.name}" registered successfully as ${formData.role}!` 
      });
      setFormData(initialFormState);
      setValidationErrors({});

      // Auto-clear success message after 5 seconds
      setTimeout(() => {
        setStatusMessage({ type: '', text: '' });
      }, 5000);

    } catch (error) {
      console.error("Error registering user:", error);
      
      // Enhanced error handling
      let errorMessage = "Failed to register user. Please try again.";
      
      if (error.response) {
        // Server responded with error status
        const { status, data } = error.response;
        
        switch (status) {
          case 400:
            if (data.message.includes('already exists')) {
              if (data.message.includes('username')) {
                setValidationErrors({ username: 'This username is already taken' });
                errorMessage = "Username already exists. Please choose a different username.";
              } else if (data.message.includes('email')) {
                setValidationErrors({ email: 'This email is already registered' });
                errorMessage = "Email already exists. Please use a different email address.";
              } else if (data.message.includes('phone')) {
                setValidationErrors({ contactNumber: 'This phone number is already registered' });
                errorMessage = "Phone number already exists. Please use a different phone number.";
              } else {
                errorMessage = data.message || "Invalid user data provided.";
              }
            } else {
              errorMessage = data.message || "Invalid user data provided.";
            }
            break;
          case 401:
            errorMessage = "Unauthorized. Please log in again.";
            break;
          case 403:
            errorMessage = "Access denied. Admin privileges required.";
            break;
          case 409:
            errorMessage = "User already exists with this information.";
            break;
          case 422:
            errorMessage = "Invalid data format. Please check all fields.";
            break;
          case 500:
            errorMessage = "Server error. Please try again later.";
            break;
          default:
            errorMessage = data.message || `Server error (${status}). Please try again.`;
        }
      } else if (error.request) {
        // Network error
        errorMessage = "Network error. Please check your connection and try again.";
      } else {
        // Other error
        errorMessage = error.message || "An unexpected error occurred.";
      }
      
      setStatusMessage({ type: 'error', text: `❌ ${errorMessage}` });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="dashboard-container">
      <Sidebar />
      
      <main className="dashboard-main">
        <header className="dashboard-header">
          <h1>User Registration</h1>
          <UserProfile />
        </header>

        <div className="user-registration-content">
          <div className="registration-card">
            <div className="card-header">
              <h2>Register a user</h2>
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
                  <input 
                    type="text" 
                    name="firstName" 
                    placeholder="First name" 
                    value={formData.firstName} 
                    onChange={handleChange} 
                    className={`registration-input ${validationErrors.firstName ? 'error' : ''}`}
                    required 
                  />
                  {validationErrors.firstName && (
                    <span className="error-text">{validationErrors.firstName}</span>
                  )}
                </div>
                <div className="input-group initial">
                  <input 
                    type="text" 
                    name="middleInitial" 
                    placeholder="M.I." 
                    value={formData.middleInitial} 
                    onChange={handleChange} 
                    className={`registration-input ${validationErrors.middleInitial ? 'error' : ''}`}
                    maxLength="2" 
                  />
                  {validationErrors.middleInitial && (
                    <span className="error-text">{validationErrors.middleInitial}</span>
                  )}
                </div>
                <div className="input-group">
                  <input 
                    type="text" 
                    name="lastName" 
                    placeholder="Last Name" 
                    value={formData.lastName} 
                    onChange={handleChange} 
                    className={`registration-input ${validationErrors.lastName ? 'error' : ''}`}
                    required 
                  />
                  {validationErrors.lastName && (
                    <span className="error-text">{validationErrors.lastName}</span>
                  )}
                </div>
              </div>
              
              <div className="form-row">
                <div className="input-group full-width">
                  <input 
                    type="email" 
                    name="email" 
                    placeholder="Email Address" 
                    value={formData.email} 
                    onChange={handleChange} 
                    className={`registration-input ${validationErrors.email ? 'error' : ''}`}
                    required 
                  />
                  {validationErrors.email && (
                    <span className="error-text">{validationErrors.email}</span>
                  )}
                </div>
              </div>

              <div className="form-row">
                <div className="input-group full-width">
                  <input 
                    type="tel" 
                    name="contactNumber" 
                    placeholder="Contact Number" 
                    value={formData.contactNumber} 
                    onChange={handleChange} 
                    className={`registration-input ${validationErrors.contactNumber ? 'error' : ''}`}
                    required 
                  />
                  {validationErrors.contactNumber && (
                    <span className="error-text">{validationErrors.contactNumber}</span>
                  )}
                </div>
              </div>
              
              <div className="form-row">
                <div className="input-group full-width">
                  <input 
                    type="text" 
                    name="username" 
                    placeholder="Username (for login)" 
                    value={formData.username} 
                    onChange={handleChange} 
                    className={`registration-input ${validationErrors.username ? 'error' : ''}`}
                    required 
                  />
                  {validationErrors.username && (
                    <span className="error-text">{validationErrors.username}</span>
                  )}
                </div>
              </div>

              <div className="form-row">
                <div className="input-group full-width">
                  <input 
                    type="password" 
                    name="password" 
                    placeholder="Password" 
                    value={formData.password} 
                    onChange={handleChange} 
                    className={`registration-input ${validationErrors.password ? 'error' : ''}`}
                    required 
                  />
                  {validationErrors.password && (
                    <span className="error-text">{validationErrors.password}</span>
                  )}
                </div>
              </div>

              <div className="form-row">
                <div className="input-group full-width">
                  <select 
                    name="role" 
                    value={formData.role} 
                    onChange={handleChange} 
                    className={`registration-input ${validationErrors.role ? 'error' : ''}`}
                    required
                  >
                    <option value="" disabled>Select a Role</option>
                    <option value="admin">admin</option>
                    <option value="employee">employee</option>
                  </select>
                  {validationErrors.role && (
                    <span className="error-text">{validationErrors.role}</span>
                  )}
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
      </main>
    </div>
  );
};

export default UserRegistration;
