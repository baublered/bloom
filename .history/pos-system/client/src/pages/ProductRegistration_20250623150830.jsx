import axios from 'axios';
import { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useNavigate } from 'react-router-dom';
import './ProductRegistration.css';

const ProductRegistration = () => {
  const navigate = useNavigate();
  const initialFormState = {
    productName: '',
    productCategory: '',
    price: '',
    quantity: '',
    supplierName: '',
    dateReceived: new Date(),
    lifespanInDays: '',
  };

  const [product, setProduct] = useState(initialFormState);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  
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
    setStatusMessage({ type: '', text: '' });

    // Client-side validation to ensure a lifespan is entered.
    if (!product.lifespanInDays || parseInt(product.lifespanInDays) <= 0) {
        setStatusMessage({ type: 'error', text: '❌ Please enter a valid number for Lifespan.' });
        setIsLoading(false);
        return;
    }

    // --- FIX: Explicitly create a clean data object to send ---
    // This prevents any potential issues with the state object and ensures
    // only the required data is sent to the backend.
    const productData = {
        productName: product.productName,
        productCategory: product.productCategory,
        price: product.price,
        quantity: product.quantity,
        supplierName: product.supplierName,
        dateReceived: product.dateReceived,
        lifespanInDays: product.lifespanInDays,
    };

    try {
      // Send the clean productData object to the backend
      const response = await axios.post('/api/products/add', productData);
      setStatusMessage({ type: 'success', text: '✅ Product added successfully!' });
      setProduct(initialFormState);
    } catch (error) {
      console.error('Error adding product:', error);
      const message = error.response?.data?.message || 'Failed to add product.';
      setStatusMessage({ type: 'error', text: `❌ ${message}` });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="product-registration-page">
      <header className="page-header">
        <button className="back-arrow-button" onClick={() => navigate(-1)}>‹</button>
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
                <span className="dropdown-arrow-input">{isCategoryOpen ? '▲' : '▼'}</span>
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
                placeholderText="Date Received"
              />
            </div>
            <div className="input-group">
              <input type="number" name="lifespanInDays" placeholder="Lifespan (in days)" value={product.lifespanInDays} onChange={handleChange} className="registration-input" required min="1" />
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
