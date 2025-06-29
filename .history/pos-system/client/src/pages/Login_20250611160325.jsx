import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Login = () => {
  const navigate = useNavigate();

  const handleAdminLogin = (e) => {
    e.preventDefault(); // Prevent page refresh

    // 🧠 For now, let's just simulate a successful login
    // Later you can add real authentication here
    navigate('/dashboard');
  };

  const handleEmployeeLoginRedirect = () => {
    navigate('/employee-login');
  };

  return (
    <div style={{ maxWidth: '400px', margin: '4rem auto', padding: '2rem', border: '1px solid #ccc', borderRadius: '10px' }}>
      <h2 style={{ textAlign: 'center' }}>Admin Login</h2>

      <form onSubmit={handleAdminLogin}>
        <div style={{ marginBottom: '1rem' }}>
          <label>Username or Mobile Number</label>
          <input
            type="text"
            placeholder="Enter username or mobile number"
            style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem' }}
          />
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label>Password</label>
          <input
            type="password"
            placeholder="Enter password"
            style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem' }}
          />
        </div>

        <button type="submit" style={{ width: '100%', padding: '0.75rem', background: '#007bff', color: '#fff', border: 'none', borderRadius: '5px' }}>
          Login
        </button>
      </form>

      <button
        onClick={handleEmployeeLoginRedirect}
        style={{ marginTop: '1rem', width: '100%', padding: '0.75rem', background: '#6c757d', color: '#fff', border: 'none', borderRadius: '5px' }}
      >
        Login as Employee
      </button>

      <div style={{ marginTop: '1rem', textAlign: 'center' }}>
        <p>Don't have an account?</p>
        <Link to="/register">
          <button style={{ padding: '0.5rem 1rem' }}>Register as Admin</button>
        </Link>
      </div>
    </div>
  );
};

export default Login;
