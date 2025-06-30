import axios from 'axios';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
    // Add some debug content to test if print is working
    console.log('Print button clicked');
    console.log('Grouped sales data:', groupedSalesData);
    console.log('Filtered sales data:', filteredSalesData.length);
    window.print();
  }

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

      </main>
    </div>
  );
};

export default SalesReport;
