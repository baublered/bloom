import axios from 'axios';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './SalesReport.css'; // We'll create this new CSS file

const SalesReport = () => {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);
  const [groupedTransactions, setGroupedTransactions] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openAccordion, setOpenAccordion] = useState({}); // To track open year/month

  useEffect(() => {
    const fetchAndGroupTransactions = async () => {
      try {
        const response = await axios.get('/api/transactions');
        const sortedTransactions = response.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setTransactions(sortedTransactions);

        // Group transactions by Year -> Month
        const grouped = sortedTransactions.reduce((acc, tx) => {
          const date = new Date(tx.createdAt);
          const year = date.getFullYear();
          const month = date.toLocaleString('default', { month: 'long' });

          if (!acc[year]) {
            acc[year] = {};
          }
          if (!acc[year][month]) {
            acc[year][month] = [];
          }
          acc[year][month].push(tx);
          return acc;
        }, {});
        setGroupedTransactions(grouped);

      } catch (err) {
        setError('Failed to load sales data.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAndGroupTransactions();
  }, []);

  const toggleAccordion = (key) => {
    setOpenAccordion(prev => ({ ...prev, [key]: !prev[key] }));
  };
  
  const handlePrint = () => {
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
        
        <div className="accordion-container" id="printable-report">
          {Object.entries(groupedTransactions).map(([year, months]) => (
            <div key={year} className="accordion-item year-item">
              <div className="accordion-header" onClick={() => toggleAccordion(year)}>
                <h2>{year}</h2>
                <span className="accordion-icon">{openAccordion[year] ? '-' : '+'}</span>
              </div>
              {openAccordion[year] && (
                <div className="accordion-content">
                  {Object.entries(months).map(([month, txs]) => (
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
                                <th>Transaction ID</th>
                                <th>Type</th>
                                <th>Customer</th>
                                <th>Amount</th>
                              </tr>
                            </thead>
                            <tbody>
                              {txs.map(tx => (
                                <tr key={tx._id}>
                                  <td>{new Date(tx.createdAt).toLocaleDateString()}</td>
                                  <td>{tx._id.slice(-8).toUpperCase()}</td>
                                  <td>{tx.transactionType}</td>
                                  <td>{tx.eventDetails?.customerName || 'Retail Sale'}</td>
                                  <td>₱{tx.totalAmount.toFixed(2)}</td>
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
      </main>
    </div>
  );
};

export default SalesReport;
