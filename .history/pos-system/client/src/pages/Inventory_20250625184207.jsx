import axios from 'axios';
import { useEffect, useState } from 'react';
import './Inventory.css';

const Inventory = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  const [notifications, setNotifications] = useState([]);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  const LOW_STOCK_THRESHOLD = 10;

  useEffect(() => {
    const fetchAndProcessData = async () => {
      try {
        const res = await axios.get('/api/products');
        const fetchedProducts = res.data;
        setProducts(fetchedProducts);
        setFilteredProducts(fetchedProducts);

        const newNotifications = [];
        const lowStockItems = fetchedProducts.filter(p => p.quantity <= LOW_STOCK_THRESHOLD);
        lowStockItems.forEach(item => {
          newNotifications.push({
            id: `low-${item._id}`,
            type: 'alert',
            title: 'Low Stock Alert!',
            message: ` ${product.productName.slice(-6).toUpperCase()} is running low.`,
            time: 'now'
          });
        });

        const getCurrentMonth = () => new Date().getMonth();
        const month = getCurrentMonth();
        let seasonalFlower = '';
        if (month >= 2 && month <= 4) {
          seasonalFlower = 'Sunflower';
        } else if (month >= 8 && month <= 10) {
          seasonalFlower = 'Tulips';
        }

        if (seasonalFlower) {
            newNotifications.push({
                id: 'seasonal-flower',
                type: 'recommendation',
                title: `${seasonalFlower} are in Season!`,
                message: `It's that time of year! ${seasonalFlower} are blooming beautifully...`,
                time: 'now'
            });
        }
        
        setNotifications(newNotifications);

      } catch (err) {
        console.error('API Error:', err);
        setError('Failed to load products. Please ensure the backend server is running.');
      } finally {
        setLoading(false);
      }
    };
    fetchAndProcessData();
  }, []);

  useEffect(() => {
    const results = products.filter(product =>
      product.productName.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredProducts(results);
  }, [searchTerm, products]);
  
  const calculateRemainingLifespan = (dateReceived, lifespanInDays) => {
    if (!dateReceived || !lifespanInDays) return 'N/A';
    const expirationDate = new Date(dateReceived);
    expirationDate.setDate(expirationDate.getDate() + lifespanInDays);
    const timeDiff = expirationDate.getTime() - new Date().getTime();
    const daysRemaining = Math.ceil(timeDiff / (1000 * 3600 * 24));
    return daysRemaining < 0 ? 'Expired' : `${daysRemaining} days`;
  };

  if (loading) return <p className="status-message">Loading inventory...</p>;
  if (error) return <p className="status-message error">{error}</p>;

  return (
    <div className="inventory-container">
      <div className="inventory-header">
        <h2>Inventory</h2>
        <div className="notification-bell-container">
            <button className="notification-bell" onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}>
                🔔
                {notifications.length > 0 && <span className="notification-badge">{notifications.length}</span>}
            </button>
            {isNotificationsOpen && (
                <div className="notification-dropdown">
                    {notifications.length > 0 ? notifications.map(notif => (
                        <div key={notif.id} className="notification-item">
                            <span className={`notification-icon ${notif.type === 'alert' ? 'alert' : 'recommend'}`}>!</span>
                            <div className="notification-text">
                                <p className="notification-title">{notif.title}</p>
                                <p className="notification-message">{notif.message}</p>
                            </div>
                            <span className="notification-time">{notif.time}</span>
                        </div>
                    )) : (
                        <p className="no-notifications">No new notifications.</p>
                    )}
                </div>
            )}
        </div>
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
                <th>Product ID</th><th>Product Name</th><th>Category</th><th>Qty</th><th>Price</th><th>Supplier Name</th><th>Date Received</th><th>Remaining Lifespan</th><th>Status</th>
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
                  <td>{calculateRemainingLifespan(p.dateReceived, p.lifespanInDays)}</td>
                  {/* --- NEW: Status Cell --- */}
                  <td>
                    <span className={`status-dot ${p.quantity > 10 ? 'good' : 'low'}`}></span>
                  </td>
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
