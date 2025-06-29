import React, { useState } from 'react';
import './UserRegistration.css'; // Optional: create CSS for styling

function UserRegistration() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Submitting new user:", formData);
    // TODO: Connect to backend and send formData
  };

  return (
    <div className="user-registration-container">
      <h2>User Registration</h2>
      <form onSubmit={handleSubmit} className="user-form">
        <label>Username:
          <input type="text" name="username" value={formData.username} onChange={handleChange} required />
        </label>

        <label>Email:
          <input type="email" name="email" value={formData.email} onChange={handleChange} required />
        </label>

        <label>Password:
          <input type="password" name="password" value={formData.password} onChange={handleChange} required />
        </label>

        <label>Role:
          <select name="role" value={formData.role} onChange={handleChange} required>
            <option value="">Select Role</option>
            <option value="admin">Admin</option>
            <option value="cashier">Cashier</option>
          </select>
        </label>

        <button type="submit">Register User</button>
      </form>
    </div>
  );
}

export default UserRegistration;
