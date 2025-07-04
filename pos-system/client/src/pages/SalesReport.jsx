import axios from 'axios';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import './SalesReport.css'; // We'll create this new CSS file

const SalesReport = () => {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);
  const [events, setEvents] = useState([]);
  const [allSalesData, setAllSalesData] = useState([]); // Combined transactions and events
  const [filteredSalesData, setFilteredSalesData] = useState([]);
  const [groupedSalesData, setGroupedSalesData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openAccordion, setOpenAccordion] = useState({}); // To track open year/month
  
  // Date filtering state
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [dateFilterApplied, setDateFilterApplied] = useState(false);
  
  // Export modal state
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  useEffect(() => {
    const fetchSalesData = async () => {
      try {
        const [transResponse, eventsResponse] = await Promise.all([
          axios.get('/api/transactions'),
          axios.get('/api/events')
        ]);

        const retailTransactions = transResponse.data.map(tx => ({
          ...tx,
          saleType: 'Retail',
          customerName: 'Retail Sale',
          saleDate: tx.createdAt
        }));

        const eventSales = eventsResponse.data
          .filter(event => event.status === 'Fully Paid' && event.totalAmount > 0)
          .map(event => ({
            // --- FIX: Spread the original event object to include all fields, including user ---
            ...event, 
            _id: event._id,
            saleType: 'Event',
            customerName: event.customerName,
            totalAmount: event.totalAmount,
            subtotal: event.subtotal || event.totalAmount,
            discountAmount: event.discountAmount || 0,
            saleDate: event.updatedAt, // Use the last updated date as sale date
            items: event.products || [],
            eventType: event.eventType,
            eventDate: event.eventDate
          }));

        const allSales = [...retailTransactions, ...eventSales].sort((a, b) => new Date(b.saleDate) - new Date(a.saleDate));
        
        setTransactions(transResponse.data);
        setEvents(eventsResponse.data);
        setAllSalesData(allSales);
        setFilteredSalesData(allSales); // Initially show all sales
        groupSalesDataByDate(allSales);
      } catch (err) {
        setError('Failed to load sales data.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchSalesData();
  }, []);

  const groupSalesDataByDate = (salesDataToGroup) => {
    // Group sales data by Year -> Month
    const grouped = salesDataToGroup.reduce((acc, sale) => {
      const date = new Date(sale.saleDate);
      const year = date.getFullYear();
      const month = date.toLocaleString('default', { month: 'long' });

      if (!acc[year]) {
        acc[year] = {};
      }
      if (!acc[year][month]) {
        acc[year][month] = [];
      }
      acc[year][month].push(sale);
      return acc;
    }, {});
    setGroupedSalesData(grouped);
    
    // Automatically open all accordions for better UX and printing
    const allKeys = {};
    Object.keys(grouped).forEach(year => {
      allKeys[year] = true;
      Object.keys(grouped[year]).forEach(month => {
        allKeys[`${year}-${month}`] = true;
      });
    });
    setOpenAccordion(allKeys);
  };

  const applyDateFilter = () => {
    if (!startDate && !endDate) {
      // No filter applied, show all sales data
      setFilteredSalesData(allSalesData);
      setDateFilterApplied(false);
      groupSalesDataByDate(allSalesData);
      return;
    }

    const filtered = allSalesData.filter(sale => {
      const saleDate = new Date(sale.saleDate);
      const start = startDate ? new Date(startDate) : null;
      const end = endDate ? new Date(endDate) : null;
      
      // Set end date to end of day for inclusive filtering
      if (end) {
        end.setHours(23, 59, 59, 999);
      }

      if (start && end) {
        return saleDate >= start && saleDate <= end;
      } else if (start) {
        return saleDate >= start;
      } else if (end) {
        return saleDate <= end;
      }
      return true;
    });

    setFilteredSalesData(filtered);
    setDateFilterApplied(true);
    groupSalesDataByDate(filtered);
  };

  const clearDateFilter = () => {
    setStartDate('');
    setEndDate('');
    setFilteredSalesData(allSalesData);
    setDateFilterApplied(false);
    groupSalesDataByDate(allSalesData);
  };

  const calculateTotalRevenue = () => {
    return filteredSalesData.reduce((total, sale) => total + sale.totalAmount, 0);
  };

  const calculateTotalDiscount = () => {
    return filteredSalesData.reduce((total, sale) => total + (sale.discountAmount || 0), 0);
  };

  const toggleAccordion = (key) => {
    setOpenAccordion(prev => ({ ...prev, [key]: !prev[key] }));
  };
  
  const handlePrint = () => {
    // Add error handling to ensure a date range is selected
    if (!startDate || !endDate) {
      alert("Please select a start and end date for the report before printing.");
      return;
    }
    setIsExportModalOpen(true);
  };
  
  const handleExportPDF = () => {
    setIsExportModalOpen(false);
    
    const printWindow = window.open('', '_blank');
    
    const totalRevenue = calculateTotalRevenue();

    // Helper to generate table rows for a given month's sales
    const generateTableRows = (sales) => {
      return sales.map(sale => `
        <tr>
          <td>${new Date(sale.saleDate).toLocaleDateString()}</td>
          <td>${sale._id.slice(-6).toUpperCase()}</td>
          <td>${sale.customerName}</td>
          <td>${sale.saleType}</td>
          <td>₱${sale.totalAmount.toFixed(2)}</td>
          <td>₱${sale.totalAmount.toFixed(2)}</td>
          <td>₱0.00</td>
        </tr>
      `).join('');
    };

    // Helper to generate the entire table body, grouped by month
    const tableBody = Object.entries(groupedSalesData).map(([year, months]) => {
      return Object.entries(months).map(([month, sales]) => {
        const monthTotal = sales.reduce((sum, sale) => sum + sale.totalAmount, 0);
        return `
          ${generateTableRows(sales)}
          <tr class="month-total-row">
            <td colspan="4" style="text-align: right; font-weight: bold;">${month} ${year} Total</td>
            <td style="font-weight: bold;">₱${monthTotal.toFixed(2)}</td>
            <td colspan="2"></td>
          </tr>
        `;
      }).join('');
    }).join('');

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Sales Report</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; color: #333; }
            .header-container { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #333; padding-bottom: 15px; margin-bottom: 20px; }
            .company-details { flex: 1; }
            .company-details h2 { margin: 0; font-size: 24px; }
            .company-details p { margin: 2px 0; font-size: 12px; }
            .report-meta { flex: 1; text-align: right; }
            .report-meta .logo-placeholder { border: 1px solid #ccc; padding: 10px 20px; display: inline-block; margin-bottom: 10px; font-size: 14px; color: #999; }
            .report-meta p { margin: 2px 0; font-size: 12px; }
            h1 { text-align: center; font-size: 28px; margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; font-size: 12px; }
            th, td { border: 1px solid #ccc; padding: 6px; text-align: left; }
            th { background-color: #f2f2f2; font-weight: bold; }
            .month-total-row { background-color: #e8f5e9; }
            .grand-total-row { background-color: #c8e6c9; font-size: 14px; font-weight: bold; }
            .footer { margin-top: 40px; display: flex; justify-content: space-between; font-size: 14px; padding-top: 20px; border-top: 1px solid #ccc; }
            .signature-line { border-bottom: 1px solid #333; width: 200px; display: inline-block; margin-left: 10px; }
          </style>
        </head>
        <body>
          <h1>Sale Report</h1>
          <div class="header-container">
            <div class="company-details">
              <h2>Flowers by Edmar</h2>
              <p>H31 New Public Market Antipolo City</p>
              <p>Antipolo City, Rizal</p>
              <p>Email: admin@bloomtrack.com </p>
            </div>
            <div class="report-meta">
              <p><strong>Date Range:</strong></p>
              <p>From: ${startDate ? new Date(startDate).toLocaleDateString() : 'Start'}</p>
              <p>To: ${endDate ? new Date(endDate).toLocaleDateString() : 'End'}</p>
              <p style="margin-top: 10px;">Generated Report on: ${new Date().toLocaleDateString()}</p>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Invoice #</th>
                <th>Customer Name</th>
                <th>Type</th>
                <th>Total</th>
                <th>Paid</th>
                <th>Balance Due</th>
              </tr>
            </thead>
            <tbody>
              ${tableBody}
              <tr class="grand-total-row">
                <td colspan="5" style="text-align: right;">Grand Total</td>
                <td>₱${totalRevenue.toFixed(2)}</td>
                <td colspan="2"></td>
              </tr>
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
    `);
    
    printWindow.document.close();
  };
  
  const handleExportExcel = () => {
    setIsExportModalOpen(false);
    
    // Prepare data for Excel export
    const excelData = [];
    
    // Add header information
    excelData.push(['Sale Report']);
    excelData.push(['']);
    excelData.push(['Company:', 'Flowers by Edmar']);
    excelData.push(['Address:', 'H31 New Public Market Antipolo City']);
    excelData.push(['City:', 'Antipolo City, Rizal']);
    excelData.push(['Email:', 'admin@bloomtrack.com']);
    excelData.push(['']);
    excelData.push(['Date Range:']);
    excelData.push(['From:', startDate ? new Date(startDate).toLocaleDateString() : 'Start']);
    excelData.push(['To:', endDate ? new Date(endDate).toLocaleDateString() : 'End']);
    excelData.push(['Generated Report on:', new Date().toLocaleDateString()]);
    excelData.push(['']); // Empty row
    
    // Add table headers
    excelData.push(['Date', 'Invoice #', 'Customer Name', 'Type', 'Total', 'Paid', 'Balance Due']);
    
    // Add data grouped by year and month (same as PDF)
    Object.entries(groupedSalesData).forEach(([year, months]) => {
      Object.entries(months).forEach(([month, sales]) => {
        // Add sales data for this month
        sales.forEach(sale => {
          excelData.push([
            new Date(sale.saleDate).toLocaleDateString(),
            sale._id.slice(-6).toUpperCase(),
            sale.customerName,
            sale.saleType,
            `₱${sale.totalAmount.toFixed(2)}`,
            `₱${sale.totalAmount.toFixed(2)}`,
            '₱0.00'
          ]);
        });
        
        // Add month total row
        const monthTotal = sales.reduce((sum, sale) => sum + sale.totalAmount, 0);
        excelData.push(['', '', '', `${month} ${year} Total`, `₱${monthTotal.toFixed(2)}`, '', '']);
      });
    });
    
    // Add grand total row
    const totalRevenue = calculateTotalRevenue();
    excelData.push(['', '', '', '', 'Grand Total', `₱${totalRevenue.toFixed(2)}`, '']);
    
    // Create workbook and worksheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(excelData);
    
    // Set column widths for better formatting
    const colWidths = [
      { wch: 12 }, // Date
      { wch: 15 }, // Invoice #
      { wch: 20 }, // Customer Name
      { wch: 15 }, // Type
      { wch: 12 }, // Total
      { wch: 12 }, // Paid
      { wch: 12 }  // Balance Due
    ];
    ws['!cols'] = colWidths;
    
    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Sales Report');
    
    // Generate filename with current date
    const filename = `Sales_Report_${new Date().toISOString().split('T')[0]}.xlsx`;
    
    // Save the file
    XLSX.writeFile(wb, filename);
  };

  return (
    <div className="sales-report-page">
      <header className="report-header">
        <button className="back-arrow" onClick={() => navigate(-1)}>‹</button>
        <h1>Sales Report</h1>
        <button className="print-button" onClick={handlePrint}>Print Report</button>
      </header>

      <main className="report-content">
        {loading && <p>Loading report...</p>}
        {error && <p className="error-message">{error}</p>}
        
        {/* Date Filter Section */}
        <div className="date-filter-section">
          <h3>Filter by Date Range</h3>
          <div className="date-inputs">
            <div className="date-input-group">
              <label htmlFor="start-date">From:</label>
              <input
                id="start-date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="date-input-group">
              <label htmlFor="end-date">To:</label>
              <input
                id="end-date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            <div className="filter-buttons">
              <button className="apply-filter-btn" onClick={applyDateFilter}>
                Apply Filter
              </button>
              <button className="clear-filter-btn" onClick={clearDateFilter}>
                Clear Filter
              </button>
            </div>
          </div>
          
          {/* Summary Statistics */}
          <div className="report-summary">
            <div className="summary-item">
              <span className="summary-label">Total Sales:</span>
              <span className="summary-value">{filteredSalesData.length}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Total Revenue:</span>
              <span className="summary-value">₱{calculateTotalRevenue().toFixed(2)}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Total Discounts:</span>
              <span className="summary-value">₱{calculateTotalDiscount().toFixed(2)}</span>
            </div>
            {dateFilterApplied && (
              <div className="summary-item filter-status">
                <span className="summary-label">Filtered Period:</span>
                <span className="summary-value">
                  {startDate ? new Date(startDate).toLocaleDateString() : 'Beginning'} - {endDate ? new Date(endDate).toLocaleDateString() : 'Present'}
                </span>
              </div>
            )}
          </div>
        </div>
        
        <div className="accordion-container" id="printable-report">
          {Object.entries(groupedSalesData).map(([year, months]) => (
            <div key={year} className="accordion-item year-item">
              <div className="accordion-header" onClick={() => toggleAccordion(year)}>
                <h2>{year}</h2>
                <span className="accordion-icon">{openAccordion[year] ? '-' : '+'}</span>
              </div>
              {openAccordion[year] && (
                <div className="accordion-content">
                  {Object.entries(months).map(([month, sales]) => (
                    <div key={month} className="accordion-item month-item">
                      <div className="accordion-header" onClick={() => toggleAccordion(`${year}-${month}`)}>
                        <h3>{month}</h3>
                        <span className="accordion-icon">{openAccordion[`${year}-${month}`] ? '-' : '+'}</span>
                      </div>
                      {openAccordion[`${year}-${month}`] && (
                        <div className="accordion-content">
                          <table className="sales-table">
                            <thead>
                              <tr>
                                <th>Date</th>
                                <th>ID</th>
                                <th>Type</th>
                                <th>Customer</th>
                                <th>Amount</th>
                                <th>Discount</th>
                              </tr>
                            </thead>
                            <tbody>
                              {sales.map(sale => (
                                <tr key={sale._id}>
                                  <td>{new Date(sale.saleDate).toLocaleDateString()}</td>
                                  <td>{sale._id.slice(-8).toUpperCase()}</td>
                                  <td>
                                    {sale.saleType}
                                    {sale.eventType && ` (${sale.eventType})`}
                                  </td>
                                  <td>{sale.customerName}</td>
                                  <td>₱{sale.totalAmount.toFixed(2)}</td>
                                  <td>₱{(sale.discountAmount || 0).toFixed(2)}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="sales-report-footer">
          <div className="footer-summary-item">
            <span className="footer-summary-label">
              {dateFilterApplied
                ? `Total Sales for ${startDate ? new Date(startDate).toLocaleDateString() : 'Beginning'} to ${endDate ? new Date(endDate).toLocaleDateString() : 'Present'}:`
                : 'Total Sales for All Dates:'}
            </span>
            <span className="footer-summary-value">₱{calculateTotalRevenue().toFixed(2)}</span>
          </div>
        </div>

        {/* Export Modal */}
        {isExportModalOpen && (
          <div className="export-modal-overlay">
            <div className="export-modal">
              <h3>Export Report</h3>
              <p>Choose your preferred export format:</p>
              <div className="export-options">
                <button className="export-option-btn pdf" onClick={handleExportPDF}>
                  <span className="export-icon">📄</span>
                  Export as PDF
                </button>
                <button className="export-option-btn excel" onClick={handleExportExcel}>
                  <span className="export-icon">📊</span>
                  Export as Excel
                </button>
              </div>
              <button className="cancel-export-btn" onClick={() => setIsExportModalOpen(false)}>
                Cancel
              </button>
            </div>
          </div>
        )}

      </main>
    </div>
  );
};

export default SalesReport;
