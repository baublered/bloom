import axios from 'axios';
import { useEffect, useState } from 'react';
import './Inventory.css'; // Make sure you have this CSS file

const Inventory = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        // Using the proxy instead of the full URL
        const res = await axios.get('/api/products'); 
        setProducts(res.data);
      } catch (err) {
        console.error('API Error:', err);
        setError('Failed to load products. Please ensure the backend server is running.');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) return <p className="status-message">Loading inventory...</p>;
  if (error) return <p className="status-message error">{error}</p>;

  return (
    <div className="inventory-container">
      <div className="inventory-header">
        <h2>Inventory</h2>
      </div>
      <div className="inventory-content">
        <div className="search-bar">
          <span>Products</span>
          <input type="text" placeholder="Search" />
        </div>
        <div className="table-wrapper">
            <table className="inventory-table">
            <thead>
                <tr>
                <th>Product Name</th>
                <th>Category</th>
                <th>Qty</th>
                <th>Price</th>
                <th>Supplier Name</th>
                <th>Date Received</th>
                <th>Lifespan</th>
                </tr>
            </thead>
            <tbody>
                {products.map((p) => (
                <tr key={p._id}>
                    {/* UPDATED to use correct field names */}
                    <td>{p.productName}</td>
                    <td>{p.productCategory}</td>
                    <td>{p.quantity}</td>
                    <td>₱{p.price.toFixed(2)}</td>
                    <td>{p.supplierName}</td>
                    <td>{new Date(p.dateReceived).toLocaleDateString()}</td>
                    <td>{p.lifespan || 'N/A'}</td>
                </tr>
                ))}
            </tbody>
            </table>
        </div>
      </div>
    </div>
  );
};

export default Inventory;
