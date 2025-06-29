import { Outlet } from 'react-router-dom';
import './Dashboard.css'; // This can also reuse your main dashboard CSS
import EmployeeSidebar from './EmployeeSidebar'; // Import the new employee sidebar

const EmployeeDashboard = () => {
  return (
    <div className="dashboard-container">
        <EmployeeSidebar />
        <main className="dashboard-main">
            {/* The Outlet component will render the specific employee page */}
            <Outlet />
        </main>
    </div>
  );
};

export default EmployeeDashboard;
