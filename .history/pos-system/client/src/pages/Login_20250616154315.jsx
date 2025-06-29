import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css'; // We will create this CSS file next

const Login = () => {
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

    // This is a mock authentication function.
    // In a real app, you would make an API call here.
    const authenticateUser = async (user, pass) => {
      // For demonstration purposes
      return user === 'admin' && pass === 'admin123';
    };

    try {
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
          </div>

          <div className="form-actions">
            <a href="/forgot-password" onClick={(e) => e.preventDefault()} className="forgot-password-link">
              Forgot Password?
            </a>
          </div>

          <button type="submit" className="login-button">
            Login
          </button>
        </form>
      </div>
      <div className="login-image-container">
        {/* The background image will be applied here via CSS */}
      </div>
    </div>
  );
};

export default Login;
