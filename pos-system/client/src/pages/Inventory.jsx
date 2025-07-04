import axios from 'axios';
import { useEffect, useState } from 'react';
import './Inventory.css';
import './Dashboard.css'; // Import dashboard styles for layout
import UserProfile from './UserProfile';
import Sidebar from './Sidebar'; // Add sidebar import
import EmployeeSidebar from './EmployeeSidebar';
import { useRoleBasedNavigation } from '../utils/navigation';

const Inventory = () => {
  const { isEmployeeDashboard } = useRoleBasedNavigation();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOption, setSortOption] = useState('fifo'); // Default to FIFO sorting
  const [categoryFilter, setCategoryFilter] = useState('all');
  
  const [notifications, setNotifications] = useState([]);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  useEffect(() => {
    const fetchAndProcessData = async () => {
      try {
        const res = await axios.get('/api/products');
        const fetchedProducts = res.data;
        setProducts(fetchedProducts);
        setFilteredProducts(fetchedProducts);

        const newNotifications = [];

        // 1. Generate Low Stock Alerts
        const lowStockItems = fetchedProducts.filter(p => p.quantity <= (p.minimumThreshold || 0));
        lowStockItems.forEach(item => { // The item is named 'item' here
          newNotifications.push({
            id: `low-${item._id}`,
            type: 'alert',
            title: 'Low Stock Alert!',
            // --- FIX: Use 'item.productName' instead of 'p.productName' ---
            message: `${item.productName} is running low (${item.quantity} ≤ ${item.minimumThreshold || 0}).`,
            time: 'now'
          });
        });

        // 2. Generate Seasonal Flower Recommendations for Philippines
        const getSeasonalRecommendations = () => {
          const currentMonth = new Date().getMonth(); // 0-11 (Jan-Dec)
          const recommendations = [];

          console.log('Current month:', currentMonth, 'Month name:', new Date().toLocaleString('default', { month: 'long' })); // Debug log

          // December to February
          if (currentMonth === 11 || currentMonth === 0 || currentMonth === 1) {
            recommendations.push({
              flowers: ['Poinsettia', 'Anthurium', 'Chrysanthemums'],
              reason: 'Cool season flowers that bloom beautifully during the holiday months and New Year celebrations.',
              season: 'Cool Season (Dec-Feb)'
            });
          }
          
          // March to May
          else if (currentMonth >= 2 && currentMonth <= 4) {
            recommendations.push({
              flowers: ['Sampaguita', 'Bougainvillea', 'Ilang-Ilang'],
              reason: 'Native Filipino flowers that thrive in the warm dry season and represent our cultural heritage.',
              season: 'Warm Season (Mar-May)'
            });
          }
          
          // June to August
          else if (currentMonth >= 5 && currentMonth <= 7) {
            recommendations.push({
              flowers: ['Gumamela (Hibiscus)', 'Orchids'],
              reason: 'Tropical flowers that flourish during the rainy season with high humidity and cooler temperatures.',
              season: 'Rainy Season (Jun-Aug)'
            });
          }
          
          // September to November
          else if (currentMonth >= 8 && currentMonth <= 10) {
            recommendations.push({
              flowers: ['Cosmos', 'Marigolds'],
              reason: 'Vibrant flowers that bloom during the transition from rainy to dry season, perfect for autumn arrangements.',
              season: 'Transition Season (Sep-Nov)'
            });
          }

          console.log('Generated recommendations:', recommendations); // Debug log
          return recommendations;
        };

        const seasonalRecommendations = getSeasonalRecommendations();
        
        seasonalRecommendations.forEach((recommendation, index) => {
          newNotifications.push({
            id: `seasonal-${index}`,
            type: 'recommendation',
            title: `🌺 ${recommendation.season} Flowers!`,
            message: `Recommended: ${recommendation.flowers.join(', ')}. ${recommendation.reason}`,
            time: 'now',
            season: recommendation.season
          });
        });

        // Add special holiday recommendations
        const getHolidayRecommendations = () => {
          const currentMonth = new Date().getMonth();
          const currentDate = new Date().getDate();
          const holidayRecommendations = [];

          // Valentine's Day (February 14)
          if (currentMonth === 1 && currentDate >= 1 && currentDate <= 14) {
            holidayRecommendations.push({
              holiday: 'Valentine\'s Day',
              flowers: ['Roses', 'Tulips', 'Carnations', 'Sunflowers', 'Lilies'],
              message: 'Valentine\'s Day is approaching! Stock up on romantic flowers for love celebrations.'
            });
          }

          // Mother's Day (Second Sunday of May)
          if (currentMonth === 4) {
            holidayRecommendations.push({
              holiday: 'Mother\'s Day',
              flowers: ['Carnations', 'Lilies', 'Orchids', 'Mixed Bouquets'],
              message: 'Mother\'s Day season! Prepare beautiful arrangements for loving mothers.'
            });
          }

          // All Saints' Day / Undas (November 1)
          if (currentMonth === 10 && currentDate >= 25) {
            holidayRecommendations.push({
              holiday: 'All Saints\' Day (Undas)',
              flowers: ['Chrysanthemums', 'Roses', 'Marigolds', 'Cosmos'],
              message: 'All Saints\' Day is near. Prepare traditional flowers for memorial arrangements and cemetery visits.'
            });
          }

          // Christmas Season (December)
          if (currentMonth === 11) {
            holidayRecommendations.push({
              holiday: 'Christmas',
              flowers: ['Poinsettias', 'Red Roses', 'White Lilies', 'Christmas Arrangements'],
              message: 'Christmas season! Focus on festive red and white flower arrangements for holiday celebrations.'
            });
          }

          return holidayRecommendations;
        };

        const holidayRecommendations = getHolidayRecommendations();
        
        holidayRecommendations.forEach((holiday, index) => {
          newNotifications.push({
            id: `holiday-${index}`,
            type: 'holiday',
            title: `🎉 ${holiday.holiday} Preparation`,
            message: `${holiday.message} Recommended: ${holiday.flowers.join(', ')}.`,
            time: 'now',
            holiday: holiday.holiday
          });
        });
        
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

  // FIFO and other sorting algorithms
  const sortProducts = (products, sortType) => {
    const sortedProducts = [...products];
    
    switch (sortType) {
      case 'fifo':
        // FIFO: Sort by dateReceived (oldest first)
        return sortedProducts.sort((a, b) => new Date(a.dateReceived) - new Date(b.dateReceived));
      
      case 'expiry':
        // Sort by expiration date (soonest to expire first)
        return sortedProducts.sort((a, b) => {
          const expiryA = new Date(a.dateReceived);
          expiryA.setDate(expiryA.getDate() + (a.lifespanInDays || 0));
          const expiryB = new Date(b.dateReceived);
          expiryB.setDate(expiryB.getDate() + (b.lifespanInDays || 0));
          return expiryA - expiryB;
        });
      
      case 'quantity-low':
        // Sort by quantity (lowest first) - good for identifying low stock
        return sortedProducts.sort((a, b) => a.quantity - b.quantity);
      
      case 'quantity-high':
        // Sort by quantity (highest first)
        return sortedProducts.sort((a, b) => b.quantity - a.quantity);
      
      case 'alphabetical':
        // Sort alphabetically by product name
        return sortedProducts.sort((a, b) => a.productName.localeCompare(b.productName));
      
      case 'price-low':
        // Sort by price (lowest first)
        return sortedProducts.sort((a, b) => (a.price || 0) - (b.price || 0));
      
      case 'price-high':
        // Sort by price (highest first)
        return sortedProducts.sort((a, b) => (b.price || 0) - (a.price || 0));
      
      default:
        return sortedProducts;
    }
  };

  // Search and sort logic
  useEffect(() => {
    let results = products.filter(product =>
      (product.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product._id.slice(-6).toLowerCase().includes(searchTerm.toLowerCase())) &&
      (categoryFilter === 'all' || product.productCategory === categoryFilter)
    );
    
    // Apply sorting after filtering
    results = sortProducts(results, sortOption);
    
    setFilteredProducts(results);
  }, [searchTerm, products, sortOption, categoryFilter]);
  
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
    <div className="dashboard-container">
      {!isEmployeeDashboard && <Sidebar />}
      
      <main className="dashboard-main">
        <div className="inventory-content">
          <div className="inventory-header">
            <h1>Inventory Management</h1>
            <div className="notification-bell" onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}>
              <span className="bell-icon">🔔</span>
              {notifications.length > 0 && (
                <span className="notification-count">{notifications.length}</span>
              )}
              
              {isNotificationsOpen && (
                <div className="notification-dropdown">
                  <div className="notification-header">
                    <h3>Notifications</h3>
                  </div>
                  {notifications.length === 0 ? (
                    <div className="no-notifications">No notifications</div>
                  ) : (
                    <div className="notification-list">
                      {notifications.map(notification => (
                        <div key={notification.id} className={`notification-item ${notification.type}`}>
                          <div className="notification-title">{notification.title}</div>
                          <div className="notification-message">{notification.message}</div>
                          <div className="notification-time">{notification.time}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          
          <div className="inventory-controls">
            <div className="search-bar">
              <span>Products</span>
              <input 
                type="text" 
                placeholder="Search by name or ID..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="sort-controls">
              <label htmlFor="sortOption">Sort by:</label>
              <select 
                id="sortOption"
                value={sortOption} 
                onChange={(e) => setSortOption(e.target.value)}
                className="sort-dropdown"
              >
                <option value="fifo"> Oldest Stock First </option>
                <option value="expiry"> Expiry Date (Urgent First)</option>
                <option value="quantity-low"> Low Stock First</option>
                <option value="quantity-high"> High Stock First</option>
                <option value="alphabetical"> Name (A-Z)</option>
                <option value="price-low"> Price (Low to High)</option>
                <option value="price-high"> Price (High to Low)</option>
              </select>
            </div>

            <div className="filter-controls">
              <label htmlFor="categoryFilter">Filter by:</label>
              <select 
                id="categoryFilter"
                value={categoryFilter} 
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="sort-dropdown" // Reuse class for styling
              >
                <option value="all">All Categories</option>
                <option value="Flowers">Flowers</option>
                <option value="Accessories">Accessories</option>
                <option value="Bouquet">Bouquet</option>
              </select>
            </div>
            
            <div className="inventory-summary">
              <span className="total-products">Total: {filteredProducts.length} products</span>
              {sortOption === 'fifo' && (
                <span className="fifo-indicator">
                  🔄 FIFO Active - Showing oldest stock first
                </span>
              )}
            </div>
          </div>
          <div className="table-wrapper">
            <table className="inventory-table">
              <thead>
                <tr>
                  <th>Product ID</th>
                  <th>Product Name</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Minimum Threshold</th>
                  <th>Quantity</th>
                  <th>Lifespan</th>
                  <th>Date Restocked</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((p, index) => {
                  const remainingLifespan = calculateRemainingLifespan(p.dateReceived, p.lifespanInDays);
                  const isLowStock = p.quantity <= (p.minimumThreshold || 0);
                  
                  return (
                    <tr key={p._id} className={`
                      ${remainingLifespan === 'Expired' ? 'expired-row' : ''} 
                      ${remainingLifespan.includes('days') && parseInt(remainingLifespan) <= 3 ? 'expiring-soon-row' : ''} 
                      ${isLowStock ? 'low-stock-row' : ''}
                    `}>
                      <td>{p._id.slice(-6).toUpperCase()}</td>
                      <td>{p.productName}</td>
                      <td>{p.productCategory}</td>
                      <td>₱{(p.price || 0).toFixed(2)}</td>
                      <td>{p.minimumThreshold || 0}</td>
                      <td>
                        {p.quantity}
                        {isLowStock && <span className="low-stock-warning"> ⚠️</span>}
                      </td>
                      <td>
                        <span className={`lifespan ${remainingLifespan === 'Expired' ? 'expired' : remainingLifespan.includes('days') && parseInt(remainingLifespan) <= 3 ? 'expiring-soon' : ''}`}>
                          {remainingLifespan}
                        </span>
                      </td>
                      <td>{p.dateRestocked ? new Date(p.dateRestocked).toLocaleDateString() : 'Not restocked'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Inventory;
