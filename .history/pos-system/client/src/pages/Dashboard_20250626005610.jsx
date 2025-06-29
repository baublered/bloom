import { Outlet } from 'react-router-dom'; // Import Outlet to render child routes
import './Dashboard.css'; // Your shared dashboard styles
import Sidebar from './Sidebar'; // Your main admin sidebar
import UserProfile from './UserProfile'; // Your interactive user profile button

const Dashboard = () => {
  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="dashboard-main-content">
        <header className="dashboard-main-header">
            {/* The UserProfile component lives in the main layout header */}
            <UserProfile />
        </header>
        <div className="page-content">
            {/* The Outlet is where child routes like DashboardHome and Profile will be rendered */}
            <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
