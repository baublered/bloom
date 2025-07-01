import { useEffect, useState } from 'react';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';
import './Dashboard.css'; // This can share the same CSS file

const EmployeeDashboardHome = () => {
    const [user, setUser] = useState(null);
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const decodedToken = jwtDecode(token);
                setUser(decodedToken.user);
            } catch (error) {
                console.error('Error decoding token:', error);
            }
        }
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            console.log('Fetching dashboard data from /api/dashboard/summary');
            const response = await axios.get('/api/dashboard/summary');
            console.log('Dashboard data received:', response.data);
            setDashboardData(response.data);
            setError(''); // Clear any previous errors
        } catch (err) {
            console.error('Dashboard data fetch error:', err);
            console.error('Error response:', err.response);
            setError('Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP'
        }).format(amount);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString();
    };

    if (loading) {
        return (
            <div className="dashboard-home-page">
                <div className="loading-state">Loading dashboard data...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="dashboard-home-page">
                <div className="error-state">
                    <p>{error}</p>
                    <button onClick={fetchDashboardData}>Retry</button>
                </div>
            </div>
        );
    }

    return (
        <div className="dashboard-home-page">
            {user && (
                <div className="welcome-section">
                    <h2>Welcome back, {user.username}!</h2>
                    <p>Here's what's happening with your store today.</p>
                </div>
            )}
            
            <section className="dashboard-content">
                <div className="card sales-overview">
                  <h3>Sales Overview</h3>
                  <p>Total Sales: <strong>{dashboardData.sales.totalSales}</strong></p>
                  <p>Total Revenue: <strong>{formatCurrency(dashboardData.sales.totalRevenue)}</strong></p>
                  <p>Today's Sales: <strong>{dashboardData.sales.todaySales}</strong></p>
                  <p>Today's Revenue: <strong>{formatCurrency(dashboardData.sales.todayRevenue)}</strong></p>
                </div>

                <div className="card inventory-summary">
                  <h3>Inventory Summary</h3>
                  <p>Quantity in Hand: <strong>{dashboardData.inventory.totalQuantityInHand}</strong></p>
                  <p>Total Items: <strong>{dashboardData.inventory.totalItems}</strong></p>
                  <p>Low Stock Items: <strong>{dashboardData.inventory.lowStockItems}</strong></p>
                  <p>Near Expiry: <strong>{dashboardData.inventory.nearExpiryProducts}</strong></p>
                </div>

                <div className="card product-details">
                  <h3>Product Details</h3>
                  <p>Low Stock Items: <strong>{dashboardData.products.lowStockItems.toString().padStart(2, '0')}</strong></p>
                  <p>Total Products: <strong>{dashboardData.products.totalProducts}</strong></p>
                  <p>Spoiled Products: <strong>{dashboardData.products.spoiledProducts.toString().padStart(2, '0')}</strong></p>
                  <p>Near Expiry: <strong>{dashboardData.products.nearExpiryProducts.toString().padStart(2, '0')}</strong></p>
                </div>

                <div className="card recent-activity">
                    <h3>Recent Activity</h3>
                    {dashboardData.insights.recentTransactions.length > 0 ? (
                        <div className="recent-transactions">
                            {dashboardData.insights.recentTransactions.slice(0, 3).map((transaction, index) => (
                                <div key={transaction.id} className="transaction-item">
                                    <span className="transaction-type">{transaction.type}</span>
                                    <span className="transaction-amount">{formatCurrency(transaction.amount)}</span>
                                    <span className="transaction-date">{formatDate(transaction.date)}</span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p>No recent transactions</p>
                    )}
                </div>

                <div className="card quick-actions">
                    <h3>Quick Actions</h3>
                    <button onClick={fetchDashboardData} className="refresh-btn">Refresh Data</button>
                    <p className="last-updated">Last updated: {formatDate(dashboardData.lastUpdated)}</p>
                </div>
            </section>
        </div>
    );
};

export default EmployeeDashboardHome;
