import { useState } from 'react';
import './Reports.css'; // We'll create this new CSS file

const Reports = () => {
  // We'll use mock data for now. This will be replaced by API calls.
  const [summaryData, setSummaryData] = useState({
    totalSales: 30,
    lowStocks: 5,
    spoiledProducts: 10,
  });

  const [transactions, setTransactions] = useState([
    { id: 1, customer: 'Jilliana A.', date: 'Oct. 16, 2024, 1:44 pm', amount: 10540.00, type: 'Events' },
    { id: 2, customer: 'Jilliana A.', date: 'Oct. 16, 2024, 1:44 pm', amount: 150.00, type: 'Retail' },
    { id: 3, customer: 'Jilliana A.', date: 'Oct. 16, 2024, 1:44 pm', amount: 10540.00, type: 'Events' },
  ]);

  // useEffect hook to fetch real data can be added here later
  // useEffect(() => {
  //   // Fetch summary data
  //   // Fetch transaction history
  // }, []);

  return (
    <div className="reports-page">
      <header className="reports-page-header">
        <h1>Reports</h1>
        <div className="user-profile-button">
          <span className="user-icon">👤</span>
          <span>User Profile</span>
          <span className="dropdown-arrow">▼</span>
        </div>
      </header>

      <main className="reports-main-content">
        {/* Top Summary Cards */}
        <div className="summary-cards-container">
          <div className="summary-card">
            <div className="card-header">
              <h3>Sales reports</h3>
              <span className="card-icon">📄</span>
            </div>
            <p className="card-title">Total Sales</p>
            <p className="card-value">{summaryData.totalSales}</p>
          </div>
          <div className="summary-card">
            <div className="card-header">
              <h3>Inventory reports</h3>
              <span className="card-icon">📦</span>
            </div>
            <p className="card-title">Low stocks</p>
            <p className="card-value">{summaryData.lowStocks}</p>
          </div>
          <div className="summary-card">
            <div className="card-header">
              <h3>Spoilage reports</h3>
              <span className="card-icon">🗑️</span>
            </div>
            <p className="card-title">Spoiled products</p>
            <p className="card-value">{summaryData.spoiledProducts}</p>
          </div>
        </div>

        {/* Transaction History Table */}
        <div className="transaction-history-card">
          <header className="transaction-history-header">
            <h2>Transaction History</h2>
            <button className="export-button">
              <span className="export-icon">+</span>
            </button>
          </header>
          <div className="transaction-table">
            {transactions.map(tx => (
              <div key={tx.id} className="transaction-row">
                <div className="customer-info">
                  <input type="checkbox" />
                  <div>
                    <p className="customer-name">{tx.customer}</p>
                    <p className="transaction-date">{tx.date}</p>
                  </div>
                </div>
                <div className="transaction-details">
                  <p className="transaction-amount">P{tx.amount.toFixed(2)}</p>
                  <p className="transaction-type">{tx.type}</p>
                  <a href="#" className="details-link">See details</a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Reports;
