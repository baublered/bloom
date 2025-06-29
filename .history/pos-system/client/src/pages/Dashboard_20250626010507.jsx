import { Outlet } from 'react-router-dom'; // Import Outlet
import './Dashboard.css'; // This will use the updated CSS
import Sidebar from './Sidebar';
import UserProfile from './UserProfile';

const Dashboard = () => {
  return (
    <div className="dashboard-layout"> {/* Use the new layout class */}
      <Sidebar />
      <main className="dashboard-main-content">
        <header className="dashboard-main-header">
          {/* The UserProfile component now lives in the main layout's header */}
          <UserProfile />
        </header>
        <div className="page-content">
          {/* This Outlet is where child routes like Profile and DashboardHome will be rendered */}
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
