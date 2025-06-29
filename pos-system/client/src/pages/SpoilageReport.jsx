import axios from 'axios';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './SpoilageReport.css'; // We'll create this CSS file

const SpoilageReport = () => {
  const navigate = useNavigate();
  const [spoiledProducts, setSpoiledProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [processMessage, setProcessMessage] = useState('');

  // Function to fetch the spoilage report data
  const fetchSpoilageReport = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/spoilage');
      setSpoiledProducts(response.data);
    } catch (err) {
      setError('Failed to load spoilage data.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch the initial report when the component loads
  useEffect(() => {
    fetchSpoilageReport();
  }, []);
  
  // Function to trigger the backend spoilage process
  const handleProcessSpoilage = async () => {
    if (!window.confirm("Are you sure you want to process spoilage? This will remove expired items from your main inventory.")) {
        return;
    }
    try {
        setProcessMessage('Processing...');
        const response = await axios.post('/api/spoilage/process');
        setProcessMessage(response.data.message);
        // Refresh the report to show any newly spoiled items
        fetchSpoilageReport();
    } catch (err) {
        setProcessMessage('Failed to process spoilage.');
        console.error(err);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="spoilage-report-page">
      <header className="report-header">
        <button className="back-arrow" onClick={() => navigate(-1)}>‹</button>
        <h1>Spoilage Report</h1>
        <button className="print-button" onClick={handlePrint}>Print Report</button>
      </header>

      <main className="report-content" id="printable-spoilage-report">
        {/* Section to manually trigger the spoilage process */}
        <div className="process-section no-print">
            <h2>Process Expired Stock</h2>
            <p>Click the button to check for items that have passed their lifespan. They will be removed from the main inventory and recorded here.</p>
            <button className="process-button" onClick={handleProcessSpoilage}>
                Check and Process Spoilage
            </button>
            {processMessage && <p className="process-message">{processMessage}</p>}
        </div>

        {loading && <p>Loading report...</p>}
        {error && <p className="error-message">{error}</p>}
        
        {/* Table of spoiled products */}
        <div className="report-section">
            <h2 className="section-title">Spoiled Product History</h2>
             <div className="table-wrapper">
                <table className="report-table">
                    <thead>
                        <tr>
                            <th>Product Name</th>
                            <th>Category</th>
                            <th>Qty. Spoiled</th>
                            <th>Supplier</th>
                            <th>Date Received</th>
                            <th>Date Spoiled</th>
                        </tr>
                    </thead>
                    <tbody>
                        {spoiledProducts.map(p => (
                            <tr key={p._id}>
                                <td>{p.productName}</td>
                                <td>{p.productCategory}</td>
                                <td>{p.quantitySpoiled}</td>
                                <td>{p.supplierName}</td>
                                <td>{new Date(p.dateReceived).toLocaleDateString()}</td>
                                <td>{new Date(p.dateSpoiled).toLocaleDateString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
      </main>
    </div>
  );
};

export default SpoilageReport;
