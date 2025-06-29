import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Login = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    
    // Basic validation - you should replace with actual API call
    if (!username.trim() || !password.trim()) {
      setError('Please enter both username and password');
      return;
    }

    try {
      // Replace this with your actual authentication API call
      const isAuthenticated = await authenticateUser(username, password);
      
      if (isAuthenticated) {
        navigate('/dashboard');
      } else {
        setError('Invalid credentials');
      }
    } catch (err) {
      setError('Login failed. Please try again.');
    }
  };

  // Mock authentication function - replace with real API call
  const authenticateUser = async (username, password) => {
    // In a real app, you would make an API call here
    // Example:
    // const response = await fetch('/api/auth/login', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ username, password })
    // });
    // return response.ok;
    
    // For now, let's just check some hardcoded values
    return username === 'admin' && password === 'admin123';
  };

  const handleEmployeeLoginRedirect = () => {
    navigate('/employee-login');
  };

  return (
    <div style={{ maxWidth: '400px', margin: '4rem auto', padding: '2rem', border: '1px solid #ccc', borderRadius: '10px' }}>
      <h2 style={{ textAlign: 'center' }}>Admin Login</h2>
      {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}

      <form onSubmit={handleAdminLogin}>
        <div style={{ marginBottom: '1rem' }}>
          <label>Username or Mobile Number</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter username or mobile number"
            style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem' }}
          />
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password"
            style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem' }}
          />
        </div>

        <button type="submit" style={{ width: '100%', padding: '0.75rem', background: '#007bff', color: '#fff', border: 'none', borderRadius: '5px' }}>
          Login
        </button>
      </form>

      {/* Add this button for employee login */}
      <button
        onClick={handleEmployeeLoginRedirect}
        style={{
          marginTop: '1rem',
          width: '100%',
          padding: '0.75rem',
          background: '#6c757d',
          color: '#fff',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer'
        }}
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