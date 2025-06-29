import axios from 'axios';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './InventoryReport.css'; // We'll create this CSS file

const InventoryReport = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const LOW_STOCK_THRESHOLD = 10; // Define what you consider "low stock"

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get('/api/products');
        setProducts(response.data);
      } catch (err) {
        setError('Failed to load inventory data.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const lowStockProducts = products.filter(p => p.quantity <= LOW_STOCK_THRESHOLD);

  const handlePrint = () => {
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
            <h2 className="section-title">Full Inventory List ({products.length})</h2>
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
                        {products.map(p => (
                            <tr key={p._id}>
                                <td>{p.productName}</td>
                                <td>{p.productCategory}</td>
                                <td>{p.quantity}</td>
                                <td>₱{p.price.toFixed(2)}</td>
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
