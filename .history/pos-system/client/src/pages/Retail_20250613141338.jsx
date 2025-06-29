import axios from 'axios';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Import the useNavigate hook
import './ProductSelection.css';

function ProductSelection() {
  const [flowerList, setFlowerList] = useState([]);  // Store flower data from API
  const [selectedFlowers, setSelectedFlowers] = useState({});  // Store selected flowers and their quantities
  const [statusMessage, setStatusMessage] = useState(''); // For showing error/success messages

  const navigate = useNavigate();  // Initialize navigate function

  // Fetch products (flowers) from the inventory API
  useEffect(() => {
    const fetchFlowers = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/products'); // Fetch products from backend
        setFlowerList(response.data);  // Store the fetched data
      } catch (err) {
        console.error(err);
        setStatusMessage('❌ Failed to load products.');
      }
    };
    fetchFlowers();
  }, []);

  // Handle flower selection toggle (checkbox)
  const toggleFlower = (flower) => {
    setSelectedFlowers((prev) => ({
      ...prev,
      [flower]: prev[flower] ? undefined : 1,  // Toggle flower selection (initialize quantity as 1)
    }));
  };

  // Update quantity of selected flowers
  const updateQuantity = (flower, amount, stock) => {
    setSelectedFlowers((prev) => {
      const currentQty = prev[flower] || 0;
      const newQty = Math.max(Math.min(currentQty + amount, stock), 0);  // Ensure quantity doesn't exceed stock
      if (newQty > stock) {
        setStatusMessage(`❌ Cannot select more than ${stock} ${flower}(s).`); // Error message for exceeding stock
      } else {
        setStatusMessage('');
      }
      return { ...prev, [flower]: newQty };
    });
  };

  // Proceed to the billing page with selected items
  const handleProceed = () => {
    const selected = Object.entries(selectedFlowers).map(([flower, qty]) => {
      const flowerData = flowerList.find(f => f.name === flower);  // Get the flower data based on name
      return {
        name: flowerData.name,
        price: flowerData.price,
        quantity: qty,
        totalPrice: flowerData.price * qty,
      };
    });
    console.log('Selected for billing:', selected);
    navigate('/billing-retail', { state: { selectedFlowers: selected } });  // Pass selected flowers to billing page
  };

  return (
    <div className="product-selection-container">
      <h2 className="product-selection-header">Transaction</h2>
      <div className="product-selection-subtitle">Product Selection</div>
      <div className="product-selection-content">
        <div className="product-selection-sidebar">
          <div className="tab selected">Flowers</div>
        </div>

        <div className="product-selection-main">
          <div className="search-bar">
            <input type="text" placeholder="Search..." />
          </div>

          <div className="flower-list">
            <h3>List of Available Flowers</h3>
            {flowerList.map(({ name, price, quantity }) => (
              <div key={name} className="flower-item">
                <div className="flower-info">
                  <div className="flower-title">
                    <label style={{ fontWeight: 'bold' }}>{name}</label>
                  </div>
                  <div className="stock-info">
                    <span>{quantity} available</span>
                  </div>
                  <span className="price-info">₱{price}</span>
                </div>

                <div className="checkbox-and-quantity-container">
                  <div className="checkbox-container">
                    <input
                      type="checkbox"
                      checked={selectedFlowers[name] !== undefined}
                      onChange={() => toggleFlower(name)}  // Toggle selection when clicked
                      className="flower-checkbox"
                    />
                  </div>

                  {selectedFlowers[name] !== undefined && (
                    <div className="quantity-controls">
                      <button 
                        onClick={() => updateQuantity(name, -1, quantity)} 
                        disabled={selectedFlowers[name] <= 0}  // Disable if selected quantity is 0
                      >
                        -
                      </button>
                      <span>{selectedFlowers[name]}</span>
                      <button 
                        onClick={() => updateQuantity(name, 1, quantity)} 
                        disabled={selectedFlowers[name] >= quantity}  // Disable if selected quantity reaches available stock
                      >
                        +
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {statusMessage && (
            <div className="error-message">{statusMessage}</div>
          )}

          <button className="proceed-button" onClick={handleProceed}>
            Proceed to Bill
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProductSelection;
