import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Dashboard.css'; // We'll style it here

function Dashboard() {
  const [showTransactionOptions, setShowTransactionOptions] = useState(false);

  const toggleTransactionOptions = () => {
    setShowTransactionOptions(!showTransactionOptions);
  };

  return (
    <div className="dashboard-container">
      <aside className="sidebar">
        <h2 className="logo">BloomTrack</h2>
        <nav>
          <ul>
            <li>Dashboard</li>
            <li>

            <Link to="/product-registration" className="sidebar-link">Product Registration</Link>
            </li>

            <li>
            <Link to="/user-registration" className="sidebar-link">User Registration</Link>
            </li>

            <li onClick={toggleTransactionOptions} className="clickable">
              Transactions {showTransactionOptions ? "▲" : "▼"}
            </li>
            {showTransactionOptions && (
              <ul className="sub-menu">
                <li className="sub-item">
                <Link to="/retail" className="sidebar-link">Retail</Link>
                  </li>
                
                <li className="sub-item">
                  <Link to="/events" className="sidebar-link">
                    Events
                  </Link>
                </li>
              </ul>
            )}
            <li>Reports</li>
            
            <li>
            <Link to="/inventory" className="sidebar-link">Inventory</Link>
            </li>

            <li>
            <Link to="/maintenance" className="sidebar-link">Maintenance</Link>
            </li>

          </ul>
        </nav>
      </aside>

      <main className="dashboard-main">
        <header className="dashboard-header">
          <h1>Dashboard</h1>
          <div className="user-profile">User Profile ▼</div>
        </header>

        <section className="dashboard-content">
          <div className="card sales-overview">
            <h3>Sales overview</h3>
            <p>Total Sales: <strong>30</strong></p>
            <p>Total Cost: <strong>5,754</strong></p>
          </div>

          <div className="card inventory-summary">
            <h3>Inventory Summary</h3>
            <p>Quantity in Hand: <strong>84</strong></p>
            <p>Will Be Received: <strong>150</strong></p>
          </div>

          <div className="card product-details">
            <h3>Product Details</h3>
            <p>Low Stock Items: <strong>06</strong></p>
            <p>No. of Items: <strong>256</strong></p>
            <p>Spoiled Products: <strong>10</strong></p>
          </div>
        </section>
      </main>
    </div>
  );
}

export default Dashboard;
