import axios from 'axios';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import './Retail.css';

function RetailTransaction() {
  const [flowerList, setFlowerList] = useState([]);
  const [selectedFlowers, setSelectedFlowers] = useState({});
  const [statusMessage, setStatusMessage] = useState('');
  const navigate = useNavigate();  // Initialize the navigate function

  // Fetch flowers from the backend (inventory)
  useEffect(() => {
    const fetchFlowers = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/products');
        if (response.data && response.data.length > 0) {
          setFlowerList(response.data);  // Set products to state
        } else {
          setStatusMessage('No products found.');
        }
      } catch (err) {
        console.error(err);
        setStatusMessage('❌ Failed to load products.');
      }
    };

    fetchFlowers();
  }, []);

  const toggleFlower = (flower) => {
    setSelectedFlowers((prev) => ({
      ...prev,
      [flower]: prev[flower] ? undefined : 1,
    }));
  };

  const updateQuantity = (flower, amount, stock) => {
    setSelectedFlowers((prev) => {
      const currentQty = prev[flower] || 1;
      const newQty = Math.max(Math.min(currentQty + amount, stock), 1);  // Ensure quantity is within stock limits
      if (newQty > stock) {
        setStatusMessage(`❌ Cannot select more than ${stock} ${flower}(s).`);
      } else {
        setStatusMessage('');
      }
      return { ...prev, [flower]: newQty };
    });
  };

  const handleProceed = () => {
    const selected = Object.entries(selectedFlowers).filter(([_, qty]) => qty !== undefined);
    console.log('Selected flowers for billing:', selected);  // Log to inspect selected flowers

    // Prepare the selected flowers data to pass to the billing section
    const flowersForBilling = selected.map(([flower, quantity]) => {
      const flowerData = flowerList.find(flowerItem => flowerItem.name === flower);
      return {
        name: flower,
        quantity: quantity,
        price: flowerData.price, // Get price from the fetched flower data
        image: flowerData.image, // Get image from the fetched flower data
      };
    });

    // Pass selected flowers to BillingRetail page via state
    navigate('/billing-retail', { state: { selectedFlowers: flowersForBilling } });
  };

  return (
    <div className="retail-container">
      <h2 className="retail-header">Transaction</h2>
      <div className="retail-subtitle">Retail Transaction</div>
      <div className="retail-content">
        <div className="retail-sidebar">
          <div className="tab selected">Flowers</div>
        </div>

        <div className="retail-main">
          <div className="search-bar">
            <input type="text" placeholder="Search..." />
          </div>

          <div className="flower-list">
            <h3>List of Available Flowers</h3>
            {flowerList.length > 0 ? (
              flowerList.map(({ name, price, quantity }) => (
                <div key={name} className="flower-item">
                  <div className="flower-info">
                    <div className="flower-title">
                      <label>{name}</label>
                      <div className="stock-info">
                        <span>{quantity} Available</span> {/* Display stock */}
                      </div>
                      <div className="price-info">
                        <span>P{price}</span> {/* Display price */}
                      </div>
                    </div>
                <input
                  type="checkbox"
                      checked={selectedFlowers[name] !== undefined}
                      onChange={() => toggleFlower(name)}
                      className="flower-checkbox"
                    />
                  </div>
                  {selectedFlowers[name] !== undefined && (
                  <div className="quantity-controls">
                      <button 
                        onClick={() => updateQuantity(name, -1, quantity)} 
                        disabled={selectedFlowers[name] <= 1}
                      >
                        -
                      </button>
                      <span>{selectedFlowers[name]}</span>
                      <button 
                        onClick={() => updateQuantity(name, 1, quantity)} 
                        disabled={selectedFlowers[name] >= quantity}
                      >
                        +
                      </button>
                  </div>
                )}
              </div>
              ))
            ) : (
              <div>No flowers available</div>
            )}
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

export default RetailTransaction;
