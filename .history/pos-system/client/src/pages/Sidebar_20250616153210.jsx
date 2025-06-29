// Sidebar.jsx

import { NavLink } from 'react-router-dom';
import './Dashboard.css';

// A reusable NavLink component to handle active styles
const SidebarLink = ({ to, children }) => (
  <NavLink to={to} className="sidebar-link">
    {children}
  </NavLink>
);

function Sidebar() {
  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h1>BLOOMTRACK</h1>
      </div>
      <nav className="sidebar-nav">
        <SidebarLink to="/dashboard">Dashboard</SidebarLink>
        <SidebarLink to="/product-registration">Product Registration</SidebarLink>
        <SidebarLink to="/user-registration">User Registration</SidebarLink>

        {/* Transactions Section */}
        <div className="transactions-section">
          <span className="sidebar-link-header">Transactions</span>
          <div className="sub-links">
            <NavLink to="/retail" className="sidebar-sublink">
              Retail
            </NavLink>
            <NavLink to="/events" className="sidebar-sublink">
              Events
            </NavLink>
          </div>
        </div>

        <SidebarLink to="/reports">Reports</SidebarLink>
        <SidebarLink to="/inventory">Inventory</SidebarLink>
        <SidebarLink to="/maintenance">Maintenance</SidebarLink>
      </nav>
    </div>
  );
}

export default Sidebar;