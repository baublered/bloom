import { Outlet } from 'react-router-dom';
import './Dashboard.css';
import EmployeeSidebar from './EmployeeSidebar';

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
