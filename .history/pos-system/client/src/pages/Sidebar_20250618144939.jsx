import { useState } from 'react'; // 1. Import useState
import { NavLink } from 'react-router-dom';
import './Dashboard.css';

const SidebarLink = ({ to, children }) => (
  <NavLink to={to} className="sidebar-link">
    {children}
  </NavLink>
);

function Sidebar() {
  // 2. Add state to track if the transactions menu is open
  const [isTransactionsOpen, setIsTransactionsOpen] = useState(false);

  // 3. Create a function to toggle the state
  const toggleTransactions = () => {
    setIsTransactionsOpen(!isTransactionsOpen);
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h1>BLOOMTRACK</h1>
      </div>
      <nav className="sidebar-nav">
        <SidebarLink to="/dashboard">Dashboard</SidebarLink>
        <SidebarLink to="/product-registration">Product Registration</SidebarLink>
        <SidebarLink to="/user-registration">User Registration</SidebarLink>

        {/* 4. Update the Transactions Section to be interactive */}
        <div className="transactions-section">
          <div className="sidebar-link" onClick={toggleTransactions}>
            <span>Transactions</span>
            {/* Add an arrow that changes based on state */}
            <span className="arrow">{isTransactionsOpen ? '▲' : '▼'}</span>
          </div>

          {/* 5. Conditionally render the sub-links */}
          {isTransactionsOpen && (
            <div className="sub-links">
              <NavLink to="/retail" className="sidebar-sublink">
                Retail
              </NavLink>
              <NavLink to="/events" className="sidebar-sublink">
                Events
              </NavLink>
            </div>
          )}
        </div>

        <SidebarLink to="/reports">Reports</SidebarLink>
        <SidebarLink to="/inventory">Inventory</SidebarLink>
        <SidebarLink to="/maintenance">Maintenance</SidebarLink>
        <SidebarLink to="/help">Help</SidebarLink>
        <SidebarLink to="/about">About Us</SidebarLink>
      </nav>
    </aside>
  );
}

export default Sidebar;