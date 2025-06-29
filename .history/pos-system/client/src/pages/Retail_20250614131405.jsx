import axios from 'axios';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Retail.css';

function RetailTransaction() {
  const [flowerList, setFlowerList] = useState([]);
  const [selectedFlowers, setSelectedFlowers] = useState({});
  const [statusMessage, setStatusMessage] = useState(''); 
  const [searchQuery, setSearchQuery] = useState('');  // New state for search input

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

  // Handle search input change
  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);  // Update search query as the user types
  };

  // Filter flower list based on search query
  const filteredFlowers = flowerList.filter(flower =>
    flower.name.toLowerCase().includes(searchQuery.toLowerCase()) // Case-insensitive search
  );

  const toggleFlower = (flower) => {
    setSelectedFlowers((prev) => ({
      ...prev,
      [flower]: prev[flower] ? undefined : 1,  
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
    navigate('/billing-retail', { state: { selectedFlowers: selected } });
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
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}  // Set the input value to the search query
              onChange={handleSearchChange}  // Call handleSearchChange on input change
            />
          </div>

          <div className="flower-list">
            <h3>List of Available Flowers</h3>
            {filteredFlowers.map(({ name, price, quantity }) => (
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
