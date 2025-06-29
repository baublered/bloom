import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

const UnauthorizedAccess = () => {
  const navigate = useNavigate();

  return (
    <div className="dashboard-container">
      <main className="dashboard-main">
        <div className="unauthorized-page">
          <div className="unauthorized-content">
            <h1>🚫 Access Restricted</h1>
            <h2>Employee Access Level</h2>
            <p>You don't have permission to access this page.</p>
            <p>This feature is restricted to administrators only.</p>
            
            <div className="unauthorized-actions">
              <button 
                className="btn-primary" 
                onClick={() => navigate('/employee-dashboard')}
              >
                Return to Dashboard
              </button>
              <button 
                className="btn-secondary" 
                onClick={() => navigate(-1)}
              >
                Go Back
              </button>
            </div>
            
            <div className="contact-admin">
              <p><strong>Need access to this feature?</strong></p>
              <p>Please contact your manager or system administrator.</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default UnauthorizedAccess;
