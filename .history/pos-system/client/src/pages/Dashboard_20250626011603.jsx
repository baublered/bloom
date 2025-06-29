import './Dashboard.css';
import Sidebar from './Sidebar'; // Your main Admin Sidebar
import UserProfile from './UserProfile'; // --- IMPORT THE NEW COMPONENT ---

function Dashboard() {
  return (
    <div className="dashboard-container">
      <Sidebar />

      <main className="dashboard-main">
        <header className="dashboard-header">
          <h1>Dashboard</h1>
          {/* --- FIX: Replace the static div with the interactive component --- */}
          <UserProfile />
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
