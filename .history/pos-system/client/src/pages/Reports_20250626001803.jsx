import axios from 'axios';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Reports.css';

const Reports = () => {
  const navigate = useNavigate();
  const [summaryData, setSummaryData] = useState({ totalSales: 0, lowStocks: 0, spoiledProducts: 0 });
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);

  useEffect(() => {
    const fetchReportsData = async () => {
      try {
        const [transRes, spoilRes, productsRes] = await Promise.all([
            axios.get('/api/transactions'),
            axios.get('/api/spoilage'),
            axios.get('/api/products')
        ]);

        const lowStockCount = productsRes.data.filter(p => p.quantity <= 10).length;

        setTransactions(transRes.data);
        setSummaryData({ 
            totalSales: transRes.data.length,
            spoiledProducts: spoilRes.data.length,
            lowStocks: lowStockCount
        });

      } catch (err) {
        setError('Failed to load report data.');
        console.error(err);
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
        <div className="user-profile">
                        <UserProfile />
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
            {!loading && !error && transactions.slice(0, 5).map(tx => (
              <div key={tx._id} className="transaction-row">
                <div className="customer-info">
                  <input type="checkbox" />
                  <div>
                    {/* --- FIX: Correctly check for eventDetails and customerName --- */}
                    <p className="customer-name">{tx.eventDetails?.customerName || 'Retail Sale'}</p>
                    <p className="transaction-date">{new Date(tx.createdAt).toLocaleString()}</p>
                  </div>
                </div>
                <div className="transaction-details">
                  <p className="transaction-amount">P{(tx.totalAmount || 0).toFixed(2)}</p>
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
              {/* --- FIX: Also show event details in receipt if they exist --- */}
              {selectedTransaction.transactionType === 'Events' && selectedTransaction.eventDetails && (
                  <div className="receipt-info-line">
                      <span>Event Customer:</span>
                      <span>{selectedTransaction.eventDetails.customerName}</span>
                  </div>
              )}
              <h4 className="receipt-section-title">Items</h4>
              {selectedTransaction.items.map(item => (
                <div key={item.productId || item._id} className="receipt-item">
                  <span>{item.quantity} x {item.productName}</span>
                  <span>P{((item.price || 0) * (item.quantity || 1)).toFixed(2)}</span>
                </div>
              ))}
              <h4 className="receipt-section-title">Summary</h4>
              <div className="receipt-summary-line"><span>Subtotal:</span><span>P{(selectedTransaction.subtotal || 0).toFixed(2)}</span></div>
              <div className="receipt-summary-line discount"><span>Discount:</span><span>- P{(selectedTransaction.discountAmount || 0).toFixed(2)}</span></div>
              <div className="receipt-summary-line total"><span>Total Paid:</span><span>P{(selectedTransaction.totalAmount || 0).toFixed(2)}</span></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;
