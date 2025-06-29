import axios from 'axios';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './ProductSelection.css';

const ProductSelection = () => {
  const [products, setProducts] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get('http://localhost:5000/api/products');
        setProducts(response.data);
        // Initialize selected products with 0 quantity
        setSelectedProducts(response.data.map(product => ({
          ...product,
          selectedQuantity: 0
        })));
      } catch (err) {
        console.error('Error fetching product data:', err);
        setError('Failed to load products. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleQuantityChange = (productId, change) => {
    setSelectedProducts(prev =>
      prev.map(product => {
        if (product.id === productId) {
          const newQuantity = product.selectedQuantity + change;
          // Ensure quantity is between 0 and availableQuantity
          const validatedQuantity = Math.max(0, Math.min(newQuantity, product.availableQuantity));
          return {
            ...product,
            selectedQuantity: validatedQuantity
          };
        }
        return product;
      })
    );
  };

  const handleSave = () => {
    const selectedItems = selectedProducts.filter(product => product.selectedQuantity > 0);
    if (selectedItems.length === 0) {
      alert('Please select at least one product');
      return;
    }
    localStorage.setItem('selectedProducts', JSON.stringify(selectedItems));
    navigate('/billing');
  };

  if (isLoading) {
    return <div className="loading">Loading products...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="product-selection-page">
      <header className="product-selection-header">
        <h1>Products</h1>
        <button onClick={() => navigate('/')}>← Back to the calendar of events</button>
      </header>

      <section className="product-selection-content">
        <h2>List of Available Flowers</h2>

        {products.length === 0 ? (
          <p>No products available at the moment.</p>
        ) : (
          <div className="product-list">
            {selectedProducts.map(product => (
              <div key={product.id} className="product-item">
                <h3>{product.name}</h3>
                <p className="inventory-info">
                  Available: {product.availableQuantity} {product.availableQuantity === 1 ? 'piece' : 'pieces'}
                </p>
                <p>Price: ₱{product.price.toFixed(2)} per piece</p>
                <p className="subtotal">
                  Subtotal: ₱{(product.selectedQuantity * product.price).toFixed(2)}
                </p>

                <div className="quantity-controls">
                  <button
                    onClick={() => handleQuantityChange(product.id, -1)}
                    disabled={product.selectedQuantity <= 0}
                    aria-label="Decrease quantity"
                  >
                    -
                  </button>
                  
                  <span>{product.selectedQuantity}</span>
                  
                  <button
                    onClick={() => handleQuantityChange(product.id, 1)}
                    disabled={product.selectedQuantity >= product.availableQuantity}
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <button 
          onClick={handleSave} 
          className="save-button"
          disabled={!selectedProducts.some(product => product.selectedQuantity > 0)}
        >
          Save
        </button>
      </section>
    </div>
  );
};

export default ProductSelection;