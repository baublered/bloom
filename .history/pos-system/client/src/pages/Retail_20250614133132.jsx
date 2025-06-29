import axios from 'axios';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Retail.css';

function RetailTransaction() {  // Capitalized 'RetailTransaction' to follow React's naming convention
  const [flowerList, setFlowerList] = useState([]);
  const [selectedFlowers, setSelectedFlowers] = useState({});
  const [selectedAddOns, setSelectedAddOns] = useState([]);  // State for add-ons
  const [statusMessage, setStatusMessage] = useState(''); 

  const navigate = useNavigate();  

  // Fetch products (flowers) from inventory
  useEffect(() => {
    const fetchFlowers = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/products');  
        setFlowerList(response.data);  
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
      const newQty = Math.max(Math.min(currentQty + amount, stock), 0); 
      if (newQty > stock) {
        setStatusMessage(`❌ Cannot select more than ${stock} ${flower}(s).`); 
      } else {
        setStatusMessage('');
      }
      return { ...prev, [flower]: newQty };
    });
  };

  const toggleAddOn = (addOn) => {
    setSelectedAddOns((prev) =>
      prev.includes(addOn)
        ? prev.filter((item) => item !== addOn)
        : [...prev, addOn]
    );
  };

  const handleProceed = () => {
    const selected = Object.entries(selectedFlowers).map(([flower, qty]) => {
      const flowerData = flowerList.find(f => f.name === flower);  
      return {
        name: flowerData.name,
        price: flowerData.price,
        quantity: qty,
        totalPrice: flowerData.price * qty
      };
    });

    console.log('Selected for billing:', selected);
    navigate('/billing-retail', { state: { selectedFlowers: selected, selectedAddOns } });
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
            <div className="flower-container">
              {flowerList.map(({ name, price, quantity }) => (
                <div key={name} className="flower-item">
                  <div className="flower-info">
                    <div className="flower-title">
                      <label style={{ fontWeight: 'bold' }}>{name}</label>
                    </div>
                    <div className="stock-info">
                      <span>{quantity} available</span>
                    </div>
                    <div className="price-info">
                      <span>₱{price}</span>
                    </div>
                  </div>

                  <div className="checkbox-and-quantity-container">
                    <div className="checkbox-container">
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
                          disabled={selectedFlowers[name] <= 0}
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
                </div>
              ))}
            </div>
          </div>

          {/* Add-ons Section */}
          <div className="add-ons">
            <h3>Add-ons</h3>
            <div className="add-on-container">
              <div className="add-on-item">
                <input
                  type="checkbox"
                  checked={selectedAddOns.includes('Ribbons')}
                  onChange={() => toggleAddOn('Ribbons')}
                />
                <label>Ribbons</label>
              </div>
              <div className="add-on-item">
                <input
                  type="checkbox"
                  checked={selectedAddOns.includes('Wrapper')}
                  onChange={() => toggleAddOn('Wrapper')}
                />
                <label>Wrapper</label>
              </div>
              <div className="add-on-item">
                <input
                  type="checkbox"
                  checked={selectedAddOns.includes('Message Card')}
                  onChange={() => toggleAddOn('Message Card')}
                />
                <label>Message Card</label>
              </div>
            </div>
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
