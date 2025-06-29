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

        // 1. Generate Low Stock Alerts
        const lowStockItems = fetchedProducts.filter(p => p.quantity <= LOW_STOCK_THRESHOLD);
        lowStockItems.forEach(item => { // The item is named 'item' here
          newNotifications.push({
            id: `low-${item._id}`,
            type: 'alert',
            title: 'Low Stock Alert!',
            // --- FIX: Use 'item.productName' instead of 'p.productName' ---
            message: `${item.productName} is running low.`,
            time: 'now'
          });
        });

        // 2. Generate Seasonal Flower Recommendations for Metro Manila, Philippines
        const getSeasonalRecommendations = () => {
          const currentMonth = new Date().getMonth(); // 0-11 (Jan-Dec)
          const recommendations = [];

          console.log('Current month:', currentMonth, 'Month name:', new Date().toLocaleString('default', { month: 'long' })); // Debug log

          // Dry Season (December to May) - Hot and humid
          if (currentMonth === 11 || (currentMonth >= 0 && currentMonth <= 4)) {
            if (currentMonth >= 0 && currentMonth <= 2) {
              // January to March - Cool dry season
              recommendations.push({
                flowers: ['Roses', 'Carnations', 'Chrysanthemums', 'Gerberas'],
                reason: 'Cool dry season is perfect for these hardy flowers that thrive in moderate temperatures.',
                season: 'Cool Dry Season'
              });
            } else if (currentMonth >= 3 && currentMonth <= 4) {
              // April to May - Hot dry season
              recommendations.push({
                flowers: ['Sunflowers', 'Marigolds', 'Sampaguita', 'Bougainvillea'],
                reason: 'Hot dry season calls for heat-resistant flowers that can withstand intense sunlight.',
                season: 'Hot Dry Season'
              });
            } else if (currentMonth === 11) {
              // December - Cool dry season starts
              recommendations.push({
                flowers: ['Roses', 'Carnations', 'Chrysanthemums', 'Gerberas'],
                reason: 'Cool dry season is starting. Perfect time for hardy flowers that thrive in moderate temperatures.',
                season: 'Cool Dry Season'
              });
            }
          }

          // Wet Season (June to November) - Rainy and humid
          else if (currentMonth >= 5 && currentMonth <= 10) {
            if (currentMonth >= 5 && currentMonth <= 7) {
              // June to August - Heavy rain season
              recommendations.push({
                flowers: ['Orchids', 'Anthuriums', 'Lilies', 'Gingers'],
                reason: 'Rainy season is ideal for tropical flowers that love humidity and indirect sunlight.',
                season: 'Heavy Rain Season'
              });
            } else {
              // September to November - Light rain season
              recommendations.push({
                flowers: ['Tulips', 'Daisies', 'Baby\'s Breath', 'Asters'],
                reason: 'Light rain season provides perfect conditions for delicate flowers.',
                season: 'Light Rain Season'
              });
            }
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
              flowers: ['Red Roses', 'Pink Roses', 'White Roses', 'Mixed Rose Bouquets'],
              message: 'Valentine\'s Day is approaching! Stock up on romantic flowers.'
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

          // Christmas Season (December)
          if (currentMonth === 11) {
            holidayRecommendations.push({
              holiday: 'Christmas',
              flowers: ['Poinsettias', 'Red Roses', 'White Lilies', 'Christmas Arrangements'],
              message: 'Christmas season! Focus on festive red and white flower arrangements.'
            });
          }

          // All Saints' Day / Undas (November 1)
          if (currentMonth === 10 && currentDate >= 25) {
            holidayRecommendations.push({
              holiday: 'All Saints\' Day',
              flowers: ['White Chrysanthemums', 'White Lilies', 'White Roses', 'Memorial Arrangements'],
              message: 'All Saints\' Day is near. Prepare white flowers for memorial arrangements.'
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

  // Search logic
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
    <div className="dashboard-container">
      {!isEmployeeDashboard && <Sidebar />}
      
      <main className="dashboard-main">
        {/* Only render header when not in employee dashboard */}
        {!isEmployeeDashboard && (
          <header className="dashboard-header">
            <h1>Inventory</h1>
            <div className="header-right">
              <div className="notification-bell-container">
                <button className="notification-bell" onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}>
                  🔔
                  {notifications.length > 0 && <span className="notification-badge">{notifications.length}</span>}
                </button>
                {isNotificationsOpen && (
                  <div className="notification-dropdown">
                    {notifications.length > 0 ? (
                      <>
                        <div className="notification-header">
                          <h4>Notifications ({notifications.length})</h4>
                        </div>
                        {notifications.map(notif => (
                          <div key={notif.id} className={`notification-item ${notif.type}`}>
                            <span className={`notification-icon ${notif.type}`}>
                              {notif.type === 'alert' ? '⚠️' : 
                               notif.type === 'recommendation' ? '🌺' : 
                               notif.type === 'holiday' ? '🎉' : '!'}
                            </span>
                            <div className="notification-text">
                              <p className="notification-title">{notif.title}</p>
                              <p className="notification-message">{notif.message}</p>
                              {notif.season && <span className="notification-season">Season: {notif.season}</span>}
                              {notif.holiday && <span className="notification-holiday">Event: {notif.holiday}</span>}
                            </div>
                            <span className="notification-time">{notif.time}</span>
                          </div>
                        ))}
                      </>
                    ) : (
                      <p className="no-notifications">No new notifications.</p>
                    )}
                  </div>
                )}
              </div>
              <UserProfile />
            </div>
          </header>
        )}

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
                    <td>
                      <span className={`status-dot ${p.quantity > 10 ? 'good' : 'low'}`}></span>
                    </td>
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

export default Inventory;
