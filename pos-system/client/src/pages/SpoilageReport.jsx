import axios from 'axios';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import './SpoilageReport.css'; // We'll create this CSS file

const SpoilageReport = () => {
  const navigate = useNavigate();
  const [spoiledProducts, setSpoiledProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [processMessage, setProcessMessage] = useState('');
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

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
    const today = new Date().toISOString().split('T')[0]; // Get date in YYYY-MM-DD format
    const lastProcessedDate = localStorage.getItem('lastSpoilageProcessDate');

    if (lastProcessedDate === today) {
        setProcessMessage(`Already processed spoilage for today (${new Date().toLocaleDateString()}).`);
        return;
    }

    if (!window.confirm("Are you sure you want to process spoilage? This will remove expired items from your main inventory.")) {
        return;
    }
    try {
        setProcessMessage('Processing...');
        const response = await axios.post('/api/spoilage/process');
        
        // On success, record the date
        localStorage.setItem('lastSpoilageProcessDate', today);

        // Extract the number of processed items from the message
        const match = response.data.message.match(/\d+/);
        const processedCount = match ? parseInt(match[0], 10) : 0;

        if (processedCount > 0) {
            setProcessMessage(`Success! Moved ${processedCount} newly expired item(s) to the spoilage list.`);
        } else {
            setProcessMessage('Processing complete. No new expired items were found in the inventory.');
        }

        // Refresh the report to show any newly spoiled items
        fetchSpoilageReport();
    } catch (err) {
        setProcessMessage('Failed to process spoilage. Please check server logs.');
        console.error(err);
    }
  };

  const handlePrint = () => {
    setIsExportModalOpen(true);
  };
  
  const handleExportPDF = () => {
    setIsExportModalOpen(false);
    
    // Create a new window for printing without dialog
    const printWindow = window.open('', '_blank');
    
    const totalQuantitySpoiled = spoiledProducts.reduce((total, item) => total + item.quantitySpoiled, 0);
    
    // Generate spoiled products table rows
    const spoiledProductRows = spoiledProducts.length > 0 
      ? spoiledProducts.map(product => `
          <tr>
            <td>${product.productName}</td>
            <td>${product.productCategory}</td>
            <td>${product.quantitySpoiled}</td>
            <td>${product.supplierName}</td>
            <td>${new Date(product.dateReceived).toLocaleDateString()}</td>
            <td>${new Date(product.dateSpoiled).toLocaleDateString()}</td>
          </tr>
        `).join('')
      : '<tr><td colspan="6" style="text-align: center; font-style: italic; padding: 2rem;">No spoiled products recorded yet.</td></tr>';
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Spoilage Report</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
            .header-container {
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
              margin-bottom: 30px;
              padding-bottom: 15px;
              border-bottom: 2px solid #333;
            }
            .company-info {
              flex: 1;
              text-align: left;
            }
            .company-name { font-size: 16px; font-weight: bold; margin: 0; }
            .company-address { font-size: 12px; margin: 2px 0; }
            .company-email { font-size: 12px; margin: 2px 0; }
            .report-title {
              flex: 1;
              text-align: center;
            }
            .report-title h1 { font-size: 24px; margin: 0; }
            .date-info {
              flex: 1;
              text-align: right;
              font-size: 12px;
            }
            .date-info div { margin: 2px 0; }
            .summary-section {
              margin: 20px 0;
              padding: 15px;
              background-color: #f9f9f9;
              border: 1px solid #ddd;
            }
            .summary-title { font-size: 16px; font-weight: bold; margin-bottom: 10px; }
            .summary-item { margin: 5px 0; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; font-weight: bold; }
            h3 { margin: 30px 0 15px 0; font-size: 18px; }
          </style>
        </head>
        <body>
          <div class="header-container">
            <div class="company-info">
              <p class="company-name">Flowers by Edmar</p>
              <p class="company-address">H31 New Public Market Antipolo City</p>
              <p class="company-address">Antipolo City, Rizal</p>
              <p class="company-email">Email: admin@bloomtrack.com</p>
            </div>
            <div class="report-title">
              <h1>Spoilage Report</h1>
            </div>
            <div class="date-info">
              <div><strong>Date Range:</strong></div>
              <div>From: Beginning</div>
              <div>To: Present</div>
              <div><strong>Generated Report on:</strong> ${new Date().toLocaleDateString()}</div>
            </div>
          </div>
          
          <div class="summary-section">
            <div class="summary-title">SUMMARY</div>
            <div class="summary-item"><strong>Total Spoiled Items:</strong> ${spoiledProducts.length}</div>
            <div class="summary-item"><strong>Total Quantity Spoiled:</strong> ${totalQuantitySpoiled} units</div>
            <div class="summary-item"><strong>Report Generated:</strong> ${new Date().toLocaleDateString()}</div>
          </div>
          
          <h3>SPOILED PRODUCT HISTORY</h3>
          <table>
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
              ${spoiledProductRows}
            </tbody>
          </table>

          <script>
            window.onload = function() {
              window.print();
              window.onafterprint = function() {
                window.close();
              };
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
    excelData.push(['BloomTrack - Spoilage Report']);
    excelData.push(['Generated on:', new Date().toLocaleDateString()]);
    excelData.push([]); // Empty row
    
    // Add summary information
    excelData.push(['SUMMARY']);
    excelData.push(['Total Spoiled Items:', spoiledProducts.length]);
    excelData.push(['Total Quantity Spoiled:', `${spoiledProducts.reduce((total, item) => total + item.quantitySpoiled, 0)} units`]);
    excelData.push(['Report Generated:', new Date().toLocaleDateString()]);
    excelData.push([]); // Empty row
    
    // Add spoiled products section
    if (spoiledProducts.length > 0) {
      excelData.push(['SPOILED PRODUCT HISTORY']);
      excelData.push(['Product Name', 'Category', 'Qty. Spoiled', 'Supplier', 'Date Received', 'Date Spoiled']);
      
      spoiledProducts.forEach(product => {
        excelData.push([
          product.productName,
          product.productCategory,
          product.quantitySpoiled,
          product.supplierName,
          new Date(product.dateReceived).toLocaleDateString(),
          new Date(product.dateSpoiled).toLocaleDateString()
        ]);
      });
    } else {
      excelData.push(['SPOILED PRODUCT HISTORY']);
      excelData.push(['No spoiled products recorded yet.']);
    }
    
    // Create workbook and worksheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(excelData);
    
    // Set column widths for better formatting
    const colWidths = [
      { wch: 25 }, // Product Name
      { wch: 15 }, // Category
      { wch: 12 }, // Qty. Spoiled
      { wch: 20 }, // Supplier
      { wch: 15 }, // Date Received
      { wch: 15 }  // Date Spoiled
    ];
    ws['!cols'] = colWidths;
    
    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Spoilage Report');
    
    // Generate filename with current date
    const filename = `BloomTrack_Spoilage_Report_${new Date().toISOString().split('T')[0]}.xlsx`;
    
    // Save the file
    XLSX.writeFile(wb, filename);
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

        {loading && <p className="no-print">Loading report...</p>}
        {error && <p className="error-message no-print">{error}</p>}
        
        {/* Summary Section */}
        <div className="report-summary">
            <div className="summary-item">
                <span className="summary-label">Total Spoiled Items:</span>
                <span className="summary-value">{spoiledProducts.length}</span>
            </div>
            <div className="summary-item">
                <span className="summary-label">Total Quantity Spoiled:</span>
                <span className="summary-value">
                    {spoiledProducts.reduce((total, item) => total + item.quantitySpoiled, 0)} units
                </span>
            </div>
            <div className="summary-item">
                <span className="summary-label">Report Generated:</span>
                <span className="summary-value">{new Date().toLocaleDateString()}</span>
            </div>
        </div>
        
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
                        {spoiledProducts.length > 0 ? (
                            spoiledProducts.map(p => (
                                <tr key={p._id}>
                                    <td>{p.productName}</td>
                                    <td>{p.productCategory}</td>
                                    <td>{p.quantitySpoiled}</td>
                                    <td>{p.supplierName}</td>
                                    <td>{new Date(p.dateReceived).toLocaleDateString()}</td>
                                    <td>{new Date(p.dateSpoiled).toLocaleDateString()}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="6" style={{ textAlign: 'center', fontStyle: 'italic', padding: '2rem' }}>
                                    No spoiled products recorded yet.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
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

export default SpoilageReport;
