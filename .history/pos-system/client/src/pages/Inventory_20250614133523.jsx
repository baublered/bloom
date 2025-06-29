import axios from 'axios';
import { useEffect, useState } from 'react';
import './Inventory.css';

const Inventory = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Fetch products on mount
    const fetchProducts = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/products');
        setProducts(res.data);
      } catch (err) {
        console.error(err);
        setError('Failed to load products.');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) return <p>Loading inventory…</p>;
  if (error)   return <p style={{ color: 'red' }}>{error}</p>;

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

        <table className="inventory-table">
          <thead>
            <tr>
              <th>ID</th><th>Name</th><th>Category</th>
              <th>Qty</th><th>Price</th><th>Supplier</th>
              <th>Date Received</th><th>Lifespan</th><th>Status</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p._id}>
                <td>{p._id.slice(-6)}</td>
                <td>{p.name}</td>
                <td>{p.category}</td>
                <td>{p.quantity}</td>
                <td>{p.price}</td>
                <td>{p.supplier}</td>
                <td>{new Date(p.dateReceived || p.createdAt).toLocaleDateString()}</td>
                <td>{p.lifespan}</td>
                <td>
                  <span
                    className={`status-indicator ${
                      p.status === 'good' ? 'green' : 'red'
                    }`}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Inventory;
