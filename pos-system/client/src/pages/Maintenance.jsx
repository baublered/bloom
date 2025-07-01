import { useNavigate } from 'react-router-dom';
import './Maintenance.css';
import './Dashboard.css'; // Import dashboard styles for layout
import UserProfile from './UserProfile';
import Sidebar from './Sidebar'; // Add sidebar import
import EmployeeSidebar from './EmployeeSidebar';
import { useRoleBasedNavigation } from '../utils/navigation';
import { useAppContext } from '../context/AppContext';

const Maintenance = () => {
  const navigate = useNavigate();
  const { getNavigationPath, isEmployeeDashboard } = useRoleBasedNavigation();
  const { state } = useAppContext();
  
  // Check if current user is admin
  const isAdmin = state.user?.role === 'admin';

  return (
    <div className="dashboard-container">
      {!isEmployeeDashboard && <Sidebar />}
      
      <main className="dashboard-main">
        <header className="dashboard-header">
          <h1>Maintenance</h1>
          <UserProfile />
        </header>

        <div className="maintenance-content">
          <div className="maintenance-panel">
            <h3>Maintenance Options</h3>
            <div className="maintenance-buttons-grid">
              <button className="maintenance-btn" onClick={() => navigate(getNavigationPath('/restock'))}>
                <span className="icon">🞤</span>
                <span>Restock</span>
                <span className="description">Add new stock to existing products.</span>
              </button>
              <button className="maintenance-btn" onClick={() => navigate(getNavigationPath('/edit-product'))}>
                <span className="icon">✎</span>
                <span>Edit a product</span>
                <span className="description">Modify details of an existing product.</span>
              </button>
              <button className="maintenance-btn" onClick={() => navigate(getNavigationPath('/backup'))}>
                <span className="icon">🗃️</span>
                <span>Backup</span>
                <span className="description">Create a backup of your system data.</span>
              </button>
              {isAdmin && (
                <button className="maintenance-btn" onClick={() => navigate(getNavigationPath('/user-management'))}>
                  <span className="icon">👥</span>
                  <span>User Management</span>
                  <span className="description">Manage employee accounts and view user activity logs.</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Maintenance;
