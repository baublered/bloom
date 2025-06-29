import axios from 'axios';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Retail.css'; // You will need this CSS file

const Retail = () => {
  const navigate = useNavigate();
  const [allProducts, setAllProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');

  // Fetch all products from the backend on component mount
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get('/api/products');
        setAllProducts(response.data);
        setFilteredProducts(response.data);
      } catch (err) {
        console.error("Error fetching products:", err);
        setError('Failed to load products. Please ensure the backend is running.');
      }
    };
    fetchProducts();
  }, []);
  
  // Handle filtering and searching
  useEffect(() => {
    let result = allProducts;

    // Filter by category using the correct field 'productCategory'
    if (activeCategory !== 'All') {
      result = result.filter(p => p.productCategory === activeCategory);
    }
    
    // Filter by search term using the correct field 'productName'
    if (searchTerm) {
      result = result.filter(p => 
        p.productName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    setFilteredProducts(result);
  }, [searchTerm, activeCategory, allProducts]);

  // Add a product to the cart or increment its quantity
  const addToCart = (product) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item._id === product._id);
      if (existingItem) {
        // Increment quantity if item is already in cart
        return prevCart.map(item => 
          item._id === product._id ? { ...item, quantity: item.quantity + 1 } : item
        );
      } else {
        // Add new item to cart with quantity 1
        return [...prevCart, { ...product, quantity: 1 }];
      }
    });
  };

  // Update quantity of an item in the cart
  const updateCartQuantity = (productId, newQuantity) => {
    setCart(prevCart => {
      if (newQuantity <= 0) {
        // Remove item if quantity is 0 or less
        return prevCart.filter(item => item._id !== productId);
      }
      return prevCart.map(item => 
        item._id === productId ? { ...item, quantity: newQuantity } : item
      );
    });
  };

  // Calculate total amount
  const totalAmount = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  
  const handleProceedToPayment = () => {
      navigate('/billing-retail', { state: { cart, totalAmount } });
  }

  return (
    <div className="retail-page-layout">
      {/* Products Section (Left) */}
      <main className="products-section">
        <header className="products-header">
          <h1>Retail Transaction</h1>
          <div className="search-and-filter">
            <input 
              type="text" 
              placeholder="Search products..." 
              className="search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </header>

        <div className="category-tabs">
          <button onClick={() => setActiveCategory('All')} className={activeCategory === 'All' ? 'active' : ''}>All</button>
          <button onClick={() => setActiveCategory('Flowers')} className={activeCategory === 'Flowers' ? 'active' : ''}>Flowers</button>
          <button onClick={() => setActiveCategory('Accessories')} className={activeCategory === 'Accessories' ? 'active' : ''}>Accessories</button>
        </div>

        {error && <p className="error-message">{error}</p>}

        <div className="product-grid">
          {filteredProducts.map(product => (
            <div key={product._id} className="product-card" onClick={() => addToCart(product)}>
              <img src={product.image || 'https://placehold.co/300x200/EAEBF0/535978?text=BloomTrack'} alt={product.productName} className="product-image" />
              <div className="product-card-info">
                <h3 className="product-card-name">{product.productName}</h3>
                <p className="product-card-price">₱{product.price.toFixed(2)}</p>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Order Summary Section (Right) */}
      <aside className="order-summary-section">
        <h2>Order Summary</h2>
        <div className="cart-items">
          {cart.length === 0 ? (
            <p className="empty-cart-message">Your cart is empty.</p>
          ) : (
            cart.map(item => (
              <div key={item._id} className="cart-item">
                <div className="cart-item-info">
                  <p className="cart-item-name">{item.productName}</p>
                  <p className="cart-item-price">₱{item.price.toFixed(2)}</p>
                </div>
                <div className="cart-item-controls">
                  <button onClick={() => updateCartQuantity(item._id, item.quantity - 1)}>-</button>
                  <span>{item.quantity}</span>
                  <button onClick={() => updateCartQuantity(item._id, item.quantity + 1)}>+</button>
                </div>
                <p className="cart-item-total">₱{(item.price * item.quantity).toFixed(2)}</p>
              </div>
            ))
          )}
        </div>
        <div className="order-total">
          <p>Total</p>
          <p>₱{totalAmount.toFixed(2)}</p>
        </div>
        <button 
            className="proceed-button" 
            disabled={cart.length === 0}
            onClick={handleProceedToPayment}
        >
          Proceed to Payment
        </button>
      </aside>
    </div>
  );
};

export default Retail;
