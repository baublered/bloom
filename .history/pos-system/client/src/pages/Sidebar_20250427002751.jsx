import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Dashboard.css'; // Assuming you have some styling

function Dashboard() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isTransactionsOpen, setIsTransactionsOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const toggleTransactions = () => {
    setIsTransactionsOpen(!isTransactionsOpen);
  };

  return (
    <div className="dashboard-container">
      <div className={`sidebar ${isSidebarOpen ? 'open' : 'closed'}`}>
        <button className="toggle-btn" onClick={toggleSidebar}>
          {isSidebarOpen ? '<' : '>'}
        </button>

        <div className="sidebar-links">
          <Link to="/dashboard" className="sidebar-link">
            Dashboard
          </Link>

          <div className="sidebar-link" onClick={toggleTransactions}>
            Transactions ▼
          </div>

          {isTransactionsOpen && (
            <div className="sub-links">
              <Link to="/dashboard/retail" className="sidebar-sublink">
                Retail
              </Link>
              <Link to="/dashboard/events" className="sidebar-sublink">
                Events
              </Link>
            </div>
          )}

          <Link to="/dashboard/inventory" className="sidebar-link">
            Inventory
          </Link>

          <Link to="/dashboard/reports" className="sidebar-link">
            Reports
          </Link>

          {/* You can add more links below if needed */}
        </div>
      </div>

      <div className="main-content">
        {/* This is where the content will load */}
        <h1>Welcome to Dashboard</h1>
      </div>
    </div>
  );
}

export default Dashboard;
