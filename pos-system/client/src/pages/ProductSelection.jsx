import axios from 'axios';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import './ProductSelection.css';

const ProductSelection = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { eventDetails } = location.state || {};
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        setUser(decodedToken.user);
      } catch (error) {
        console.error("Error decoding token:", error);
      }
    }
  }, []);

  const [products, setProducts] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState({}); // { productId: quantity }
  const [error, setError] = useState('');
  const [quantityErrors, setQuantityErrors] = useState({});

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
        if (!newSelection[product._id] && product.quantity > 0) {
          newSelection[product._id] = 1;
        }
      } else {
        delete newSelection[product._id];
      }
      return newSelection;
    });
  };

  // Handle quantity changes from the input field
  const handleQuantityChange = (productId, value) => {
    const productInStock = products.find(p => p._id === productId);
    const stock = productInStock ? productInStock.quantity : 0;

    // Allow empty input for typing, but don't process it as a valid quantity
    if (value === '') {
      setSelectedProducts(prev => ({ ...prev, [productId]: '' }));
      setQuantityErrors(prev => ({ ...prev, [productId]: 'Quantity is required.' }));
      return;
    }

    const newQty = parseInt(value, 10);

    if (isNaN(newQty) || newQty < 1) {
      // Reset to 1 if input is invalid or less than 1
      setSelectedProducts(prev => ({ ...prev, [productId]: 1 }));
      setQuantityErrors(prev => ({ ...prev, [productId]: 'Minimum quantity is 1.' }));
    } else if (newQty > stock) {
      // Cap at max stock if input exceeds it
      setSelectedProducts(prev => ({ ...prev, [productId]: stock }));
      setQuantityErrors(prev => ({ ...prev, [productId]: `Not enough stock. Max: ${stock}` }));
    } else {
      // Valid quantity
      setSelectedProducts(prev => ({ ...prev, [productId]: newQty }));
      setQuantityErrors(prev => ({ ...prev, [productId]: null })); // Clear error for this item
    }
  };

  // Handle quantity changes from + and - buttons
  const updateQuantity = (productId, amount) => {
    const productInStock = products.find(p => p._id === productId);
    const stock = productInStock ? productInStock.quantity : 0;

    setSelectedProducts(prev => {
      const currentQty = prev[productId] || 0;
      const newQty = Math.max(1, Math.min(currentQty + amount, stock));
      
      // Clear any existing errors when using buttons
      if (quantityErrors[productId]) {
        setQuantityErrors(prev => ({ ...prev, [productId]: null }));
      }
      
      return { ...prev, [productId]: newQty };
    });
  };
  
  // Handle saving the selection and proceeding to billing
  const handleSaveAndProceed = () => {
    setError(''); // Clear general errors

    // 1. Check if any product is selected
    if (Object.keys(selectedProducts).length === 0) {
      setError('Please select at least one product to proceed.');
      return;
    }

    // 2. Check for invalid quantities (empty strings or zero)
    const hasInvalidQuantity = Object.entries(selectedProducts).some(([id, qty]) => {
      const isInvalid = qty === '' || parseInt(qty, 10) <= 0;
      if (isInvalid) {
        setQuantityErrors(prev => ({ ...prev, [id]: 'Quantity must be greater than 0.' }));
      }
      return isInvalid;
    });

    if (hasInvalidQuantity) {
      setError('Please ensure all selected products have a valid quantity.');
      return;
    }

    const productsForBilling = Object.entries(selectedProducts).map(([id, quantity]) => {
        const product = products.find(p => p._id === id);
        // --- FIX: Explicitly map the fields to ensure correctness ---
        return { 
            productId: product._id, // Use a separate field for the original product ID
            productName: product.productName,
            price: product.price,
            quantity: quantity 
        };
    });

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
        <button className="back-link" onClick={() => {
          if (user?.role === 'employee') {
            navigate('/employee-dashboard/events');
          } else {
            navigate('/events');
          }
        }}>
          ← Back to the calendar of events
        </button>
        <div className="selection-card">
          <h3>List of Available Flowers</h3>
          <div className="selection-list">
            {error && <p className="error-message">{error}</p>}
            {!error && products.length === 0 && <p className="info-message">No flowers are currently available in the inventory.</p>}
            {products.map(product => (
              <div key={product._id} className={`selection-item-row ${quantityErrors[product._id] ? 'has-error' : ''}`}>
                <input
                  type="checkbox"
                  id={`product-${product._id}`}
                  checked={!!selectedProducts[product._id]}
                  onChange={(e) => handleProductSelect(product, e.target.checked)}
                  disabled={product.quantity === 0 && !selectedProducts[product._id]}
                />
                {/* --- UPDATED: Added a container for better layout --- */}
                <div className="product-info">
                  <label htmlFor={`product-${product._id}`}>{product.productName}</label>
                  <div className="product-sub-info">
                    <span>₱{(product.price || 0).toFixed(2)}</span>
                    <span>{product.quantity} in stock</span>
                  </div>
                  {quantityErrors[product._id] && <span className="quantity-error-text">{quantityErrors[product._id]}</span>}
                </div>
                {selectedProducts[product._id] !== undefined && (
                  <div className="quantity-controls">
                    <button onClick={() => updateQuantity(product._id, -1)}>-</button>
                    <input 
                      type="number"
                      className="quantity-input"
                      value={selectedProducts[product._id]}
                      onChange={(e) => handleQuantityChange(product._id, e.target.value)}
                      min="1"
                      max={product.quantity}
                      step="1"
                    />
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
