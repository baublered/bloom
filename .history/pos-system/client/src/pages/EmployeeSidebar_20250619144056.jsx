import { useState } from 'react';
import { NavLink } from 'react-router-dom';
// This can reuse the same CSS as your main dashboard sidebar
import './Dashboard.css';

const SidebarLink = ({ to, children }) => (
  <NavLink to={to} className="sidebar-link">
    {children}
  </NavLink>
);

// This is the limited sidebar for employees
function EmployeeSidebar() {
  const [isTransactionsOpen, setIsTransactionsOpen] = useState(false);

  const toggleTransactions = () => {
    setIsTransactionsOpen(!isTransactionsOpen);
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h1>BLOOMTRACK</h1>
      </div>
      <nav className="sidebar-nav">
        {/* Links available to employees */}
        <SidebarLink to="/employee-dashboard">Dashboard</SidebarLink>
        <SidebarLink to="/employee-dashboard/product-registration">Product Registration</SidebarLink>

        <div className="transactions-section">
          <div className="sidebar-link" onClick={toggleTransactions}>
            <span>Transactions</span>
            <span className="arrow">{isTransactionsOpen ? '▲' : '▼'}</span>
          </div>
          {isTransactionsOpen && (
            <div className="sub-links">
              <NavLink to="/employee-dashboard/retail" className="sidebar-sublink">Retail</NavLink>
              <NavLink to="/employee-dashboard/events" className="sidebar-sublink">Events</NavLink>
            </div>
          )}
        </div>
        
        <SidebarLink to="/inventory">Inventory</SidebarLink>
        
        {/* Help and About Us are usually available to all roles */}
        <SidebarLink to="/help">Help Center</SidebarLink>
        <SidebarLink to="/about">About Us</SidebarLink>
      </nav>
    </aside>
  );
}

export default EmployeeSidebar;
