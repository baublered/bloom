import { useState } from 'react';
import './Retail.css'; // Optional, CSS below

function RetailTransaction() {
  const flowerList = [
    'Bouquet of Roses',
    'Bouquet of Tulips',
    'Bouquet of Carnation',
    'Bouquet of Gypsophila',
    'Bouquet of Sunflower',
    'Bouquet of Misty Blu'
  ];

  const [selectedFlowers, setSelectedFlowers] = useState({});

  const toggleFlower = (flower) => {
    setSelectedFlowers((prev) => ({
      ...prev,
      [flower]: prev[flower] ? undefined : 1,
    }));
  };

  const updateQuantity = (flower, amount) => {
    setSelectedFlowers((prev) => {
      const currentQty = prev[flower] || 1;
      const newQty = Math.max(currentQty + amount, 1);
      return { ...prev, [flower]: newQty };
    });
  };

  const handleProceed = () => {
    const selected = Object.entries(selectedFlowers).filter(([_, qty]) => qty !== undefined);
    console.log('Selected for billing:', selected);
    // TODO: Navigate or store to context/state for billing page
  };

  return (
    <div className="retail-container">
      <h2 className="retail-header">Transaction</h2>
      <div className="retail-subtitle">Retail Transaction</div>

      <div className="retail-content">
        <div className="retail-sidebar">
          <div className="tab selected">Flowers</div>
          {/* Future tabs can go here */}
        </div>

        <div className="retail-main">
          <div className="search-bar">
            <input type="text" placeholder="Search..." />
          </div>

          <div className="flower-list">
            <h3>List of Available Flowers</h3>
            {flowerList.map((flower) => (
              <div key={flower} className="flower-item">
                <input
                  type="checkbox"
                  checked={selectedFlowers[flower] !== undefined}
                  onChange={() => toggleFlower(flower)}
                />
                <label>{flower}</label>
                {selectedFlowers[flower] !== undefined && (
                  <div className="quantity-controls">
                    <button onClick={() => updateQuantity(flower, -1)}>-</button>
                    <span>{selectedFlowers[flower]}</span>
                    <button onClick={() => updateQuantity(flower, 1)}>+</button>
                  </div>
                )}
              </div>
            ))}
          </div>

          <button className="proceed-button" onClick={handleProceed}>
            Proceed to Bill
          </button>
        </div>
      </div>
    </div>
  );
}

export default RetailTransaction;
