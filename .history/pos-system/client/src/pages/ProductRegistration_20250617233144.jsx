import axios from 'axios'; // Import axios for making API requests
import { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './ProductRegistration.css';

const ProductRegistration = () => {
  const initialFormState = {
    productName: '',
    productCategory: '',
    price: '',
    quantity: '',
    supplierName: '',
    dateReceived: new Date(),
    lifespan: '',
  };

  const [product, setProduct] = useState(initialFormState);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  
  // State for loading and status messages
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState({ type: '', text: '' });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProduct((prev) => ({ ...prev, [name]: value }));
  };
  
  const handleCategorySelect = (category) => {
    setProduct((prev) => ({ ...prev, productCategory: category }));
    setIsCategoryOpen(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setStatusMessage({ type: '', text: '' }); // Clear previous message

    try {
      // Send a POST request to the backend endpoint
      const response = await axios.post('/api/products/add', product);

      // On success, show a success message and reset the form
      setStatusMessage({ type: 'success', text: '✅ Product added successfully!' });
      setProduct(initialFormState); // Clear the form fields

    } catch (error) {
      console.error('Error adding product:', error);
      // On failure, show an error message
      const message = error.response?.data?.message || 'Failed to add product. Please try again.';
      setStatusMessage({ type: 'error', text: `❌ ${message}` });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="product-registration-page">
      <header className="page-header">
        <h1>Product Registration</h1>
        <div className="user-profile-button">
            <span className="user-icon">👤</span>
            <span>User Profile</span>
            <span className="dropdown-arrow">▼</span>
        </div>
      </header>

      <div className="registration-card">
        <div className="card-header">
          <h2>Register a Product</h2>
          <p className="logo-text">BloomTrack</p>
        </div>

        <form onSubmit={handleSubmit} className="registration-form">
          {/* Display Status Message */}
          {statusMessage.text && (
            <div className={`status-message ${statusMessage.type}`}>
              {statusMessage.text}
            </div>
          )}

          <div className="form-row">
            <div className="input-group full-width">
              <input type="text" name="productName" placeholder="Product Name" value={product.productName} onChange={handleChange} className="registration-input" required />
            </div>
          </div>

          <div className="form-row">
            <div className="input-group full-width category-dropdown">
              <div className="registration-input dropdown-toggle" onClick={() => setIsCategoryOpen(!isCategoryOpen)}>
                {product.productCategory || 'Product Category'}
                <span className="dropdown-arrow">{isCategoryOpen ? '▲' : '▼'}</span>
              </div>
              {isCategoryOpen && (
                <div className="dropdown-menu">
                  <div className="dropdown-item" onClick={() => handleCategorySelect('Flowers')}>Flowers</div>
                  <div className="dropdown-item" onClick={() => handleCategorySelect('Accessories')}>Accessories</div>
                </div>
              )}
            </div>
          </div>
          
          <div className="form-row">
            <div className="input-group">
              <input type="number" name="price" placeholder="Price" value={product.price} onChange={handleChange} className="registration-input" required />
            </div>
            <div className="input-group">
              <input type="number" name="quantity" placeholder="Qty" value={product.quantity} onChange={handleChange} className="registration-input" required />
            </div>
          </div>
          
          <div className="form-row">
            <div className="input-group full-width">
              <input type="text" name="supplierName" placeholder="Supplier Name" value={product.supplierName} onChange={handleChange} className="registration-input" required />
            </div>
          </div>
          
          <div className="form-row">
            <div className="input-group">
                <DatePicker
                    selected={product.dateReceived}
                    onChange={(date) => setProduct(prev => ({...prev, dateReceived: date}))}
                    className="registration-input"
                    dateFormat="MMMM d, yyyy"
                />
            </div>
            <div className="input-group">
              <input type="text" name="lifespan" placeholder="Lifespan" value={product.lifespan} onChange={handleChange} className="registration-input" />
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" className="register-button" disabled={isLoading}>
              {isLoading ? 'Registering...' : 'Register Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductRegistration;
