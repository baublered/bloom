import { useEffect, useState } from 'react';
import { jwtDecode } from 'jwt-decode';
import './Dashboard.css'; // This can share the same CSS file

const EmployeeDashboardHome = () => {
    const [user, setUser] = useState(null);
    
    // In the future, this data can be fetched from your backend
    const summaryData = {
        totalSales: 30,
        totalCost: 5754,
        quantityInHand: 84,
        toBeReceived: 150,
        lowStockItems: 6,
        totalItems: 256,
        spoiledProducts: 10,
    };

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
    }, []);

    return (
        <div className="dashboard-home-page">
            <section className="dashboard-content">
                <div className="card sales-overview">
                  <h3>Sales overview</h3>
                  <p>Total Sales: <strong>{summaryData.totalSales}</strong></p>
                  <p>Total Cost: <strong>{summaryData.totalCost.toLocaleString()}</strong></p>
                </div>

                <div className="card inventory-summary">
                  <h3>Inventory Summary</h3>
                  <p>Quantity in Hand: <strong>{summaryData.quantityInHand}</strong></p>
                  <p>Will Be Received: <strong>{summaryData.toBeReceived}</strong></p>
                </div>

                <div className="card product-details">
                  <h3>Product Details</h3>
                  <p>Low Stock Items: <strong>{String(summaryData.lowStockItems).padStart(2, '0')}</strong></p>
                  <p>No. of Items: <strong>{summaryData.totalItems}</strong></p>
                  <p>Spoiled Products: <strong>{String(summaryData.spoiledProducts).padStart(2, '0')}</strong></p>
                </div>
            </section>
        </div>
    );
};

export default EmployeeDashboardHome;
