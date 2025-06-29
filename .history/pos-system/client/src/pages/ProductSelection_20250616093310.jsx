// ProductSelection.jsx

import axios from 'axios';
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './ProductSelection.css';

// You can reuse or create a similar header component
const UserProfileHeader = () => (
  <header className="user-profile-header">
    <div className="user-profile-dropdown">
      <span className="user-icon">👤</span>
      <span>User Profile</span>
      <span className="dropdown-arrow">▼</span>
    </div>
  </header>
);

function ProductSelection() {
  const [flowerList, setFlowerList] = useState([]);
  // State to hold quantities for EACH flower, initialized to 0
  const [flowerQuantities, setFlowerQuantities] = useState({});
  const [statusMessage, setStatusMessage] = useState('');
  const navigate = useNavigate();

  // Fetch products and initialize quantities
  useEffect(() => {
    const fetchFlowers = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/products');
        setFlowerList(response.data);
        // Initialize all flower quantities to 0
        const initialQuantities = response.data.reduce((acc, flower) => {
          acc[flower.name] = 0;
          return acc;
        }, {});
        setFlowerQuantities(initialQuantities);
      } catch (err) {
        console.error(err);
        setStatusMessage('❌ Failed to load products.');
      }
    };
    fetchFlowers();
  }, []);

  // Handle checking/unchecking the box
  const handleCheckboxChange = (flowerName) => {
    setFlowerQuantities((prev) => {
      const newQuantities = { ...prev };
      // If currently 0, set to 1. If more than 0, set back to 0.
      newQuantities[flowerName] = newQuantities[flowerName] > 0 ? 0 : 1;
      return newQuantities;
    });
  };

  // Handle increasing or decreasing quantity
  const handleQuantityChange = (flowerName, amount, stock) => {
    setFlowerQuantities((prev) => {
      const currentQty = prev[flowerName] || 0;
      // Ensure quantity stays within the 0 to stock range
      const newQty = Math.max(0, Math.min(currentQty + amount, stock));
      return { ...prev, [flowerName]: newQty };
    });
  };

  // Save selected items and navigate
  const handleSave = () => {
    const selected = flowerList
      .map((flower) => ({
        ...flower,
        quantity: flowerQuantities[flower.name],
        totalPrice: flower.price * flowerQuantities[flower.name],
      }))
      .filter((flower) => flower.quantity > 0); // Only include items with quantity > 0

    if (selected.length === 0) {
      setStatusMessage('Please select at least one flower.');
      return;
    }

    // Pass the selected flowers to the next page
    navigate('/billing-events', { state: { selectedFlowers: selected } });
  };

  return (
    <div className="product-selection-page">
      <div className="product-selection-container">
        <UserProfileHeader />
        <h2 className="products-title">Products</h2>
        
        <div className="content-card">
          <Link to="/events" className="back-link">
            ← Back to the calendar of events
          </Link>

          <div className="list-c3ontainer">
            <h3>List of Available Flowers</h3>
            <div className="flower-list">
              {flowerList.length > 0 ? (
                flowerList.map((flower) => (
                  <div key={flower.name} className="flower-item">
                    <div className="flower-details">
                      <input
                        type="checkbox"
                        checked={flowerQuantities[flower.name] > 0}
                        onChange={() => handleCheckboxChange(flower.name)}
                      />
                      <label>{flower.name}</label>
                    </div>
                    <div className="quantity-controls">
                      <button
                        onClick={() => handleQuantityChange(flower.name, 1, flower.quantity)}
                        disabled={flowerQuantities[flower.name] >= flower.quantity || flowerQuantities[flower.name] === 0}
                      >
                        +
                      </button>
                      <span>{flowerQuantities[flower.name]}</span>
                      <button
                        onClick={() => handleQuantityChange(flower.name, -1, flower.quantity)}
                        disabled={flowerQuantities[flower.name] <= 0}
                      >
                        -
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <p>Loading flowers...</p>
              )}
            </div>
             {statusMessage && <div className="status-message">{statusMessage}</div>}
             <div className="pagination-dots">
                <span></span>
                <span></span>
                <span></span>
            </div>
          </div>
          
          <button className="save-button" onClick={handleSave}>
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProductSelection;