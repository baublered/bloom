import axios from 'axios';
import { useEffect, useState } from 'react';
import './Retail.css';

function RetailTransaction() {
  const [flowerList, setFlowerList] = useState([]);
  const [selectedFlowers, setSelectedFlowers] = useState({});
  const [statusMessage, setStatusMessage] = useState(''); // To show error/success message

  // Fetch products (flowers) from inventory
  useEffect(() => {
    const fetchFlowers = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/products');  // Fetch products from backend
        setFlowerList(response.data);  // Store the products in state
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
      [flower]: prev[flower] ? undefined : 1,  // Toggle flower selection (initial quantity is 1)
    }));
  };

  const updateQuantity = (flower, amount, stock) => {
    setSelectedFlowers((prev) => {
      const currentQty = prev[flower] || 0;
      const newQty = Math.max(Math.min(currentQty + amount, stock), 0); // Ensure quantity doesn't exceed stock
      if (newQty > stock) {
        setStatusMessage(`❌ Cannot select more than ${stock} ${flower}(s).`); // Error message for exceeding stock
      } else {
        setStatusMessage('');
      }
      return { ...prev, [flower]: newQty };
    });
  };

  const handleProceed = () => {
    const selected = Object.entries(selectedFlowers).filter(([_, qty]) => qty !== undefined);
    console.log('Selected for billing:', selected);
    // Proceed to billing page (you can use `navigate` for routing to the next page)
    // navigate('/billing-retail', { state: { selectedFlowers: selected } });
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
            {flowerList.map(({ name, price, stock }) => (
              <div key={name} className="flower-item">
                <div className="flower-info">
                  <div className="flower-title">
                    <label style={{ fontWeight: 'bold' }}>{name}</label> {/* Bold the product title */}
                    <span className="stock-info">({stock} Available)</span> {/* Display available stock */}
                    <span className="price-info">₱{price}</span> {/* Price with Peso sign */}
                  </div>
                  <div className="checkbox-container">
                    <input
                      type="checkbox"
                      checked={selectedFlowers[name] !== undefined}
                      onChange={() => toggleFlower(name)}
                      className="flower-checkbox"
                    />
                  </div>
                </div>
                {selectedFlowers[name] !== undefined && (
                  <div className="quantity-controls">
                    <button 
                      onClick={() => updateQuantity(name, -1, stock)} 
                      disabled={selectedFlowers[name] <= 0}
                    >
                      -
                    </button>
                    <span>{selectedFlowers[name]}</span> {/* Show selected quantity */}
                    <button 
                      onClick={() => updateQuantity(name, 1, stock)} 
                      disabled={selectedFlowers[name] >= stock}
                    >
                      +
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Show status message */}
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
