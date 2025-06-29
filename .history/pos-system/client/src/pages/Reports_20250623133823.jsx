import axios from 'axios';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Reports.css';

const Reports = () => {
  const navigate = useNavigate();
  const [summaryData, setSummaryData] = useState({ totalSales: 0, lowStocks: 5, spoiledProducts: 0 });
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);

  useEffect(() => {
    const fetchReportsData = async () => {
      try {
        // Fetch both transactions and spoilage reports
        const [transRes, spoilRes] = await Promise.all([
            axios.get('/api/transactions'),
            axios.get('/api/spoilage') // Fetch spoilage data
        ]);

        setTransactions(transRes.data);
        // Update summary cards with real data
        setSummaryData(prev => ({ 
            ...prev, 
            totalSales: transRes.data.length,
            spoiledProducts: spoilRes.data.length 
        }));

      } catch (err) {
        setError('Failed to load report data.');
      } finally {
        setLoading(false);
      }
    };
    fetchReportsData();
  }, []);

  const handleSeeDetails = (transaction) => {
    setSelectedTransaction(transaction);
    setIsModalOpen(true);
  };
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedTransaction(null);
  };

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
        <div className="summary-cards-container">
          <div className="summary-card clickable" onClick={() => navigate('/sales-report')}>
            <div className="card-header"><h3>Sales reports</h3><span className="card-icon">📄</span></div>
            <p className="card-title">Total Sales</p><p className="card-value">{summaryData.totalSales}</p>
          </div>
          <div className="summary-card clickable" onClick={() => navigate('/inventory-report')}>
            <div className="card-header"><h3>Inventory reports</h3><span className="card-icon">📦</span></div>
            <p className="card-title">Low stocks</p><p className="card-value">{summaryData.lowStocks}</p>
          </div>
          {/* --- UPDATED: Spoilage card is now clickable --- */}
          <div className="summary-card clickable" onClick={() => navigate('/spoilage-report')}>
            <div className="card-header"><h3>Spoilage reports</h3><span className="card-icon">🗑️</span></div>
            <p className="card-title">Spoiled products</p><p className="card-value">{summaryData.spoiledProducts}</p>
          </div>
        </div>
        <div className="transaction-history-card">
          <header className="transaction-history-header">
            <h2>Transaction History</h2>
            <button className="export-button"><span className="export-icon">+</span></button>
          </header>
          <div className="transaction-table">
            {loading && <p>Loading history...</p>}
            {error && <p className="error-message">{error}</p>}
            {!loading && !error && transactions.slice(0, 5).map(tx => ( // Show recent 5 transactions
              <div key={tx._id} className="transaction-row">
                <div className="customer-info">
                  <input type="checkbox" />
                  <div>
                    <p className="customer-name">{tx.eventDetails?.customerName || 'Retail Sale'}</p>
                    <p className="transaction-date">{new Date(tx.createdAt).toLocaleString()}</p>
                  </div>
                </div>
                <div className="transaction-details">
                  <p className="transaction-amount">P{tx.totalAmount.toFixed(2)}</p>
                  <p className="transaction-type">{tx.transactionType}</p>
                  <button onClick={() => handleSeeDetails(tx)} className="details-link">See details</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
      {isModalOpen && selectedTransaction && (
        <div className="receipt-modal-overlay">
          <div className="receipt-modal-content">
            <div className="receipt-header">
              <h2>Transaction Receipt</h2>
              <button className="close-modal-btn" onClick={handleCloseModal}>&times;</button>
            </div>
            <div className="receipt-body">
              <div className="receipt-info-line"><span>Transaction ID:</span><span>{selectedTransaction._id}</span></div>
              <div className="receipt-info-line"><span>Date:</span><span>{new Date(selectedTransaction.createdAt).toLocaleString()}</span></div>
              <div className="receipt-info-line"><span>Cashier:</span><span>{selectedTransaction.cashierName}</span></div>
              <h4 className="receipt-section-title">Items</h4>
              {selectedTransaction.items.map(item => (
                <div key={item.productId || item._id} className="receipt-item">
                  <span>{item.quantity} x {item.productName}</span>
                  <span>P{(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
              <h4 className="receipt-section-title">Summary</h4>
              <div className="receipt-summary-line"><span>Subtotal:</span><span>P{selectedTransaction.subtotal.toFixed(2)}</span></div>
              <div className="receipt-summary-line discount"><span>Discount:</span><span>- P{selectedTransaction.discountAmount.toFixed(2)}</span></div>
              <div className="receipt-summary-line total"><span>Total Paid:</span><span>P{selectedTransaction.totalAmount.toFixed(2)}</span></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;
