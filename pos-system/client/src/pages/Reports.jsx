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
  
  // Date filter state for exports
  const [exportStartDate, setExportStartDate] = useState('');
  const [exportEndDate, setExportEndDate] = useState('');

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
          saleDate: tx.createdAt,
          remainingBalance: 0, // Retail transactions are always fully paid
          paymentMethod: tx.paymentMethod || 'CASH' // Default to CASH for retail if not specified
        }));

        // Process events to include both full payments and downpayments
        const eventHistory = [];
        
        eventsRes.data.forEach(event => {
          // Add fully paid events
          if (event.status === 'Fully Paid' && event.totalAmount > 0) {
            // Get the final payment method from the last payment in history
            const lastPayment = event.paymentHistory && event.paymentHistory.length > 0 
              ? event.paymentHistory[event.paymentHistory.length - 1] 
              : null;
            
            eventHistory.push({
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
              paymentHistory: event.paymentHistory || [],
              paymentMethod: lastPayment ? lastPayment.paymentMethod : 'N/A',
              remainingBalance: 0, // Fully paid events have no remaining balance
              // Include event details for consistency with retail transactions
              eventDetails: {
                customerName: event.customerName,
                eventType: event.eventType,
                eventDate: event.eventDate
              }
            });
          }
          
          // Add individual downpayment transactions
          if (event.paymentHistory && event.paymentHistory.length > 0) {
            event.paymentHistory.forEach((payment, index) => {
              if (payment.isDownpayment) {
                eventHistory.push({
                  _id: `${event._id}-downpayment-${index}`,
                  saleType: 'Downpayment',
                  customerName: event.customerName,
                  totalAmount: payment.amountPaid,
                  subtotal: payment.amountPaid,
                  discountAmount: 0,
                  saleDate: payment.paymentDate || event.createdAt,
                  items: event.products || [],
                  eventType: event.eventType,
                  eventDate: event.eventDate,
                  transactionType: 'Downpayment',
                  paymentMethod: payment.paymentMethod,
                  remainingBalance: event.remainingBalance || 0,
                  parentEventId: event._id,
                  // Include event details for consistency
                  eventDetails: {
                    customerName: event.customerName,
                    eventType: event.eventType,
                    eventDate: event.eventDate
                  }
                });
              }
            });
          }
        });

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
    // Check if date range is provided
    if (!exportStartDate || !exportEndDate) {
      alert("Please select both start and end dates for the report before exporting.");
      return;
    }
    
    // Get filtered transactions for export
    const filteredTransactions = getFilteredTransactionsForExport();
    
    // Simple PDF export using window.print for transaction history
    const printWindow = window.open('', '_blank');
    const printContent = `
      <html>
        <head>
          <title>Transaction History Report</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; color: #333; }
            .header-container { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #333; padding-bottom: 15px; margin-bottom: 20px; }
            .company-details { flex: 1; }
            .company-details h2 { margin: 0; font-size: 24px; }
            .company-details p { margin: 2px 0; font-size: 12px; }
            .report-meta { flex: 1; text-align: right; }
            .report-meta p { margin: 2px 0; font-size: 12px; }
            h1 { text-align: center; font-size: 28px; margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 12px; }
            th, td { border: 1px solid #ccc; padding: 6px; text-align: left; }
            th { background-color: #f2f2f2; font-weight: bold; }
            tr:nth-child(even) { background-color: #f9f9f9; }
            .summary { margin-bottom: 20px; padding: 15px; background: #f8f9fa; border-radius: 5px; }
            .footer { margin-top: 40px; display: flex; justify-content: space-between; font-size: 14px; padding-top: 20px; border-top: 1px solid #ccc; }
            .signature-line { border-bottom: 1px solid #333; width: 200px; display: inline-block; margin-left: 10px; }
          </style>
        </head>
        <body>
          <h1>Transaction History</h1>
          <div class="header-container">
            <div class="company-details">
              <h2>Flowers by Edmar</h2>
              <p>H31 New Public Market Antipolo City</p>
              <p>Antipolo City, Rizal</p>
              <p>Email: admin@bloomtrack.com</p>
            </div>
            <div class="report-meta">
              <p><strong>Date Range:</strong></p>
              <p>From: ${exportStartDate ? new Date(exportStartDate).toLocaleDateString() : 'Start'}</p>
              <p>To: ${exportEndDate ? new Date(exportEndDate).toLocaleDateString() : 'End'}</p>
              <p style="margin-top: 10px;">Generated Report on: ${new Date().toLocaleDateString()}</p>
            </div>
          </div>
          <div class="summary">
            <h3>Summary</h3>
            <p><strong>Total Transactions:</strong> ${filteredTransactions.length}</p>
          </div>
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Customer</th>
                <th>Type</th>
                <th>Amount</th>
                <th>Payment Method</th>
                <th>Remaining Balance</th>
                <th>Transaction ID</th>
              </tr>
            </thead>
            <tbody>
              ${filteredTransactions.map(sale => `
                <tr>
                  <td>${new Date(sale.saleDate).toLocaleString()}</td>
                  <td>${sale.customerName}</td>
                  <td>${sale.saleType}${sale.eventType ? ` (${sale.eventType})` : ''}</td>
                  <td>₱${(sale.totalAmount || 0).toFixed(2)}</td>
                  <td>${sale.paymentMethod || 'N/A'}</td>
                  <td>${sale.remainingBalance > 0 ? `₱${sale.remainingBalance.toFixed(2)}` : '₱0.00'}</td>
                  <td>${sale._id}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="footer">
            <div>Signed BY: <span class="signature-line"></span></div>
            <div>Submitted By: <span class="signature-line"></span></div>
          </div>

          <script>
            window.onload = function() {
              window.print();
              window.onafterprint = function() { window.close(); };
            };
          </script>
        </body>
      </html>
    `;
    printWindow.document.write(printContent);
    printWindow.document.close();
    setIsExportModalOpen(false);
  };

  const exportToExcel = () => {
    try {
      // Check if date range is provided
      if (!exportStartDate || !exportEndDate) {
        alert("Please select both start and end dates for the report before exporting.");
        return;
      }
      
      // Get filtered transactions for export
      const filteredTransactions = getFilteredTransactionsForExport();
      
      // Create summary data
      const summaryData = [
        ['Transaction History Report'],
        [''],
        ['Date Range'],
        ['From', exportStartDate ? new Date(exportStartDate).toLocaleDateString() : 'Start'],
        ['To', exportEndDate ? new Date(exportEndDate).toLocaleDateString() : 'End'],
        ['Generated on', new Date().toLocaleString()],
        [''],
        ['Summary'],
        ['Total Transactions', filteredTransactions.length],
        [''],
        ['Detailed Transactions'],
        ['Date', 'Customer', 'Type', 'Amount', 'Payment Method', 'Remaining Balance', 'Transaction ID', 'Items Count']
      ];

      // Add transaction data
      const transactionData = filteredTransactions.map(sale => [
        new Date(sale.saleDate).toLocaleString(),
        sale.customerName,
        `${sale.saleType}${sale.eventType ? ` (${sale.eventType})` : ''}`,
        (sale.totalAmount || 0).toFixed(2),
        sale.paymentMethod || 'N/A',
        sale.remainingBalance > 0 ? `₱${sale.remainingBalance.toFixed(2)}` : '₱0.00',
        sale._id,
        (sale.items ? sale.items.length : 0)
      ]);

      const combinedData = [...summaryData, ...transactionData];

      // Create workbook and worksheet
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.aoa_to_sheet(combinedData);

      // Style the worksheet
      ws['A1'] = { v: 'Transaction History Report', t: 's', s: { font: { bold: true, sz: 16 } } };
      ws['A3'] = { v: 'Date Range', t: 's', s: { font: { bold: true } } };
      ws['A8'] = { v: 'Summary', t: 's', s: { font: { bold: true } } };
      ws['A11'] = { v: 'Detailed Transactions', t: 's', s: { font: { bold: true } } };

      // Set column widths
      ws['!cols'] = [
        { wch: 20 }, // Date
        { wch: 25 }, // Customer
        { wch: 15 }, // Type
        { wch: 12 }, // Amount
        { wch: 15 }, // Payment Method
        { wch: 18 }, // Remaining Balance
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

  // Filter transactions by date range for export
  const getFilteredTransactionsForExport = () => {
    // Since date range is now required, we should always have both dates
    if (!exportStartDate || !exportEndDate) {
      return [];
    }

    return allSalesHistory.filter(sale => {
      const saleDate = new Date(sale.saleDate);
      const start = new Date(exportStartDate);
      const end = new Date(exportEndDate);
      
      // Set end date to end of day for inclusive filtering
      end.setHours(23, 59, 59, 999);

      return saleDate >= start && saleDate <= end;
    });
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
                    {sale.paymentMethod && (
                      <p className="payment-method">via {sale.paymentMethod}</p>
                    )}
                    {sale.remainingBalance > 0 && (
                      <p className="remaining-balance">Balance: ₱{sale.remainingBalance.toFixed(2)}</p>
                    )}
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
              {selectedTransaction.paymentMethod && (
                <div className="receipt-info-line"><span>Payment Method:</span><span>{selectedTransaction.paymentMethod}</span></div>
              )}
              {selectedTransaction.saleType === 'Downpayment' && selectedTransaction.remainingBalance > 0 && (
                <div className="receipt-info-line"><span>Remaining Balance:</span><span>₱{selectedTransaction.remainingBalance.toFixed(2)}</span></div>
              )}
              {selectedTransaction.saleType === 'Event' && (
                <>
                  <div className="receipt-info-line"><span>Event Type:</span><span>{selectedTransaction.eventType}</span></div>
                  <div className="receipt-info-line"><span>Event Date:</span><span>{new Date(selectedTransaction.eventDate).toLocaleDateString()}</span></div>
                </>
              )}
              {selectedTransaction.eventType && selectedTransaction.saleType === 'Downpayment' && (
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
              {selectedTransaction.saleType === 'Downpayment' ? (
                <>
                  <div className="receipt-summary-line"><span>Downpayment Amount:</span><span>₱{(selectedTransaction.totalAmount || 0).toFixed(2)}</span></div>
                  {selectedTransaction.remainingBalance > 0 && (
                    <div className="receipt-summary-line"><span>Remaining Balance:</span><span>₱{selectedTransaction.remainingBalance.toFixed(2)}</span></div>
                  )}
                </>
              ) : (
                <>
                  <div className="receipt-summary-line"><span>Subtotal:</span><span>₱{(selectedTransaction.subtotal || 0).toFixed(2)}</span></div>
                  {selectedTransaction.discountAmount > 0 && (
                    <div className="receipt-summary-line discount"><span>Discount:</span><span>- ₱{(selectedTransaction.discountAmount || 0).toFixed(2)}</span></div>
                  )}
                  <div className="receipt-summary-line total"><span>Total Paid:</span><span>₱{(selectedTransaction.totalAmount || 0).toFixed(2)}</span></div>
                </>
              )}
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
              <div className="export-date-filter">
                <h4>Select Date Range *</h4>
                <div className="date-inputs">
                  <div className="date-input-group">
                    <label htmlFor="export-start-date">From: *</label>
                    <input
                      id="export-start-date"
                      type="date"
                      value={exportStartDate}
                      onChange={(e) => setExportStartDate(e.target.value)}
                      required
                    />
                  </div>
                  <div className="date-input-group">
                    <label htmlFor="export-end-date">To: *</label>
                    <input
                      id="export-end-date"
                      type="date"
                      value={exportEndDate}
                      onChange={(e) => setExportEndDate(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <small className="date-filter-note">
                  * Both start and end dates are required for exporting
                </small>
              </div>
              <div className="export-format-selection">
                <p>Choose export format:</p>
                <div className="export-options">
                  <button 
                    className={`export-option-btn pdf ${(!exportStartDate || !exportEndDate) ? 'disabled' : ''}`} 
                    onClick={exportToPDF}
                    disabled={!exportStartDate || !exportEndDate}
                  >
                    <span className="export-option-icon">📄</span>
                    <span>Export as PDF</span>
                  </button>
                  <button 
                    className={`export-option-btn excel ${(!exportStartDate || !exportEndDate) ? 'disabled' : ''}`} 
                    onClick={exportToExcel}
                    disabled={!exportStartDate || !exportEndDate}
                  >
                    <span className="export-option-icon">📊</span>
                    <span>Export as Excel</span>
                  </button>
                </div>
                {(!exportStartDate || !exportEndDate) && (
                  <small className="export-warning">
                    Please select both start and end dates to enable export options
                  </small>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;
