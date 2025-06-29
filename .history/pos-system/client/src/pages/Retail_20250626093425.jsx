import axios from 'axios';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Retail.css';
import Sidebar from './Sidebar'; // --- NEW: Import the Sidebar ---
import UserProfile from './UserProfile';

const Retail = () => {
  const navigate = useNavigate();
  const [allProducts, setAllProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState([]);
  const [error, setError] = useState('');
  
  const [activeTab, setActiveTab] = useState('Flowers');
  const [bouquetSize, setBouquetSize] = useState('3');
  const [customBouquetSize, setCustomBouquetSize] = useState('');
  const [bouquetFlowers, setBouquetFlowers] = useState({});
  const [customBouquetPrice, setCustomBouquetPrice] = useState('');

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
          return [...prevCart, { ...product, quantity: 1 }];
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
      const bouquetName = `Custom Bouquet (${bouquetSize === 'custom' ? customBouquetSize : bouquetSize} pcs)`;
      const price = parseFloat(customBouquetPrice);

      if (Object.keys(bouquetFlowers).length === 0) {
          alert("Please select at least one flower for the bouquet.");
          return;
      }
      if (isNaN(price) || price <= 0) {
          alert("Please set a valid price for the customized bouquet.");
          return;
      }

      const newBouquet = {
          _id: `bouquet-${Date.now()}`,
          productName: bouquetName,
          price: price,
          quantity: 1,
          isBouquet: true,
          components: Object.values(bouquetFlowers),
      };
      setCart(prevCart => [...prevCart, newBouquet]);
      setBouquetFlowers({});
      setCustomBouquetPrice('');
  }

  const totalAmount = cart.reduce((total, item) => (total + (item.price || 0) * (item.quantity || 1)), 0);

  const handleProceedToBilling = () => {
    sessionStorage.setItem('cart', JSON.stringify(cart));
    sessionStorage.setItem('totalAmount', totalAmount);
    navigate('/billing-retail', { state: { cart, totalAmount } });
  };

  const isItemInCart = (productId) => cart.some(item => item._id === productId);

  return (
    // --- NEW: Main layout container ---
    <div className="retail-page-layout">
      <Sidebar />
      <main className="retail-page">
        <header className="retail-page-header">
          <h1>Transaction</h1>
          <div className="user-profile"><UserProfile /></div>
        </header>

        <div className="retail-main-content">
          <div className="retail-card">
            <header className="retail-card-header">
              <h2>Retail Transaction</h2>
              <div className="search-container">
                <input type="text" placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
              </div>
            </header>
            
            <div className="transaction-body">
              <nav className="category-sidebar">
                <div className={`tab ${activeTab === 'Flowers' ? 'active' : ''}`} onClick={() => setActiveTab('Flowers')}>Flowers</div>
                <div className={`tab ${activeTab === 'Bouquet' ? 'active' : ''}`} onClick={() => setActiveTab('Bouquet')}>Bouquet</div>
              </nav>

              <div className="product-selection-area">
                {activeTab === 'Flowers' && (
                  <div className="product-list-card">
                    <h3>List of Available Flowers</h3>
                    {flowerList.map(product => {
                      const cartItem = cart.find(item => item._id === product._id);
                      return (
                        <div key={product._id} className="product-item-row">
                          <input type="checkbox" id={`flower-${product._id}`} checked={!!cartItem} disabled={product.quantity === 0 && !cartItem} onChange={(e) => handleFlowerCheck(product, e.target.checked)} />
                          <div className="product-details">
                            <label htmlFor={`flower-${product._id}`}>{product.productName}</label>
                            <div className="product-sub-details">
                              <span>₱{(product.price || 0).toFixed(2)}</span>
                              <span>{product.quantity} in stock</span>
                            </div>
                          </div>
                          {cartItem && <div className="quantity-controls"><button onClick={() => updateFlowerQuantity(product._id, -1)}>-</button><span>{cartItem.quantity}</span><button onClick={() => updateFlowerQuantity(product._id, 1)}>+</button></div>}
                        </div>
                      );
                    })}

                    <h3 className="addons-title">Add-ons</h3>
                    <div className="addons-grid">
                        {addOnList.map(product => (
                            <div key={product._id} className="addon-item">
                                <input type="checkbox" id={`addon-${product._id}`} checked={isItemInCart(product._id)} disabled={product.quantity === 0} onChange={(e) => handleAddOnCheck(product, e.target.checked)} />
                                <label htmlFor={`addon-${product._id}`}>{product.productName}</label>
                            </div>
                        ))}
                    </div>
                  </div>
                )}
                
                {activeTab === 'Bouquet' && (
                    <div className="product-list-card">
                        <h3>Bouquet</h3>
                        <div className="bouquet-options">
                            <label><input type="radio" name="bouquetSize" value="3" checked={bouquetSize === '3'} onChange={(e) => setBouquetSize(e.target.value)} /> 3 pcs.</label>
                            <label><input type="radio" name="bouquetSize" value="6" checked={bouquetSize === '6'} onChange={(e) => setBouquetSize(e.target.value)} /> 6 pcs.</label>
                            <label><input type="radio" name="bouquetSize" value="12" checked={bouquetSize === '12'} onChange={(e) => setBouquetSize(e.target.value)} /> 12 pcs.</label>
                            <label className="customize-label"><input type="radio" name="bouquetSize" value="custom" checked={bouquetSize === 'custom'} onChange={(e) => setBouquetSize(e.target.value)} /> Customize <input type="number" className="customize-input" value={customBouquetSize} onChange={(e) => setCustomBouquetSize(e.target.value)} disabled={bouquetSize !== 'custom'} /></label>
                        </div>
                        
                        {flowerList.map(product => {
                            const isSelected = !!bouquetFlowers[product._id];
                            return (
                              <div key={product._id} className="product-item-row">
                                  <input type="checkbox" id={`bouquet-flower-${product._id}`} checked={isSelected} onChange={(e) => handleBouquetFlowerSelect(product, e.target.checked)} />
                                  <label htmlFor={`bouquet-flower-${product._id}`}>{product.productName}</label>
                                  {isSelected && <div className="quantity-controls"><button onClick={() => updateBouquetFlowerQuantity(product._id, -1)}>-</button><span>{bouquetFlowers[product._id].quantity}</span><button onClick={() => updateBouquetFlowerQuantity(product._id, 1)}>+</button></div>}
                              </div>
                            );
                        })}
                        
                        <div className="set-price-section">
                            <span>Set price for customized bouquet:</span>
                            <input type="number" placeholder="Price" value={customBouquetPrice} onChange={(e) => setCustomBouquetPrice(e.target.value)} />
                            <button onClick={addBouquetToCart}>Add Bouquet</button>
                        </div>
                    </div>
                )}
                
                <footer className="billing-footer">
                  <div className="total-amount">Amount: <span>₱{totalAmount.toFixed(2)}</span></div>
                  <button className="proceed-button" disabled={cart.length === 0} onClick={handleProceedToBilling}>
                    <span className="cart-icon">🛒</span> Proceed to Billing
                  </button>
                </footer>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Retail;
