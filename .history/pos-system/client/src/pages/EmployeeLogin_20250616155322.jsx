import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './EmployeeLogin.css'; // Using the updated CSS file

const EmployeeLogin = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!username.trim() || !password.trim()) {
      setError('Please enter both username and password');
      return;
    }

    const authenticateUser = async (user, pass) => {
      // In a real app, you would make an API call here.
      // For demonstration, we'll use hardcoded values.
      return user === 'admin' && pass === 'admin123';
    };

    try {
      const isAuthenticated = await authenticateUser(username, password);
      if (isAuthenticated) {
        navigate('/dashboard');
      } else {
        setError('Invalid username or password');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    }
  };

  // Function to handle the employee login button click
  const handleEmployeeLoginRedirect = () => {
    navigate('/employee-login'); // Or whatever your employee login route is
  };

  return (
    <div className="login-page-container">
      <div className="login-form-container">
        <header className="login-header">
          <h2>Welcome!</h2>
          <h1>BloomTrack</h1>
        </header>

        <form onSubmit={handleLogin} className="login-form">
          {error && <p className="error-message">{error}</p>}

          <div className="input-group">
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Username"
              className="login-input"
              required
            />
          </div>

          <div className="input-group">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="login-input"
              required
            />
            <div className="form-actions">
              <a href="/forgot-password" onClick={(e) => e.preventDefault()} className="forgot-password-link">
                Forgot Password?
              </a>
            </div>
          </div>

          <button type="submit" className="login-button">
            Login
          </button>
        </form>

        <div className="separator">
            <span>or</span>
        </div>

      </div>
    </div>
  );
};

export default EmployeeLogin;
