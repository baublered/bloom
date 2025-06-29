import axios from 'axios'; // Import axios for API requests
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom'; // For navigating back to Events or Billing page
import './ProductSelection.css';

const ProductSelection = () => {
  const [products, setProducts] = useState([]);  // State to store fetched products
  const [selectedProducts, setSelectedProducts] = useState([]); // State to store selected quantities
  const navigate = useNavigate();

  // Fetch product data from the API on component mount
  useEffect(() => {
    axios.get('http://localhost:5000/api/products') // API URL
      .then(response => {
        setProducts(response.data); // Set the fetched product data to state
        // Initialize the selectedProducts state with default selected quantity 0 for each product
        const initialSelectedProducts = response.data.map(product => ({
          ...product,
          selectedQuantity: 0 // Set default selected quantity to 0
        }));
        setSelectedProducts(initialSelectedProducts);
      })
      .catch(error => {
        console.error('Error fetching product data:', error);
      });
  }, []);

  // Handle quantity change (+ or -) for each product
  const handleQuantityChange = (productId, change) => {
    // Update the selected quantity for the product clicked
    setSelectedProducts(prev =>
      prev.map(product =>
        product.id === productId
          ? {
              ...product,
              selectedQuantity: Math.max(0, Math.min(product.availableQuantity, product.selectedQuantity + change)) // Ensure quantity doesn't exceed availableQuantity
            }
          : product
      )
    );
  };

  // Handle the "Save" button click to save selected products
  const handleSave = () => {
    const selectedItems = selectedProducts.filter(product => product.selectedQuantity > 0); // Filter out products with 0 quantity
    localStorage.setItem('selectedProducts', JSON.stringify(selectedItems)); // Save selected products to localStorage or backend
    navigate('/billing'); // Navigate to the billing page
  };

  return (
    <div className="product-selection-page">
      <header className="product-selection-header">
        <h1>Products</h1>
        <button onClick={() => navigate('/')}>← Back to the calendar of events</button>
      </header>

      <section className="product-selection-content">
        <h2>List of Available Flowers</h2>

        <div className="product-list">
          {products.map(product => (
            <div key={product.id} className="product-item">
              <h3>{product.name}</h3>
              <p>Available Quantity: {product.availableQuantity}</p>
              <p>Price per Flower: ₱{product.price}</p>

              <div className="quantity-controls">
                {/* "-" button to decrease quantity */}
                <button 
                  onClick={() => handleQuantityChange(product.id, -1)} 
                  disabled={product.selectedQuantity === 0} // Disable if selected quantity is 0
                >
                  -
                </button>

                {/* Display the selected quantity */}
                <span>{product.selectedQuantity || 0}</span>

                {/* "+" button to increase quantity */}
                <button 
                  onClick={() => handleQuantityChange(product.id, 1)} 
                  disabled={product.selectedQuantity === product.availableQuantity} // Disable if selected quantity equals available quantity
                >
                  +
                </button>
              </div>
            </div>
          ))}
        </div>

        <button onClick={handleSave} className="save-button">
          Save
        </button>
      </section>
    </div>
  );
};

export default ProductSelection;