import axios from 'axios';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Retail.css';
import UserProfile from './UserProfile';

const Retail = () => {
  const navigate = useNavigate();
  const [allProducts, setAllProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState([]);
  const [error, setError] = useState('');

  // Fetch all products from the backend on component mount
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

  // Functions to filter products based on search and category
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
        // Add flower to cart with quantity 1 if it's not already there and in stock
        if (!prevCart.find(item => item._id === product._id) && product.quantity > 0) {
          return [...prevCart, { ...product, quantity: 1 }];
        }
        return prevCart;
      } else {
        // Remove flower from cart
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
          // Ensure new quantity is between 1 and available stock
          const newQuantity = Math.max(1, Math.min(item.quantity + amount, stock));
          return { ...item, quantity: newQuantity };
        }
        return item;
      });
      return updatedCart;
    });
  };

  const handleAddOnCheck = (product, isChecked) => {
    setCart(prevCart => {
        if (isChecked) {
            return [...prevCart, { ...product, quantity: 1 }];
        } else {
            return prevCart.filter(item => item._id !== product._id);
        }
    });
  };

  const totalAmount = cart.reduce((total, item) => (total + (item.price || 0) * (item.quantity || 1)), 0);

  const handleProceedToBilling = () => {
    // Save cart to session storage to make it available on page refresh
    sessionStorage.setItem('cart', JSON.stringify(cart));
    sessionStorage.setItem('totalAmount', totalAmount);

    navigate('/billing-retail', { state: { cart, totalAmount } });
  };

  // Helper to check if an item is in the cart
  const isItemInCart = (productId) => cart.some(item => item._id === productId);

  return (
    <div className="retail-page">
      <header className="retail-page-header">
        <h1>Transaction</h1>
        <div className="user-profile">
          <UserProfile />
        </div>
      </header>

      <main className="retail-main-content">
        <div className="retail-card">
          <header className="retail-card-header">
            <h2>Retail Transaction</h2>
            <div className="search-container">
              <input 
                type="text" 
                placeholder="Search..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </header>
          
          <div className="transaction-body">
            <nav className="category-sidebar">
              <div className="tab active">Flowers</div>
            </nav>

            <div className="product-selection-area">
              <div className="product-list-card">
                <h3>List of Available Flowers</h3>
                {flowerList.map(product => {
                  const cartItem = cart.find(item => item._id === product._id);
                  return (
                    <div key={product._id} className="product-item-row">
                      <input 
                        type="checkbox" 
                        id={`flower-${product._id}`}
                        checked={!!cartItem}
                        disabled={product.quantity === 0 && !cartItem}
                        onChange={(e) => handleFlowerCheck(product, e.target.checked)}
                      />
                      <div className="product-details">
                        <label htmlFor={`flower-${product._id}`}>{product.productName}</label>
                        <div className="product-sub-details">
                          <span>₱{(product.price || 0).toFixed(2)}</span>
                          <span>{product.quantity} in stock</span>
                        </div>
                      </div>
                      {cartItem && (
                        <div className="quantity-controls">
                          <button onClick={() => updateFlowerQuantity(product._id, -1)}>-</button>
                          <span>{cartItem.quantity}</span>
                          <button onClick={() => updateFlowerQuantity(product._id, 1)}>+</button>
                        </div>
                      )}
                    </div>
                  );
                })}

                <h3 className="addons-title">Add-ons</h3>
                <div className="addons-grid">
                    {addOnList.map(product => (
                        <div key={product._id} className="addon-item">
                            <input 
                                type="checkbox"
                                id={`addon-${product._id}`}
                                checked={isItemInCart(product._id)}
                                disabled={product.quantity === 0}
                                onChange={(e) => handleAddOnCheck(product, e.target.checked)}
                            />
                            <label htmlFor={`addon-${product._id}`}>{product.productName}</label>
                        </div>
                    ))}
                </div>
              </div>
              
              <footer className="billing-footer">
                <div className="total-amount">
                  Amount: <span>₱{totalAmount.toFixed(2)}</span>
                </div>
                <button 
                  className="proceed-button" 
                  disabled={cart.length === 0}
                  onClick={handleProceedToBilling}
                >
                  <span className="cart-icon">🛒</span>
                  Proceed to Billing
                </button>
              </footer>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Retail;
