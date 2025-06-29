import axios from 'axios';
import { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useNavigate } from 'react-router-dom';
import './ProductRegistration.css';
import './Dashboard.css'; // Import dashboard styles for layout
import UserProfile from './UserProfile'; 
import Sidebar from './Sidebar'; // Add sidebar import

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
  const [validationErrors, setValidationErrors] = useState({});

  // Validation function
  const validateForm = () => {
    const errors = {};

    // Product Name validation
    if (!product.productName.trim()) {
      errors.productName = 'Product name is required';
    } else if (product.productName.trim().length < 2) {
      errors.productName = 'Product name must be at least 2 characters';
    } else if (product.productName.trim().length > 100) {
      errors.productName = 'Product name must be less than 100 characters';
    } else if (!/^[a-zA-Z0-9\s\-_&.()]+$/.test(product.productName.trim())) {
      errors.productName = 'Product name contains invalid characters';
    } else if (product.productName.trim().toLowerCase() === 'test' || product.productName.trim().toLowerCase() === 'sample') {
      errors.productName = 'Please enter a valid product name';
    }

    // Product Category validation
    if (!product.productCategory) {
      errors.productCategory = 'Product category is required';
    } else if (!['Flowers', 'Accessories'].includes(product.productCategory)) {
      errors.productCategory = 'Please select a valid category';
    }

    // Price validation (only required for Flowers)
    if (product.productCategory === 'Flowers') {
      if (!product.price) {
        errors.price = 'Price is required for flowers';
      } else if (isNaN(product.price)) {
        errors.price = 'Price must be a valid number';
      } else if (parseFloat(product.price) <= 0) {
        errors.price = 'Price must be greater than 0';
      } else if (parseFloat(product.price) > 999999.99) {
        errors.price = 'Price must be less than ₱1,000,000';
      } else if (!/^\d+(\.\d{1,2})?$/.test(product.price)) {
        errors.price = 'Price can have maximum 2 decimal places';
      }
    }

    // Quantity validation
    if (!product.quantity) {
      errors.quantity = 'Quantity is required';
    } else if (isNaN(product.quantity)) {
      errors.quantity = 'Quantity must be a valid number';
    } else if (!Number.isInteger(parseFloat(product.quantity))) {
      errors.quantity = 'Quantity must be a whole number';
    } else if (parseInt(product.quantity) <= 0) {
      errors.quantity = 'Quantity must be greater than 0';
    } else if (parseInt(product.quantity) > 999999) {
      errors.quantity = 'Quantity must be less than 1,000,000';
    }

    // Supplier Name validation
    if (!product.supplierName.trim()) {
      errors.supplierName = 'Supplier name is required';
    } else if (product.supplierName.trim().length < 2) {
      errors.supplierName = 'Supplier name must be at least 2 characters';
    } else if (product.supplierName.trim().length > 100) {
      errors.supplierName = 'Supplier name must be less than 100 characters';
    } else if (!/^[a-zA-Z0-9\s\-_&.(),]+$/.test(product.supplierName.trim())) {
      errors.supplierName = 'Supplier name contains invalid characters';
    } else if (/^\d+$/.test(product.supplierName.trim())) {
      errors.supplierName = 'Supplier name cannot be only numbers';
    }

    // Date validation
    if (!product.dateReceived) {
      errors.dateReceived = 'Date received is required';
    } else {
      const today = new Date();
      const selectedDate = new Date(product.dateReceived);
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(today.getFullYear() - 1);
      
      if (selectedDate > today) {
        errors.dateReceived = 'Date received cannot be in the future';
      } else if (selectedDate < oneYearAgo) {
        errors.dateReceived = 'Date received cannot be more than 1 year ago';
      }
    }

    // Lifespan validation (only required for Flowers)
    if (product.productCategory === 'Flowers') {
      if (!product.lifespanInDays) {
        errors.lifespanInDays = 'Lifespan is required for flowers';
      } else if (isNaN(product.lifespanInDays)) {
        errors.lifespanInDays = 'Lifespan must be a valid number';
      } else if (!Number.isInteger(parseFloat(product.lifespanInDays))) {
        errors.lifespanInDays = 'Lifespan must be a whole number';
      } else if (parseInt(product.lifespanInDays) <= 0) {
        errors.lifespanInDays = 'Lifespan must be greater than 0 days';
      } else if (parseInt(product.lifespanInDays) > 3650) {
        errors.lifespanInDays = 'Lifespan must be less than 10 years (3650 days)';
      } else if (parseInt(product.lifespanInDays) < 1) {
        errors.lifespanInDays = 'Lifespan must be at least 1 day';
      }
    }

    return errors;
  };

  // Enhanced input validation for real-time feedback
  const validateField = (name, value) => {
    switch (name) {
      case 'productName':
        if (value && !/^[a-zA-Z0-9\s\-_&.()]*$/.test(value)) {
          return 'Product name contains invalid characters';
        }
        break;
      case 'supplierName':
        if (value && !/^[a-zA-Z0-9\s\-_&.(),]*$/.test(value)) {
          return 'Supplier name contains invalid characters';
        }
        break;
      case 'price':
        if (value && !/^\d*\.?\d*$/.test(value)) {
          return 'Price must be a valid number';
        }
        break;
      case 'quantity':
        if (value && !/^\d*$/.test(value)) {
          return 'Quantity must be a whole number';
        }
        break;
      case 'lifespanInDays':
        if (value && !/^\d*$/.test(value)) {
          return 'Lifespan must be a whole number';
        }
        break;
      default:
        break;
    }
    return null;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Real-time input validation to prevent invalid characters
    const fieldError = validateField(name, value);
    
    // Only update if valid input or show error
    if (!fieldError) {
      setProduct((prev) => ({ ...prev, [name]: value }));
    }
    
    // Clear validation error when user starts typing valid input, or show real-time error
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: fieldError || ''
      }));
    } else if (fieldError) {
      // Show real-time validation error for format issues
      setValidationErrors(prev => ({
        ...prev,
        [name]: fieldError
      }));
    }

    // Clear status message when user starts correcting form
    if (statusMessage.text && statusMessage.type === 'error') {
      setStatusMessage({ type: '', text: '' });
    }
  };
  
  const handleCategorySelect = (category) => {
    setProduct((prev) => ({ 
      ...prev, 
      productCategory: category,
      // Clear price and lifespan fields when Accessories is selected
      price: category === 'Accessories' ? '' : prev.price,
      lifespanInDays: category === 'Accessories' ? '' : prev.lifespanInDays
    }));
    setIsCategoryOpen(false);
    
    // Clear validation errors for category, price, and lifespan (if Accessories selected)
    if (validationErrors.productCategory || 
        (category === 'Accessories' && (validationErrors.price || validationErrors.lifespanInDays))) {
      setValidationErrors(prev => ({
        ...prev,
        productCategory: '',
        ...(category === 'Accessories' && { 
          price: '',
          lifespanInDays: ''
        })
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setStatusMessage({ type: '', text: '' });

    try {
      // Validate form
      const errors = validateForm();
      if (Object.keys(errors).length > 0) {
        setValidationErrors(errors);
        const errorCount = Object.keys(errors).length;
        setStatusMessage({ 
          type: 'error', 
          text: `❌ Please fix ${errorCount} validation error${errorCount > 1 ? 's' : ''} below.` 
        });
        setIsLoading(false);
        return;
      }

      // Clear validation errors
      setValidationErrors({});

      // Additional business logic validation (only for Flowers)
      if (product.productCategory === 'Flowers') {
        const currentDate = new Date();
        const receivedDate = new Date(product.dateReceived);
        const lifespanDays = parseInt(product.lifespanInDays);
        const expiryDate = new Date(receivedDate);
        expiryDate.setDate(expiryDate.getDate() + lifespanDays);

        // Warn if product is already expired or expires soon
        if (expiryDate < currentDate) {
          const confirm = window.confirm(
            `Warning: This product expired on ${expiryDate.toLocaleDateString()}. Are you sure you want to register it?`
          );
          if (!confirm) {
            setIsLoading(false);
            return;
          }
        } else if (expiryDate <= new Date(currentDate.getTime() + 7 * 24 * 60 * 60 * 1000)) {
          const confirm = window.confirm(
            `Warning: This product will expire on ${expiryDate.toLocaleDateString()} (within 7 days). Are you sure you want to register it?`
          );
          if (!confirm) {
            setIsLoading(false);
            return;
          }
        }
      }

      // Prepare data with proper formatting
      const productData = {
        productName: product.productName.trim(),
        productCategory: product.productCategory,
        quantity: parseInt(product.quantity, 10),
        supplierName: product.supplierName.trim(),
        dateReceived: product.dateReceived,
      };

      // Only include price and lifespan for Flowers category
      if (product.productCategory === 'Flowers') {
        productData.price = Math.round(parseFloat(product.price) * 100) / 100; // Round to 2 decimal places
        productData.lifespanInDays = parseInt(product.lifespanInDays, 10);
      }

      // Get admin token for authorization
      const token = localStorage.getItem('token');
      if (!token) {
        setStatusMessage({ 
          type: 'error', 
          text: '❌ Admin session expired. Please log in again.' 
        });
        setIsLoading(false);
        return;
      }

      const config = {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      };

      const response = await axios.post('/api/products/add', productData, config);
      
      setStatusMessage({ 
        type: 'success', 
        text: `✅ Product "${productData.productName}" registered successfully!` 
      });
      setProduct(initialFormState);
      setValidationErrors({});

      // Auto-clear success message after 5 seconds
      setTimeout(() => {
        setStatusMessage({ type: '', text: '' });
      }, 5000);

    } catch (error) {
      console.error('Error adding product:', error);
      
      // Enhanced error handling
      let errorMessage = "Failed to register product. Please try again.";
      
      if (error.response) {
        // Server responded with error status
        const { status, data } = error.response;
        
        switch (status) {
          case 400:
            if (data.message && data.message.includes('already exists')) {
              setValidationErrors({ productName: 'A product with this name already exists' });
              errorMessage = "Product name already exists. Please use a different name.";
            } else if (data.message && data.message.includes('Invalid')) {
              errorMessage = data.message || "Invalid product data provided.";
            } else {
              errorMessage = data.message || "Invalid product data provided.";
            }
            break;
          case 401:
            errorMessage = "Unauthorized. Please log in again.";
            break;
          case 403:
            errorMessage = "Access denied. Admin privileges required.";
            break;
          case 409:
            errorMessage = "Product already exists with this information.";
            setValidationErrors({ productName: 'Product already exists' });
            break;
          case 422:
            errorMessage = "Invalid data format. Please check all fields.";
            break;
          case 500:
            errorMessage = "Server error. Please try again later.";
            break;
          default:
            errorMessage = data.message || `Server error (${status}). Please try again.`;
        }
      } else if (error.request) {
        // Network error
        errorMessage = "Network error. Please check your connection and try again.";
      } else {
        // Other error
        errorMessage = error.message || "An unexpected error occurred.";
      }
      
      setStatusMessage({ type: 'error', text: `❌ ${errorMessage}` });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="dashboard-container">
      <Sidebar />
      
      <main className="dashboard-main">
        <header className="dashboard-header">
          <h1>Product Registration</h1>
          <UserProfile />
        </header>

        <div className="product-registration-content">
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
                  <input 
                    type="text" 
                    name="productName" 
                    placeholder="Product Name" 
                    value={product.productName} 
                    onChange={handleChange} 
                    className={`registration-input ${validationErrors.productName ? 'error' : ''}`}
                    maxLength="100"
                    autoComplete="off"
                    required 
                  />
                  {validationErrors.productName && (
                    <span className="error-text">{validationErrors.productName}</span>
                  )}
                </div>
              </div>

              <div className="form-row">
                <div className="input-group full-width category-dropdown">
                  <div 
                    className={`registration-input dropdown-toggle ${validationErrors.productCategory ? 'error' : ''}`}
                    onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                  >
                    {product.productCategory || 'Product Category'}
                    <span className="dropdown-arrow-input">{isCategoryOpen ? '▲' : '▼'}</span>
                  </div>
                  {isCategoryOpen && (
                    <div className="dropdown-menu">
                      <div className="dropdown-item" onClick={() => handleCategorySelect('Flowers')}>Flowers</div>
                      <div className="dropdown-item" onClick={() => handleCategorySelect('Accessories')}>Accessories</div>
                    </div>
                  )}
                  {validationErrors.productCategory && (
                    <span className="error-text">{validationErrors.productCategory}</span>
                  )}
                </div>
              </div>
              
              <div className="form-row">
                <div className="input-group">
                  <input 
                    type="number" 
                    name="price" 
                    placeholder={product.productCategory === 'Accessories' ? 'Price (N/A for Accessories)' : 'Price'}
                    value={product.price} 
                    onChange={handleChange} 
                    className={`registration-input ${validationErrors.price ? 'error' : ''} ${product.productCategory === 'Accessories' ? 'disabled' : ''}`}
                    step="0.01"
                    min="0.01"
                    max="999999.99"
                    autoComplete="off"
                    disabled={product.productCategory === 'Accessories'}
                    required={product.productCategory !== 'Accessories'}
                  />
                  {validationErrors.price && (
                    <span className="error-text">{validationErrors.price}</span>
                  )}
                </div>
                <div className="input-group">
                  <input 
                    type="number" 
                    name="quantity" 
                    placeholder="Qty" 
                    value={product.quantity} 
                    onChange={handleChange} 
                    className={`registration-input ${validationErrors.quantity ? 'error' : ''}`}
                    min="1"
                    max="999999"
                    autoComplete="off"
                    required 
                  />
                  {validationErrors.quantity && (
                    <span className="error-text">{validationErrors.quantity}</span>
                  )}
                </div>
              </div>
              
              <div className="form-row">
                <div className="input-group full-width">
                  <input 
                    type="text" 
                    name="supplierName" 
                    placeholder="Supplier Name" 
                    value={product.supplierName} 
                    onChange={handleChange} 
                    className={`registration-input ${validationErrors.supplierName ? 'error' : ''}`}
                    maxLength="100"
                    autoComplete="off"
                    required 
                  />
                  {validationErrors.supplierName && (
                    <span className="error-text">{validationErrors.supplierName}</span>
                  )}
                </div>
              </div>
              
              <div className="form-row">
                <div className="input-group">
                  <DatePicker
                    selected={product.dateReceived}
                    onChange={(date) => {
                      setProduct(prev => ({...prev, dateReceived: date}));
                      if (validationErrors.dateReceived) {
                        setValidationErrors(prev => ({
                          ...prev,
                          dateReceived: ''
                        }));
                      }
                    }}
                    className={`registration-input ${validationErrors.dateReceived ? 'error' : ''}`}
                    dateFormat="MMMM d, yyyy"
                    placeholderText="Date Received"
                    maxDate={new Date()}
                  />
                  {validationErrors.dateReceived && (
                    <span className="error-text">{validationErrors.dateReceived}</span>
                  )}
                </div>
                <div className="input-group">
                  <input 
                    type="number" 
                    name="lifespanInDays" 
                    placeholder={product.productCategory === 'Accessories' ? 'Lifespan (N/A for Accessories)' : 'Lifespan (in days)'}
                    value={product.lifespanInDays} 
                    onChange={handleChange} 
                    className={`registration-input ${validationErrors.lifespanInDays ? 'error' : ''} ${product.productCategory === 'Accessories' ? 'disabled' : ''}`}
                    min="1" 
                    max="3650"
                    autoComplete="off"
                    disabled={product.productCategory === 'Accessories'}
                    required={product.productCategory !== 'Accessories'}
                  />
                  {validationErrors.lifespanInDays && (
                    <span className="error-text">{validationErrors.lifespanInDays}</span>
                  )}
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
      </main>
    </div>
  );
};

export default ProductRegistration;
