import React, { useState } from 'react';
import './Register.css';


function Register() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    middleInitial: '',
    username: '',
    contactNumber: '',
    password: '',
    confirmPassword: '',
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState(''); // <- you already have this

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      return setError("Passwords don't match");
    }

    try {
      const res = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          middleInitial: formData.middleInitial,
          username: formData.username,
          contactNumber: formData.contactNumber,
          password: formData.password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || 'Something went wrong');
        setSuccess('');
      } else {
        setSuccess(data.message); // ← success message here
        setError('');
        setFormData({
          firstName: '',
          lastName: '',
          middleInitial: '',
          username: '',
          contactNumber: '',
          password: '',
          confirmPassword: '',
        });
      }
    } catch (err) {
      setError('Server error');
      setSuccess('');
    }
  };

  return (
    <div className="register-wrapper">
      <div className="register-card">
        <h2>Create an account</h2>
        <p className="brand-name">Bloom Track</p>
        <form onSubmit={handleSubmit}>
          <div className="name-fields">
            <input
              name="firstName"
              type="text"
              placeholder="First name"
              value={formData.firstName}
              onChange={handleChange}
              required
            />
            <input
              name="middleInitial"
              type="text"
              placeholder="Middle Initial"
              value={formData.middleInitial}
              onChange={handleChange}
            />
            <input
              name="lastName"
              type="text"
              placeholder="Last Name"
              value={formData.lastName}
              onChange={handleChange}
              required
            />
          </div>
          <input
            name="contactNumber"
            type="text"
            placeholder="Contact Number"
            value={formData.contactNumber}
            onChange={handleChange}
            required
          />
          <input
            name="username"
            type="text"
            placeholder="Username"
            value={formData.username}
            onChange={handleChange}
            required
          />
          <input
            name="password"
            type="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
          />
          <input
            name="confirmPassword"
            type="password"
            placeholder="Confirm Password"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
          />

          {/* Show errors and success messages */}
          {error && <p style={{ color: 'red' }}>{error}</p>}
          {success && <p style={{ color: 'green' }}>{success}</p>} {/* ← added this */}

          <button type="submit">Register</button>
        </form>
      </div>
    </div>
  );
}

export default Register;
