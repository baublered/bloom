import axios from 'axios';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Reports.css';
import './Dashboard.css'; // Import dashboard styles for layout
import UserProfile from './UserProfile';
import Sidebar from './Sidebar'; // Add sidebar import

const Reports = () => {
  const navigate = useNavigate();
  const [summaryData, setSummaryData] = useState({ 
    totalSales: 0, 
    totalRevenue: 0,
    lowStocks: 0, 
    spoiledProducts: 0 
  });
  const [transactions, setTransactions] = useState([]);
  const [allSalesHistory, setAllSalesHistory] = useState([]); // Combined transactions and events
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);

  useEffect(() => {
    const fetchReportsData = async () => {
      try {
        const [transRes, spoilRes, productsRes, eventsRes] = await Promise.all([
            axios.get('/api/transactions'),
            axios.get('/api/spoilage'),
            axios.get('/api/products'),
            axios.get('/api/events')
        ]);

        const lowStockCount = productsRes.data.filter(p => p.quantity <= 10).length;

        // Count total sales from both retail transactions and events
        const retailSalesCount = transRes.data.length;
        const eventSalesCount = eventsRes.data.filter(event => 
          event.status === 'Fully Paid' && event.totalAmount > 0
        ).length;
        const totalSalesCount = retailSalesCount + eventSalesCount;

        // Calculate total revenue from both sources
        const retailRevenue = transRes.data.reduce((sum, tx) => sum + (tx.totalAmount || 0), 0);
        const eventRevenue = eventsRes.data
          .filter(event => event.status === 'Fully Paid')
          .reduce((sum, event) => sum + (event.totalAmount || 0), 0);
        const totalRevenue = retailRevenue + eventRevenue;

        // Create combined sales history for transaction history display
        const retailHistory = transRes.data.map(tx => ({
          ...tx,
          saleType: 'Retail',
          customerName: tx.eventDetails?.customerName || 'Retail Sale',
          saleDate: tx.createdAt
        }));

        const eventHistory = eventsRes.data
          .filter(event => event.status === 'Fully Paid' && event.totalAmount > 0)
          .map(event => ({
            _id: event._id,
            saleType: 'Event',
            customerName: event.customerName,
            totalAmount: event.totalAmount,
            subtotal: event.subtotal || event.totalAmount,
            discountAmount: event.discountAmount || 0,
            saleDate: event.updatedAt,
            items: event.products || [],
            eventType: event.eventType,
            eventDate: event.eventDate,
            transactionType: 'Events',
            // Include event details for consistency with retail transactions
            eventDetails: {
              customerName: event.customerName,
              eventType: event.eventType,
              eventDate: event.eventDate
            }
          }));

        const combinedHistory = [...retailHistory, ...eventHistory]
          .sort((a, b) => new Date(b.saleDate) - new Date(a.saleDate));

        setTransactions(transRes.data);
        setAllSalesHistory(combinedHistory);
        setSummaryData({ 
            totalSales: totalSalesCount,
            totalRevenue: totalRevenue,
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
    <div className="dashboard-container">
      <Sidebar />
      
      <main className="dashboard-main">
        <header className="dashboard-header">
          <h1>Reports</h1>
          <UserProfile />
        </header>

        <div className="reports-content">
          <div className="summary-cards-container">
            <div className="summary-card clickable" onClick={() => navigate('/sales-report')}>
              <div className="card-header"><h3>Sales reports</h3><span className="card-icon">📄</span></div>
              <p className="card-title">Total Sales</p>
              <p className="card-value">{summaryData.totalSales}</p>
              <p className="card-subtitle">₱{(summaryData.totalRevenue || 0).toFixed(2)} revenue</p>
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
              {!loading && !error && allSalesHistory.slice(0, 5).map(sale => (
                <div key={sale._id} className="transaction-row">
                  <div className="customer-info">
                    <div>
                      <p className="customer-name">{sale.customerName}</p>
                      <p className="transaction-date">{new Date(sale.saleDate).toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="transaction-details">
                    <p className="transaction-amount">₱{(sale.totalAmount || 0).toFixed(2)}</p>
                    <p className="transaction-type">
                      {sale.saleType}
                      {sale.eventType && ` (${sale.eventType})`}
                    </p>
                    <button onClick={() => handleSeeDetails(sale)} className="details-link">See details</button>
                  </div>
                </div>
              ))}
            </div>
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
              <div className="receipt-info-line"><span>Date:</span><span>{new Date(selectedTransaction.saleDate || selectedTransaction.createdAt).toLocaleString()}</span></div>
              <div className="receipt-info-line"><span>Type:</span><span>{selectedTransaction.saleType}</span></div>
              {selectedTransaction.saleType === 'Event' && (
                <>
                  <div className="receipt-info-line"><span>Event Type:</span><span>{selectedTransaction.eventType}</span></div>
                  <div className="receipt-info-line"><span>Event Date:</span><span>{new Date(selectedTransaction.eventDate).toLocaleDateString()}</span></div>
                </>
              )}
              {selectedTransaction.cashierName && (
                <div className="receipt-info-line"><span>Cashier:</span><span>{selectedTransaction.cashierName}</span></div>
              )}
              <div className="receipt-info-line"><span>Customer:</span><span>{selectedTransaction.customerName}</span></div>
              
              <h4 className="receipt-section-title">Items</h4>
              {selectedTransaction.items && selectedTransaction.items.map((item, index) => (
                <div key={item.productId || item._id || index} className="receipt-item">
                  <span>{item.quantity} x {item.productName}</span>
                  <span>₱{((item.price || 0) * (item.quantity || 1)).toFixed(2)}</span>
                </div>
              ))}
              
              <h4 className="receipt-section-title">Summary</h4>
              <div className="receipt-summary-line"><span>Subtotal:</span><span>₱{(selectedTransaction.subtotal || 0).toFixed(2)}</span></div>
              {selectedTransaction.discountAmount > 0 && (
                <div className="receipt-summary-line discount"><span>Discount:</span><span>- ₱{(selectedTransaction.discountAmount || 0).toFixed(2)}</span></div>
              )}
              <div className="receipt-summary-line total"><span>Total Paid:</span><span>₱{(selectedTransaction.totalAmount || 0).toFixed(2)}</span></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;
