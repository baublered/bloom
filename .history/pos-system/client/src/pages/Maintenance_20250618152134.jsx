import { useNavigate } from 'react-router-dom';
import './Maintenance.css';
import Sidebar from './Sidebar'; // Import the Sidebar component

const Maintenance = () => {
  const navigate = useNavigate();

  return (
    <div className="maintenance-layout">
      <Sidebar />
      <main className="maintenance-page">
        <header className="maintenance-header">
            <h1>Maintenance</h1>
            {/* You can add a user profile button here later if needed */}
        </header>
        <div className="maintenance-container">
            <div className="maintenance-panel">
                <h3>Maintenance Options</h3>
                <div className="maintenance-buttons-grid">
                    <button className="maintenance-btn" onClick={() => navigate('/restock')}>
                        <span className="icon">🞤</span>
                        <span>Restock</span>
                        <span className="description">Add new stock to existing products.</span>
                    </button>
                    <button className="maintenance-btn" onClick={() => navigate('/edit-product')}>
                        <span className="icon">✎</span>
                        <span>Edit a product</span>
                        <span className="description">Modify details of an existing product.</span>
                    </button>
                    <button className="maintenance-btn" onClick={() => navigate('/backup')}>
                        <span className="icon">🗃️</span>
                        <span>Backup</span>
                        <span className="description">Create a backup of your system data.</span>
                    </button>
                </div>
            </div>
        </div>
      </main>
    </div>
  );
}

export default Maintenance;
