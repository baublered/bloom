import axios from 'axios';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import './InventoryReport.css'; // We'll create this CSS file

const InventoryReport = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [dateFilterApplied, setDateFilterApplied] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  const LOW_STOCK_THRESHOLD = 10; // Define what you consider "low stock"

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get('/api/products');
        setProducts(response.data);
        setFilteredProducts(response.data); // Initially, show all products
      } catch (err) {
        setError('Failed to load inventory data.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const applyDateFilter = () => {
    const filtered = products.filter(p => {
        const productDate = new Date(p.createdAt);
        const start = startDate ? new Date(startDate) : null;
        const end = endDate ? new Date(endDate) : null;

        if (end) {
            end.setHours(23, 59, 59, 999); // Include the entire end day
        }

        if (start && end) {
            return productDate >= start && productDate <= end;
        } else if (start) {
            return productDate >= start;
        } else if (end) {
            return productDate <= end;
        }
        return true;
    });
    setFilteredProducts(filtered);
    setDateFilterApplied(true);
  };

  const clearDateFilter = () => {
    setStartDate('');
    setEndDate('');
    setFilteredProducts(products);
    setDateFilterApplied(false);
  };

  const lowStockProducts = filteredProducts.filter(p => p.quantity <= LOW_STOCK_THRESHOLD);
  const totalProducts = filteredProducts.length;
  const productsInStock = filteredProducts.filter(p => p.quantity > 0).length;

  const handlePrint = () => {
    if (!startDate || !endDate) {
      alert('Please select a start and end date to print the report.');
      return;
    }
    setIsExportModalOpen(true);
  };
  
  const handleExportPDF = () => {
    setIsExportModalOpen(false);
    
    const printWindow = window.open('', '_blank');
    
    const dateRangeText = `From: ${startDate ? new Date(startDate).toLocaleDateString() : 'Beginning'}\nTo: ${endDate ? new Date(endDate).toLocaleDateString() : 'Present'}`;
    
    // Generate Low Stock Items table rows
    const lowStockTableRows = lowStockProducts.map(product => `
      <tr class="low-stock-row">
        <td>${product.productName}</td>
        <td>${product.productCategory}</td>
        <td>${product.quantity}</td>
      </tr>
    `).join('');
    
    // Generate Full Inventory table rows
    const fullInventoryTableRows = filteredProducts.map(product => `
      <tr>
        <td>${product.productName}</td>
        <td>${product.productCategory}</td>
        <td>${product.quantity}</td>
        <td>₱${(product.price || 0).toFixed(2)}</td>
        <td>${product.supplierName || 'N/A'}</td>
      </tr>
    `).join('');

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Inventory Report</title>
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
            .low-stock-row { background-color: #fff3cd; }
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
              <h1>Inventory Report</h1>
            </div>
            <div class="date-info">
              <div><strong>Date Range:</strong></div>
              <div style="white-space: pre-line;">${dateRangeText}</div>
              <div><strong>Generated Report on:</strong> ${new Date().toLocaleDateString()}</div>
            </div>
          </div>
          
          <div class="summary-section">
            <div class="summary-title">SUMMARY</div>
            <div class="summary-item"><strong>Total Unique Products:</strong> ${totalProducts}</div>
            <div class="summary-item"><strong>Products In Stock:</strong> ${productsInStock}</div>
            <div class="summary-item"><strong>Low Stock Items:</strong> ${lowStockProducts.length}</div>
          </div>
          
          <h3>LOW STOCK ITEMS (10 or less)</h3>
          <table>
            <thead>
              <tr>
                <th>Product Name</th>
                <th>Category</th>
                <th>Current Quantity</th>
              </tr>
            </thead>
            <tbody>
              ${lowStockTableRows}
            </tbody>
          </table>

          <h3>FULL INVENTORY LIST</h3>
          <table>
            <thead>
              <tr>
                <th>Product Name</th>
                <th>Category</th>
                <th>Quantity</th>
                <th>Price</th>
                <th>Supplier</th>
              </tr>
            </thead>
            <tbody>
              ${fullInventoryTableRows}
            </tbody>
          </table>

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
    excelData.push(['BloomTrack - Inventory Report']);
    excelData.push(['Generated on:', new Date().toLocaleDateString()]);
    excelData.push(['Period:', dateFilterApplied 
      ? `${startDate ? new Date(startDate).toLocaleDateString() : 'Beginning'} to ${endDate ? new Date(endDate).toLocaleDateString() : 'Present'}`
      : 'All Dates'
    ]);
    excelData.push([]); // Empty row
    
    // Add summary information
    excelData.push(['SUMMARY']);
    excelData.push(['Total Unique Products:', totalProducts]);
    excelData.push(['Products In Stock:', productsInStock]);
    excelData.push(['Low Stock Items:', lowStockProducts.length]);
    excelData.push([]); // Empty row
    
    // Add Low Stock Items section
    if (lowStockProducts.length > 0) {
      excelData.push(['LOW STOCK ITEMS (10 or less)']);
      excelData.push(['Product Name', 'Category', 'Current Quantity']);
      
      lowStockProducts.forEach(product => {
        excelData.push([
          product.productName,
          product.productCategory,
          product.quantity
        ]);
      });
      
      excelData.push([]); // Empty row
    }
    
    // Add Full Inventory List section
    excelData.push(['FULL INVENTORY LIST']);
    excelData.push(['Product Name', 'Category', 'Quantity', 'Price', 'Supplier']);
    
    // Add all filtered products
    filteredProducts.forEach(product => {
      excelData.push([
        product.productName,
        product.productCategory,
        product.quantity,
        product.price || 0,
        product.supplierName || 'N/A'
      ]);
    });
    
    // Create workbook and worksheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(excelData);
    
    // Set column widths for better formatting
    const colWidths = [
      { wch: 25 }, // Product Name
      { wch: 15 }, // Category
      { wch: 12 }, // Quantity
      { wch: 12 }, // Price
      { wch: 20 }  // Supplier
    ];
    ws['!cols'] = colWidths;
    
    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Inventory Report');
    
    // Generate filename with current date
    const filename = `BloomTrack_Inventory_Report_${new Date().toISOString().split('T')[0]}.xlsx`;
    
    // Save the file
    XLSX.writeFile(wb, filename);
  };

  return (
    <div className="inventory-report-page">
      <header className="report-header">
        <button className="back-arrow" onClick={() => navigate(-1)}>‹</button>
        <h1>Inventory Report</h1>
        <button className="print-button" onClick={handlePrint}>Print Report</button>
      </header>

      <main className="report-content" id="printable-inventory-report">
        {loading && <p>Loading report...</p>}
        {error && <p className="error-message">{error}</p>}

        {/* Date Filter Section */}
        <div className="date-filter-section no-print">
            <div className="date-inputs">
                <div className="date-input-group">
                    <label htmlFor="start-date">From:</label>
                    <input id="start-date" type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
                </div>
                <div className="date-input-group">
                    <label htmlFor="end-date">To:</label>
                    <input id="end-date" type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
                </div>
                <div className="filter-buttons">
                    <button className="apply-filter-btn" onClick={applyDateFilter}>Apply</button>
                    <button className="clear-filter-btn" onClick={clearDateFilter}>Clear</button>
                </div>
            </div>
            {dateFilterApplied && (
                <div className="filter-status">
                    <span className="summary-label">Filtered Period:</span>
                    <span className="summary-value">
                        {startDate ? new Date(startDate).toLocaleDateString() : 'Beginning'} - {endDate ? new Date(endDate).toLocaleDateString() : 'Present'}
                    </span>
                </div>
            )}
        </div>
        
        {/* Summary Section */}
        <div className="report-summary">
            <div className="summary-item">
                <span className="summary-label">Total Unique Products</span>
                <span className="summary-value">{totalProducts}</span>
            </div>
            <div className="summary-item">
                <span className="summary-label">Products In Stock</span>
                <span className="summary-value">{productsInStock}</span>
            </div>
            <div className="summary-item">
                <span className="summary-label">Low Stock Items</span>
                <span className="summary-value">{lowStockProducts.length}</span>
            </div>
        </div>

        {/* Low Stock Items Section */}
        <div className="report-section">
            <h2 className="section-title">Low Stock Items ({lowStockProducts.length})</h2>
            <p className="section-subtitle">Products with quantity of {LOW_STOCK_THRESHOLD} or less.</p>
            <div className="table-wrapper">
                <table className="report-table">
                    <thead>
                        <tr>
                            <th>Product Name</th>
                            <th>Category</th>
                            <th>Current Quantity</th>
                        </tr>
                    </thead>
                    <tbody>
                        {lowStockProducts.map(p => (
                            <tr key={p._id} className="low-stock-row">
                                <td>{p.productName}</td>
                                <td>{p.productCategory}</td>
                                <td>{p.quantity}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>

        {/* Full Inventory List Section */}
        <div className="report-section">
            <h2 className="section-title">Full Inventory List ({totalProducts})</h2>
            <div className="table-wrapper">
                <table className="report-table">
                    <thead>
                        <tr>
                            <th>Product Name</th>
                            <th>Category</th>
                            <th>Quantity</th>
                            <th>Price</th>
                            <th>Supplier</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredProducts.map(p => (
                            <tr key={p._id}>
                                <td>{p.productName}</td>
                                <td>{p.productCategory}</td>
                                <td>{p.quantity}</td>
                                <td>{p.price ? `₱${p.price.toFixed(2)}` : 'N/A'}</td>
                                <td>{p.supplierName}</td>
                            </tr>
                        ))}
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

export default InventoryReport;
