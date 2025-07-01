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
    
    // Create a new window for printing without dialog
    const printWindow = window.open('', '_blank');
    
    // Get only the report content, excluding filter controls and buttons
    const reportSummary = document.querySelector('.report-summary').outerHTML;
    const lowStockSection = document.querySelector('.report-section').outerHTML;
    const fullInventorySection = document.querySelectorAll('.report-section')[1].outerHTML;
    
    const periodText = dateFilterApplied 
      ? `Period: ${startDate ? new Date(startDate).toLocaleDateString() : 'Beginning'} - ${endDate ? new Date(endDate).toLocaleDateString() : 'Present'}`
      : 'Period: All Dates';
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Inventory Report</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
            .report-summary { margin-bottom: 20px; }
            .summary-item { margin: 5px 0; }
            .low-stock-row { background-color: #fff3cd; }
            .section-title { margin-top: 30px; margin-bottom: 10px; }
            .section-subtitle { margin-bottom: 15px; color: #666; }
            .print-header { 
              text-align: center; 
              margin-bottom: 30px; 
              border-bottom: 2px solid #333; 
              padding-bottom: 15px; 
            }
            .print-period { 
              font-size: 14px; 
              color: #666; 
              margin: 10px 0; 
            }
            .print-summary { 
              font-size: 14px; 
              color: #333; 
              margin: 10px 0; 
            }
          </style>
        </head>
        <body>
          <div class="print-header">
            <h1>Inventory Report</h1>
            <p class="print-period">${periodText}</p>
            <p class="print-summary">Total Products: ${totalProducts} | Products In Stock: ${productsInStock} | Low Stock Items: ${lowStockProducts.length}</p>
          </div>
          ${reportSummary}
          ${lowStockSection}
          ${fullInventorySection}
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
