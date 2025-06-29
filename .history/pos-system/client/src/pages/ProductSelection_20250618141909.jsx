import axios from 'axios';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './ProductSelection.css'; // We'll create this new CSS file

const ProductSelection = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { eventDetails } = location.state || {};

  const [products, setProducts] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState({}); // { productId: quantity }
  const [error, setError] = useState('');

  // Fetch all "Flowers" from the inventory
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get('/api/products');
        const flowerProducts = response.data.filter(p => p.productCategory === 'Flowers');
        setProducts(flowerProducts);
      } catch (err) {
        setError('Failed to load products. Please try again.');
        console.error(err);
      }
    };
    fetchProducts();
  }, []);

  // Handle checking/unchecking a product
  const handleProductSelect = (product, isChecked) => {
    setSelectedProducts(prev => {
      const newSelection = { ...prev };
      if (isChecked) {
        // Add to selection with quantity 1 if not already present
        if (!newSelection[product._id] && product.quantity > 0) {
          newSelection[product._id] = 1;
        }
      } else {
        // Remove from selection
        delete newSelection[product._id];
      }
      return newSelection;
    });
  };

  // Handle quantity changes
  const updateQuantity = (productId, amount) => {
    const productInStock = products.find(p => p._id === productId);
    const stock = productInStock ? productInStock.quantity : 0;

    setSelectedProducts(prev => {
      const currentQty = prev[productId] || 0;
      const newQty = Math.max(1, Math.min(currentQty + amount, stock));
      return { ...prev, [productId]: newQty };
    });
  };
  
  // Handle saving the selection and proceeding to billing
  const handleSaveAndProceed = () => {
    // Format the selected products to include all necessary details
    const productsForBilling = Object.entries(selectedProducts).map(([id, quantity]) => {
        const product = products.find(p => p._id === id);
        return { ...product, quantity };
    });

    // Navigate to the event billing page with all the data
    navigate('/billing-events', { 
        state: { 
            eventDetails, 
            selectedProducts: productsForBilling 
        } 
    });
  };

  if (!eventDetails) {
    return <div>No event selected. Please go back to the calendar.</div>;
  }

  return (
    <div className="product-selection-page">
      <header className="selection-page-header">
        <h1>Products</h1>
      </header>
      <main className="selection-main-content">
        <button className="back-link" onClick={() => navigate('/events')}>
          ← Back to the calendar of events
        </button>
        <div className="selection-card">
          <h3>List of Available Flowers</h3>
          <div className="selection-list">
            {error && <p className="error-message">{error}</p>}
            {products.map(product => (
              <div key={product._id} className="selection-item-row">
                <input
                  type="checkbox"
                  id={`product-${product._id}`}
                  checked={!!selectedProducts[product._id]}
                  onChange={(e) => handleProductSelect(product, e.target.checked)}
                  disabled={product.quantity === 0 && !selectedProducts[product._id]}
                />
                <label htmlFor={`product-${product._id}`}>{product.productName}</label>
                {selectedProducts[product._id] && (
                  <div className="quantity-controls">
                    <button onClick={() => updateQuantity(product._id, -1)}>-</button>
                    <span>{selectedProducts[product._id]}</span>
                    <button onClick={() => updateQuantity(product._id, 1)}>+</button>
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="selection-footer">
              <div className="pagination-dots">
                  <span></span><span></span><span></span>
              </div>
              <button className="save-button" onClick={handleSaveAndProceed}>Save</button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProductSelection;
