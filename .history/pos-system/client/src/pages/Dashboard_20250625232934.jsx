import './Dashboard.css'; // Import the styles
import Sidebar from './Sidebar';
import UserProfile from './UserProfile'; 

function Dashboard() {
  // All the old state and toggle functions are gone!
  // The Dashboard component is now much cleaner.

  return (
    <div className="dashboard-container">
      {/* 1. Replace the old <aside> with our new component */}
      <Sidebar />

      {/* 2. Keep your existing main content area */}
      <main className="dashboard-main">
        <header className="dashboard-header">
          <h1>Dashboard</h1>
          <div className="user-profile">
                <UserProfile /></div>
        </header>

        <section className="dashboard-content">
          <div className="card sales-overview">
            <h3>Sales overview</h3>
            <p>Total Sales: <strong>30</strong></p>
            <p>Total Cost: <strong>5,754</strong></p>
          </div>

          <div className="card inventory-summary">
            <h3>Inventory Summary</h3>
            <p>Quantity in Hand: <strong>84</strong></p>
            <p>Will Be Received: <strong>150</strong></p>
          </div>

          <div className="card product-details">
            <h3>Product Details</h3>
            <p>Low Stock Items: <strong>06</strong></p>
            <p>No. of Items: <strong>256</strong></p>
            <p>Spoiled Products: <strong>10</strong></p>
          </div>
        </section>
      </main>
    </div>
  );
}

export default Dashboard;