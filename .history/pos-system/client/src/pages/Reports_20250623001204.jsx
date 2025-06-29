import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Reports.css'; 

const Reports = () => {
  // State to hold the fetched data
  const [transactions, setTransactions] = useState([]);
  const [summaryData, setSummaryData] = useState({
    totalSales: 0,
    lowStocks: 5, // This can be replaced with a real API call later
    spoiledProducts: 10, // This can be replaced with a real API call later
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch transaction data from the backend when the component loads
  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const response = await axios.get('/api/transactions');
        setTransactions(response.data);

        // Automatically calculate total sales from the number of transactions
        setSummaryData(prev => ({ ...prev, totalSales: response.data.length }));

      } catch (err) {
        console.error("Error fetching reports:", err);
        setError('Failed to load transaction history.');
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []); // The empty array ensures this runs only once on mount

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
            {loading && <p>Loading history...</p>}
            {error && <p className="error-message">{error}</p>}
            {!loading && !error && transactions.map(tx => (
              <div key={tx._id} className="transaction-row">
                <div className="customer-info">
                  <input type="checkbox" />
                  <div>
                    {/* Display customer name for events, or a default for retail */}
                    <p className="customer-name">{tx.eventDetails?.customerName || 'Retail Sale'}</p>
                    <p className="transaction-date">{new Date(tx.createdAt).toLocaleString()}</p>
                  </div>
                </div>
                <div className="transaction-details">
                  <p className="transaction-amount">P{tx.totalAmount.toFixed(2)}</p>
                  <p className="transaction-type">{tx.transactionType}</p>
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
