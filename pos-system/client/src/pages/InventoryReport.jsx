import axios from 'axios';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
    window.print();
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

        <div className="print-only-header">
            <h1>Inventory Report</h1>
            {dateFilterApplied && (
                <p className="print-date-range">
                    Period: {startDate ? new Date(startDate).toLocaleDateString() : 'Beginning'} - {endDate ? new Date(endDate).toLocaleDateString() : 'Present'}
                </p>
            )}
            <div className="print-summary">
                Total Products: {totalProducts} | Products In Stock: {productsInStock} | Low Stock Items: {lowStockProducts.length}
            </div>
        </div>

        {/* Date Filter Section */}
        <div className="date-filter-section">
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
      </main>
    </div>
  );
};

export default InventoryReport;
