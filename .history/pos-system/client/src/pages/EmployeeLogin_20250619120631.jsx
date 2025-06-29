import axios from 'axios';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './EmployeeLogin.css';

const EmployeeLogin = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Send login credentials AND the required role to the backend
      const response = await axios.post('/api/auth/login', {
        employeeId: username,
        password,
        role: 'employee' // Specify that this is an employee login attempt
      });

      if (response.data.success) {
        localStorage.setItem('token', response.data.token);
        // Maybe redirect employees to a different dashboard?
        navigate('/dashboard'); 
      }
    } catch (err) {
      const message = err.response?.data?.message || 'An error occurred. Please try again.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page-container">
      <div className="login-form-container">
        <header className="login-header">
          <h2>Employee Login</h2>
          <h1>BloomTrack</h1>
        </header>

        <form onSubmit={handleLogin} className="login-form">
          {error && <p className="error-message">{error}</p>}
          <div className="input-group">
            <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Username" className="login-input" required />
          </div>
          <div className="input-group">
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" className="login-input" required />
            <div className="form-actions">
               <Link to="/forgot-password" className="forgot-password-link">Forgot Password?</Link>
            </div>
          </div>
          <button type="submit" className="login-button" disabled={isLoading}>
             {isLoading ? 'Logging In...' : 'Login'}
          </button>
        </form>

        <div className="separator"><span>or</span></div>
        <button onClick={() => navigate('/')} className="employee-login-button">
          Login as Admin
        </button>
      </div>
    </div>
  );
};

export default EmployeeLogin;
