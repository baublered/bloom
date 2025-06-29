import axios from 'axios';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Retail.css';
import Sidebar from './Sidebar';
import EmployeeSidebar from './EmployeeSidebar';
import UserProfile from './UserProfile';
import { useRoleBasedNavigation } from '../utils/navigation';

const Retail = () => {
  const navigate = useNavigate();
  const { getNavigationPath, isEmployeeDashboard } = useRoleBasedNavigation();
  const [allProducts, setAllProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState([]);
  const [error, setError] = useState('');
  
  const [bouquetFlowers, setBouquetFlowers] = useState({});
  const [makeBouquet, setMakeBouquet] = useState(false);
  
  const BOUQUET_MARKUP = 200; // Fixed markup for bouquet assembly

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get('/api/products');
        setAllProducts(response.data);
      } catch (err) {
        console.error("Error fetching products:", err);
        setError('Failed to load products. Please ensure the backend is running.');
      }
    };
    fetchProducts();
  }, []);

  const getFilteredProducts = (category) => {
    return allProducts.filter(p =>
      p.productCategory === category &&
      p.productName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };
  
  const flowerList = getFilteredProducts('Flowers');
  const addOnList = getFilteredProducts('Accessories');

  const handleFlowerCheck = (product, isChecked) => {
    setCart(prevCart => {
      if (isChecked) {
        if (!prevCart.find(item => item._id === product._id) && product.quantity > 0) {
          return [...prevCart, { ...product, quantity: 1, isAddOn: false }];
        }
        return prevCart;
      } else {
        return prevCart.filter(item => item._id !== product._id);
      }
    });
  };

  const updateFlowerQuantity = (productId, amount) => {
    const productInStock = allProducts.find(p => p._id === productId);
    const stock = productInStock ? productInStock.quantity : 0;
    setCart(prevCart => {
      const updatedCart = prevCart.map(item => {
        if (item._id === productId) {
          const newQuantity = Math.max(1, Math.min(item.quantity + amount, stock));
          return { ...item, quantity: newQuantity };
        }
        return item;
      }).filter(Boolean);
      return updatedCart;
    });
  };

  const handleAddOnCheck = (product, isChecked) => {
    setCart(prevCart => {
        if (isChecked) {
            return [...prevCart, { ...product, quantity: 1, isAddOn: true }];
        } else {
            return prevCart.filter(item => item._id !== product._id);
        }
    });
  };

  const handleBouquetFlowerSelect = (product, isChecked) => {
    setBouquetFlowers(prev => {
        const newSelection = {...prev};
        if(isChecked) {
            newSelection[product._id] = { ...product, quantity: 1 };
        } else {
            delete newSelection[product._id];
        }
        return newSelection;
    });
  }

  const updateBouquetFlowerQuantity = (productId, amount) => {
    setBouquetFlowers(prev => {
        const newSelection = {...prev};
        const item = newSelection[productId];
        if(item) {
            const newQuantity = Math.max(1, item.quantity + amount);
            newSelection[productId] = { ...item, quantity: newQuantity };
        }
        return newSelection;
    });
  }

  const addBouquetToCart = () => {
      if (Object.keys(bouquetFlowers).length === 0) {
          alert("Please select at least one flower for the bouquet.");
          return;
      }

      // Calculate total price of selected flowers
      const flowersTotal = Object.values(bouquetFlowers).reduce((total, flower) => {
          return total + (flower.price * flower.quantity);
      }, 0);

      // Calculate total quantity for bouquet name
      const totalFlowers = Object.values(bouquetFlowers).reduce((total, flower) => {
          return total + flower.quantity;
      }, 0);

      const bouquetName = `Custom Bouquet (${totalFlowers} pcs)`;

      // Add bouquet markup
      const totalPrice = flowersTotal + BOUQUET_MARKUP;

      const newBouquet = {
          _id: `bouquet-${Date.now()}`,
          productName: bouquetName,
          price: totalPrice,
          quantity: 1,
          isBouquet: true,
          components: Object.values(bouquetFlowers),
          bouquetMarkup: BOUQUET_MARKUP,
          flowersTotal: flowersTotal
      };
      
      // Add new bouquet to existing cart without removing other items
      setCart(prevCart => [...prevCart, newBouquet]);

      setBouquetFlowers({});
      setMakeBouquet(false);
  }

  const totalAmount = cart.reduce((total, item) => (total + (item.price || 0) * (item.quantity || 1)), 0);

  const handleProceedToBilling = () => {
    sessionStorage.setItem('cart', JSON.stringify(cart));
    sessionStorage.setItem('totalAmount', totalAmount);
    navigate(getNavigationPath('/billing-retail'), { state: { cart, totalAmount } });
  };

  const isItemInCart = (productId) => cart.some(item => item._id === productId);

  return (
    <div className="retail-page-layout">
      {/* Don't render sidebar when in employee dashboard - EmployeeDashboard handles it */}
      {!isEmployeeDashboard && <Sidebar />}
      <main className="retail-page">
        {/* Only render header when not in employee dashboard */}
        {!isEmployeeDashboard && (
          <header className="retail-page-header">
            <h1>Transaction</h1>
            <div className="user-profile"><UserProfile /></div>
          </header>
        )}

        <div className="retail-main-content">
          <div className="retail-card">
            <header className="retail-card-header">
              <h2>Retail Transaction</h2>
              <div className="search-container">
                <input type="text" placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
              </div>
            </header>
            
            <div className="pos-layout">
              {/* Left Side - Products */}
              <div className="pos-products-section">
                {/* Bouquet Builder */}
                <div className="pos-section">
                  <div className="pos-section-header">
                    <h3>🌹 Build a Bouquet</h3>
                  </div>
                  <div className="bouquet-toggle-card">
                    <label className="bouquet-toggle-label">
                      <input 
                        type="checkbox" 
                        checked={makeBouquet} 
                        onChange={(e) => setMakeBouquet(e.target.checked)} 
                      />
                      <span className="toggle-text">
                        Turn selected flowers into a bouquet 
                        <span className="markup-fee">(+₱{BOUQUET_MARKUP} assembly fee)</span>
                      </span>
                    </label>
                  </div>
                  
                  {makeBouquet && (
                    <div className="bouquet-flowers-grid">
                      <p className="selection-info">Select flowers for your bouquet:</p>
                      <div className="products-grid">
                        {flowerList.map(product => {
                          const isSelected = !!bouquetFlowers[product._id];
                          return (
                            <div key={`bouquet-${product._id}`} className={`product-card ${isSelected ? 'selected' : ''} ${product.quantity === 0 ? 'out-of-stock' : ''}`}>
                              <div className="product-card-header">
                                <input 
                                  type="checkbox" 
                                  id={`bouquet-flower-${product._id}`} 
                                  checked={isSelected} 
                                  onChange={(e) => handleBouquetFlowerSelect(product, e.target.checked)} 
                                  disabled={product.quantity === 0}
                                />
                                <label htmlFor={`bouquet-flower-${product._id}`} className="product-name">
                                  {product.productName}
                                </label>
                              </div>
                              <div className="product-info">
                                <span className="price">₱{(product.price || 0).toFixed(2)}</span>
                                <span className="stock">{product.quantity} in stock</span>
                              </div>
                              {isSelected && (
                                <div className="quantity-selector">
                                  <button 
                                    type="button"
                                    onClick={() => updateBouquetFlowerQuantity(product._id, -1)}
                                    className="qty-btn"
                                  >
                                    -
                                  </button>
                                  <span className="qty-display">{bouquetFlowers[product._id].quantity}</span>
                                  <button 
                                    type="button"
                                    onClick={() => updateBouquetFlowerQuantity(product._id, 1)}
                                    className="qty-btn"
                                  >
                                    +
                                  </button>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                      
                      {Object.keys(bouquetFlowers).length > 0 && (
                        <div className="bouquet-summary">
                          <div className="bouquet-pricing">
                            <div className="pricing-row">
                              <span>Flowers Total:</span>
                              <span>₱{Object.values(bouquetFlowers).reduce((total, flower) => total + (flower.price * flower.quantity), 0).toFixed(2)}</span>
                            </div>
                            <div className="pricing-row">
                              <span>Assembly Fee:</span>
                              <span>₱{BOUQUET_MARKUP.toFixed(2)}</span>
                            </div>
                            <div className="pricing-row total">
                              <span>Total Bouquet Price:</span>
                              <span>₱{(Object.values(bouquetFlowers).reduce((total, flower) => total + (flower.price * flower.quantity), 0) + BOUQUET_MARKUP).toFixed(2)}</span>
                            </div>
                          </div>
                          <button 
                            onClick={addBouquetToCart} 
                            disabled={Object.keys(bouquetFlowers).length === 0}
                            className="add-bouquet-btn"
                          >
                            ➕ Add Bouquet to Cart
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Individual Flowers */}
                <div className="pos-section">
                  <div className="pos-section-header">
                    <h3>🌸 Individual Flowers</h3>
                  </div>
                  <div className="products-grid">
                    {flowerList.map(product => {
                      const cartItem = cart.find(item => item._id === product._id && !item.isBouquet);
                      return (
                        <div key={product._id} className={`product-card ${cartItem ? 'in-cart' : ''} ${product.quantity === 0 ? 'out-of-stock' : ''}`}>
                          <div className="product-card-header">
                            <input 
                              type="checkbox" 
                              id={`flower-${product._id}`} 
                              checked={!!cartItem} 
                              disabled={product.quantity === 0 && !cartItem} 
                              onChange={(e) => handleFlowerCheck(product, e.target.checked)} 
                            />
                            <label htmlFor={`flower-${product._id}`} className="product-name">
                              {product.productName}
                            </label>
                          </div>
                          <div className="product-info">
                            <span className="price">₱{(product.price || 0).toFixed(2)}</span>
                            <span className="stock">{product.quantity} in stock</span>
                          </div>
                          {cartItem && (
                            <div className="quantity-selector">
                              <button 
                                type="button"
                                onClick={() => updateFlowerQuantity(product._id, -1)}
                                className="qty-btn"
                              >
                                -
                              </button>
                              <span className="qty-display">{cartItem.quantity}</span>
                              <button 
                                type="button"
                                onClick={() => updateFlowerQuantity(product._id, 1)}
                                className="qty-btn"
                              >
                                +
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Add-ons */}
                <div className="pos-section">
                  <div className="pos-section-header">
                    <h3>✨ Add-ons & Accessories</h3>
                  </div>
                  <div className="products-grid">
                    {addOnList.map(product => (
                      <div key={product._id} className={`product-card ${isItemInCart(product._id) ? 'in-cart' : ''} ${product.quantity === 0 ? 'out-of-stock' : ''}`}>
                        <div className="product-card-header">
                          <input 
                            type="checkbox" 
                            id={`addon-${product._id}`} 
                            checked={isItemInCart(product._id)} 
                            disabled={product.quantity === 0} 
                            onChange={(e) => handleAddOnCheck(product, e.target.checked)} 
                          />
                          <label htmlFor={`addon-${product._id}`} className="product-name">
                            {product.productName}
                          </label>
                        </div>
                        <div className="product-info">
                          <span className="stock">{product.quantity} in stock</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Side - Cart */}
              <div className="pos-cart-section">
                <div className="cart-header">
                  <h3>🛒 Cart</h3>
                  <span className="cart-count">{cart.length} items</span>
                </div>
                
                <div className="cart-items">
                  {cart.length === 0 ? (
                    <div className="empty-cart">
                      <p>Cart is empty</p>
                      <small>Add items to get started</small>
                    </div>
                  ) : (
                    cart.map((item, index) => (
                      <div key={index} className="cart-item">
                        <div className="cart-item-details">
                          <span className="item-name">{item.productName}</span>
                          {item.isBouquet && (
                            <div className="bouquet-details">
                              <small>Components: {item.components?.map(c => `${c.productName} (${c.quantity})`).join(', ')}</small>
                              <small>Assembly Fee: ₱{item.bouquetMarkup}</small>
                            </div>
                          )}
                        </div>
                        <div className="cart-item-pricing">
                          <span className="item-quantity">Qty: {item.quantity}</span>
                          <span className="item-total">₱{((item.price || 0) * (item.quantity || 1)).toFixed(2)}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className="cart-footer">
                  <div className="cart-total">
                    <div className="total-label">Total Amount</div>
                    <div className="total-amount">₱{totalAmount.toFixed(2)}</div>
                  </div>
                  <button 
                    className="checkout-btn" 
                    disabled={cart.length === 0} 
                    onClick={handleProceedToBilling}
                  >
                    � Proceed to Checkout
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Retail;
