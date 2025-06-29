import axios from 'axios';
import { useEffect, useState } from 'react';
import './Inventory.css';

const Inventory = () => {
  const [products, setProducts] = useState([]); 
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get('/api/products');
        setProducts(res.data);
        setFilteredProducts(res.data);
      } catch (err) {
        console.error('API Error:', err);
        setError('Failed to load products. Please ensure the backend server is running.');
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  useEffect(() => {
    const results = products.filter(product =>
      product.productName.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredProducts(results);
  }, [searchTerm, products]);

  // --- NEW: Function to calculate remaining lifespan ---
  const calculateRemainingLifespan = (dateReceived, lifespanInDays) => {
    if (!dateReceived || !lifespanInDays) {
      return 'N/A';
    }
    const receivedDate = new Date(dateReceived);
    const expirationDate = new Date(receivedDate.setDate(receivedDate.getDate() + lifespanInDays));
    const today = new Date();
    
    // Calculate the difference in time (in milliseconds)
    const timeDiff = expirationDate.getTime() - today.getTime();
    
    // Convert the time difference to days
    const daysRemaining = Math.ceil(timeDiff / (1000 * 3600 * 24));

    if (daysRemaining < 0) {
      return 'Expired';
    }
    return `${daysRemaining} days`;
  };


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
          <input 
            type="text" 
            placeholder="Search by product name..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="table-wrapper">
          <table className="inventory-table">
            <thead>
              <tr>
                <th>Product ID</th>
                <th>Product Name</th>
                <th>Category</th>
                <th>Qty</th>
                <th>Price</th>
                <th>Supplier Name</th>
                <th>Date Received</th>
                {/* --- UPDATED: Column header --- */}
                <th>Remaining Lifespan</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((p) => (
                <tr key={p._id}>
                  <td>{p._id.slice(-6).toUpperCase()}</td>
                  <td>{p.productName}</td>
                  <td>{p.productCategory}</td>
                  <td>{p.quantity}</td>
                  <td>₱{(p.price || 0).toFixed(2)}</td>
                  <td>{p.supplierName}</td>
                  <td>{new Date(p.dateReceived).toLocaleDateString()}</td>
                  {/* --- UPDATED: Displaying calculated remaining lifespan --- */}
                  <td>{calculateRemainingLifespan(p.dateReceived, p.lifespanInDays)}</td>
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
