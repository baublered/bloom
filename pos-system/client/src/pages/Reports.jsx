import axios from 'axios';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
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
  const [showAllTransactions, setShowAllTransactions] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

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

  const toggleShowAllTransactions = () => {
    setShowAllTransactions(!showAllTransactions);
  };

  const handleExportClick = () => {
    setIsExportModalOpen(true);
  };

  const handleCloseExportModal = () => {
    setIsExportModalOpen(false);
  };

  const exportToPDF = () => {
    // Simple PDF export using window.print for transaction history
    const printWindow = window.open('', '_blank');
    const printContent = `
      <html>
        <head>
          <title>Transaction History Report</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1 { color: #333; border-bottom: 2px solid #007bff; padding-bottom: 10px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
            th { background-color: #f8f9fa; font-weight: bold; }
            tr:nth-child(even) { background-color: #f9f9f9; }
            .summary { margin-bottom: 20px; padding: 15px; background: #f8f9fa; border-radius: 5px; }
          </style>
        </head>
        <body>
          <h1>Transaction History Report</h1>
          <div class="summary">
            <h3>Summary</h3>
            <p><strong>Total Transactions:</strong> ${allSalesHistory.length}</p>
            <p><strong>Total Revenue:</strong> ₱${allSalesHistory.reduce((sum, sale) => sum + (sale.totalAmount || 0), 0).toFixed(2)}</p>
            <p><strong>Generated on:</strong> ${new Date().toLocaleString()}</p>
          </div>
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Customer</th>
                <th>Type</th>
                <th>Amount</th>
                <th>Transaction ID</th>
              </tr>
            </thead>
            <tbody>
              ${allSalesHistory.map(sale => `
                <tr>
                  <td>${new Date(sale.saleDate).toLocaleString()}</td>
                  <td>${sale.customerName}</td>
                  <td>${sale.saleType}${sale.eventType ? ` (${sale.eventType})` : ''}</td>
                  <td>₱${(sale.totalAmount || 0).toFixed(2)}</td>
                  <td>${sale._id}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </body>
      </html>
    `;
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.print();
    setIsExportModalOpen(false);
  };

  const exportToExcel = () => {
    try {
      // Create summary data
      const summaryData = [
        ['Transaction History Report'],
        [''],
        ['Summary'],
        ['Total Transactions', allSalesHistory.length],
        ['Total Revenue', `₱${allSalesHistory.reduce((sum, sale) => sum + (sale.totalAmount || 0), 0).toFixed(2)}`],
        ['Generated on', new Date().toLocaleString()],
        [''],
        ['Detailed Transactions'],
        ['Date', 'Customer', 'Type', 'Amount', 'Transaction ID', 'Items Count']
      ];

      // Add transaction data
      const transactionData = allSalesHistory.map(sale => [
        new Date(sale.saleDate).toLocaleString(),
        sale.customerName,
        `${sale.saleType}${sale.eventType ? ` (${sale.eventType})` : ''}`,
        (sale.totalAmount || 0).toFixed(2),
        sale._id,
        (sale.items ? sale.items.length : 0)
      ]);

      const combinedData = [...summaryData, ...transactionData];

      // Create workbook and worksheet
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.aoa_to_sheet(combinedData);

      // Style the worksheet
      ws['A1'] = { v: 'Transaction History Report', t: 's', s: { font: { bold: true, sz: 16 } } };
      ws['A3'] = { v: 'Summary', t: 's', s: { font: { bold: true } } };
      ws['A8'] = { v: 'Detailed Transactions', t: 's', s: { font: { bold: true } } };

      // Set column widths
      ws['!cols'] = [
        { wch: 20 }, // Date
        { wch: 25 }, // Customer
        { wch: 15 }, // Type
        { wch: 12 }, // Amount
        { wch: 25 }, // Transaction ID
        { wch: 12 }  // Items Count
      ];

      XLSX.utils.book_append_sheet(wb, ws, 'Transaction History');
      XLSX.writeFile(wb, `Transaction_History_${new Date().toISOString().split('T')[0]}.xlsx`);
      setIsExportModalOpen(false);
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      alert('Failed to export to Excel. Please try again.');
    }
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
              <div className="transaction-actions">
                <button 
                  className="toggle-all-button"
                  onClick={toggleShowAllTransactions}
                >
                  {showAllTransactions ? 'Show Less' : 'Show All'}
                </button>
                <button className="export-button" onClick={handleExportClick}>
                  <span className="export-icon">📤</span>
                </button>
              </div>
            </header>
            <div className={`transaction-table ${showAllTransactions ? 'scrollable' : ''}`}>
              {loading && <p>Loading history...</p>}
              {error && <p className="error-message">{error}</p>}
              {!loading && !error && (showAllTransactions ? allSalesHistory : allSalesHistory.slice(0, 5)).map(sale => (
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
              {!loading && !error && allSalesHistory.length === 0 && (
                <div className="no-transactions">
                  <p>No transactions found.</p>
                </div>
              )}
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

      {/* Export Modal */}
      {isExportModalOpen && (
        <div className="export-modal-overlay">
          <div className="export-modal-content">
            <div className="export-modal-header">
              <h3>Export Transaction History</h3>
              <button className="close-modal-btn" onClick={handleCloseExportModal}>&times;</button>
            </div>
            <div className="export-modal-body">
              <p>Choose export format:</p>
              <div className="export-options">
                <button className="export-option-btn pdf" onClick={exportToPDF}>
                  <span className="export-option-icon">📄</span>
                  <span>Export as PDF</span>
                </button>
                <button className="export-option-btn excel" onClick={exportToExcel}>
                  <span className="export-option-icon">📊</span>
                  <span>Export as Excel</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;
