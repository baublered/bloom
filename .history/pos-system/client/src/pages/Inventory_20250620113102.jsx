import axios from 'axios';
import { useEffect, useState } from 'react';
import './Inventory.css'; // Make sure you have this CSS file

const Inventory = () => {
  const [products, setProducts] = useState([]); // Stores the original, full list of products
  const [filteredProducts, setFilteredProducts] = useState([]); // Stores the products to be displayed
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState(''); // State to hold the search input

  // Fetch all products from the backend when the component loads
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get('/api/products');
        setProducts(res.data);
        setFilteredProducts(res.data); // Initially, show all products
      } catch (err) {
        console.error('API Error:', err);
        setError('Failed to load products. Please ensure the backend server is running.');
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // --- NEW: Linear Search Functionality ---
  // This effect runs whenever the user types in the search box
  useEffect(() => {
    // This is a classic linear search algorithm.
    // It iterates through every item in the 'products' array one by one.
    const results = products.filter(product =>
      // For each product, it checks if its name (in lowercase)
      // includes the search term (also in lowercase).
      product.productName.toLowerCase().includes(searchTerm.toLowerCase())
    );
    // Update the list of products to be displayed on the screen.
    setFilteredProducts(results);
  }, [searchTerm, products]); // Rerun this search whenever the search term or original product list changes

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
          {/* The input field now updates the searchTerm state on every key press */}
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
                {/* --- NEW: Added Product ID column --- */}
                <th>Product ID</th>
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
              {/* The table now maps over the 'filteredProducts' state */}
              {filteredProducts.map((p) => (
                <tr key={p._id}>
                  {/* --- NEW: Displaying the Product ID --- */}
                  {/* We display the last 6 characters of the MongoDB _id for a short, unique ID */}
                  <td>{p._id.slice(-6).toUpperCase()}</td>
                  <td>{p.productName}</td>
                  <td>{p.productCategory}</td>
                  <td>{p.quantity}</td>
                  <td>₱{(p.price || 0).toFixed(2)}</td>
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
