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
    minimumThreshold: '',
    lifespanInDays: '',
    supplierName: '', // Add supplierName to initial state
    bouquetPackage: '', // Add bouquet package
    customPackageSize: '', // Add custom package size
  };

  const [product, setProduct] = useState(initialFormState);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState({ type: '', text: '' });
  const [validationErrors, setValidationErrors] = useState({});
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);
  const [lastSubmissionTime, setLastSubmissionTime] = useState(0);

  // Validation function
  const validateForm = (productState) => {
    const errors = {};
    const p = productState || product; // Use passed state or component's state

    // Product Name validation
    if (!p.productName.trim()) {
      errors.productName = 'Product name is required';
    } else if (p.productName.trim().length < 2) {
      errors.productName = 'Product name must be at least 2 characters';
    } else if (p.productName.trim().length > 100) {
      errors.productName = 'Product name must be less than 100 characters';
    } else if (!/^[a-zA-Z0-9\s\-_&.()]+$/.test(p.productName.trim())) {
      errors.productName = 'Product name contains invalid characters';
    } else if (p.productName.trim().toLowerCase() === 'test' || p.productName.trim().toLowerCase() === 'sample') {
      errors.productName = 'Please enter a valid product name';
    }

    // Product Category validation
    console.log('Validating category:', p.productCategory); // Debug log
    if (!p.productCategory || p.productCategory.trim() === '') {
      errors.productCategory = 'Product category is required';
    } else if (!['Flowers', 'Accessories', 'Bouquet'].includes(p.productCategory.trim())) {
      console.log('Invalid category detected:', p.productCategory); // Debug log
      errors.productCategory = 'Please select a valid category';
    }

    // Price validation (only required for Flowers and Bouquet)
    if (['Flowers', 'Bouquet'].includes(p.productCategory)) {
      if (!p.price) {
        errors.price = `Price is required for ${p.productCategory.toLowerCase()}`;
      } else if (isNaN(p.price)) {
        errors.price = 'Price must be a valid number';
      } else if (parseFloat(p.price) <= 0) {
        errors.price = 'Price must be greater than 0';
      } else if (parseFloat(p.price) > 999999.99) {
        errors.price = 'Price must be less than ₱1,000,000';
      } else if (!/^\d+(\.\d{1,2})?$/.test(p.price)) {
        errors.price = 'Price must be in a valid format (e.g., 123.45)';
      }
    }

    // Minimum Threshold validation
    if (!p.minimumThreshold) {
      errors.minimumThreshold = 'Minimum threshold is required';
    } else if (isNaN(p.minimumThreshold)) {
      errors.minimumThreshold = 'Minimum threshold must be a valid number';
    } else if (!Number.isInteger(parseFloat(p.minimumThreshold))) {
      errors.minimumThreshold = 'Minimum threshold must be a whole number';
    } else if (parseInt(p.minimumThreshold) < 0) {
      errors.minimumThreshold = 'Minimum threshold cannot be negative';
    } else if (parseInt(p.minimumThreshold) > 999999) {
      errors.minimumThreshold = 'Minimum threshold must be less than 1,000,000';
    }

    // Lifespan validation (only required for Flowers and Bouquet)
    if (['Flowers', 'Bouquet'].includes(p.productCategory)) {
      if (!p.lifespanInDays) {
        errors.lifespanInDays = `Lifespan is required for ${p.productCategory.toLowerCase()}`;
      } else if (isNaN(p.lifespanInDays)) {
        errors.lifespanInDays = 'Lifespan must be a valid number';
      } else if (!Number.isInteger(parseFloat(p.lifespanInDays))) {
        errors.lifespanInDays = 'Lifespan must be a whole number';
      } else if (parseInt(p.lifespanInDays) <= 0) {
        errors.lifespanInDays = 'Lifespan must be greater than 0 days';
      } else if (parseInt(p.lifespanInDays) > 3650) {
        errors.lifespanInDays = 'Lifespan must be less than 10 years (3650 days)';
      } else if (parseInt(p.lifespanInDays) < 1) {
        errors.lifespanInDays = 'Lifespan must be at least 1 day';
      }
    }

    // Supplier Name validation
    if (!p.supplierName.trim()) {
      errors.supplierName = 'Supplier name is required';
    } else if (p.supplierName.trim().length < 2) {
      errors.supplierName = 'Supplier name must be at least 2 characters';
    } else if (p.supplierName.trim().length > 100) {
      errors.supplierName = 'Supplier name must be less than 100 characters';
    } else if (!/^[a-zA-Z0-9\s\-_&.()]+$/.test(p.supplierName.trim())) {
      errors.supplierName = 'Supplier name contains invalid characters';
    }

    // Bouquet Package validation (only for Bouquet category)
    if (p.productCategory === 'Bouquet') {
      if (!p.bouquetPackage) {
        errors.bouquetPackage = 'Bouquet package is required';
      } else if (p.bouquetPackage === 'custom') {
        if (!p.customPackageSize) {
          errors.customPackageSize = 'Custom package size is required';
        } else if (isNaN(p.customPackageSize)) {
          errors.customPackageSize = 'Custom package size must be a valid number';
        } else if (!Number.isInteger(parseFloat(p.customPackageSize))) {
          errors.customPackageSize = 'Custom package size must be a whole number';
        } else if (parseInt(p.customPackageSize) <= 0) {
          errors.customPackageSize = 'Custom package size must be greater than 0';
        } else if (parseInt(p.customPackageSize) > 100) {
          errors.customPackageSize = 'Custom package size must be 100 or less';
        }
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
      case 'minimumThreshold':
        if (value && !/^\d*$/.test(value)) {
          return 'Minimum threshold must be a whole number';
        }
        break;
      case 'lifespanInDays':
        if (value && !/^\d*$/.test(value)) {
          return 'Lifespan must be a whole number';
        }
        break;
      case 'customPackageSize':
        if (value && !/^\d*$/.test(value)) {
          return 'Custom package size must be a whole number';
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
    console.log('Category selected:', category); // Debug log
    
    // Directly pass a function to setProduct to ensure we get the latest state
    setProduct(prevProduct => {
      const updatedProduct = {
        ...prevProduct,
        productCategory: category,
        // Clear price and lifespan fields when Accessories is selected
        price: category === 'Accessories' ? '' : prevProduct.price,
        lifespanInDays: category === 'Accessories' ? '' : prevProduct.lifespanInDays,
        // Clear bouquet package fields when not Bouquet category
        bouquetPackage: category === 'Bouquet' ? prevProduct.bouquetPackage : '',
        customPackageSize: category === 'Bouquet' ? prevProduct.customPackageSize : '',
      };
      console.log('Product state updated:', updatedProduct); // Debug log for state update
      return updatedProduct;
    });

    setIsCategoryOpen(false);
    
    // Clear validation errors for category, price, and lifespan (if Accessories selected)
    setValidationErrors(prev => ({
      ...prev,
      productCategory: '', // Always clear category error when selecting
      ...(category === 'Accessories' && { 
        price: '',
        lifespanInDays: ''
      }),
      ...(category !== 'Bouquet' && {
        bouquetPackage: '',
        customPackageSize: ''
      })
    }));

    // Clear any status messages
    if (statusMessage.text && statusMessage.type === 'error') {
      setStatusMessage({ type: '', text: '' });
    }
  };

  const handleBouquetPackageChange = (packageValue) => {
    setProduct(prev => ({
      ...prev,
      bouquetPackage: packageValue,
      customPackageSize: packageValue === 'custom' ? prev.customPackageSize : ''
    }));

    // Clear validation errors for bouquet package
    setValidationErrors(prev => ({
      ...prev,
      bouquetPackage: '',
      ...(packageValue !== 'custom' && { customPackageSize: '' })
    }));

    // Clear status message when user makes selection
    if (statusMessage.text && statusMessage.type === 'error') {
      setStatusMessage({ type: '', text: '' });
    }
  };

  // Retry function for failed submissions
  const retrySubmission = async (productData, config) => {
    setIsRetrying(true);
    setStatusMessage({ type: 'info', text: '🔄 Retrying submission...' });
    
    console.log('Retrying product registration:', productData);
    
    try {
      const response = await axios.post('/api/products/add', productData, config);
      console.log('Retry successful:', response.data);
      return response;
    } catch (error) {
      console.error('Retry failed:', error);
      throw error;
    } finally {
      setIsRetrying(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Prevent multiple submissions
    if (isLoading || isRetrying) {
      console.log('Form submission blocked - already processing');
      return;
    }
    
    // Prevent rapid successive submissions (debounce)
    const now = Date.now();
    if (now - lastSubmissionTime < 1000) {
      console.log('Form submission blocked - too soon after last submission');
      return;
    }
    
    setLastSubmissionTime(now);
    setIsLoading(true);
    setStatusMessage({ type: '', text: '' });

    try {
      // Call validateAndSubmit directly with the current product state
      await validateAndSubmit(product);
    } catch (error) {
      console.error('Error in handleSubmit:', error);
      setStatusMessage({ type: 'error', text: '❌ An unexpected error occurred. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const validateAndSubmit = async (currentProductState) => {
    // Declare productData early so it's available in error handling
    let productData = null;

    try {
      // Validate form using the most current state
      const errors = validateForm(currentProductState); // Pass state directly
      console.log('Form validation errors:', errors);
      console.log('Current product state for validation:', currentProductState);

      if (Object.keys(errors).length > 0) {
        setValidationErrors(errors);
        const errorCount = Object.keys(errors).length;
        const errorFields = Object.keys(errors).join(', ');
        
        setStatusMessage({ 
          type: 'error', 
          text: `❌ Please fix ${errorCount} validation error${errorCount > 1 ? 's' : ''} in the following field${errorCount > 1 ? 's' : ''}: ${errorFields}` 
        });
        
        // Focus on the first error field for better UX
        const firstErrorField = Object.keys(errors)[0];
        setTimeout(() => {
          const errorElement = document.querySelector(`input[name="${firstErrorField}"], .dropdown-toggle`);
          if (errorElement) {
            errorElement.focus();
            errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, 100);
        
        setIsLoading(false);
        return;
      }

      // Clear validation errors
      setValidationErrors({});

      // Prepare data with proper formatting
      productData = {
        productName: currentProductState.productCategory === 'Bouquet' 
          ? `${currentProductState.productName.trim()} - ${currentProductState.bouquetPackage === 'custom' 
              ? `${currentProductState.customPackageSize}pcs` 
              : currentProductState.bouquetPackage}`
          : currentProductState.productName.trim(),
        productCategory: currentProductState.productCategory,
        minimumThreshold: parseInt(currentProductState.minimumThreshold, 10),
        lifespanInDays: parseInt(currentProductState.lifespanInDays, 10),
        supplierName: currentProductState.supplierName.trim(),
        quantity: 0, // Set initial quantity to 0
        dateReceived: new Date(), // Add current date
      };

      // Only include price for Flowers and Bouquet categories
      if (['Flowers', 'Bouquet'].includes(currentProductState.productCategory)) {
        productData.price = Math.round(parseFloat(currentProductState.price) * 100) / 100;
      }

      // Add bouquet package information for Bouquet category
      if (currentProductState.productCategory === 'Bouquet') {
        if (currentProductState.bouquetPackage === 'custom') {
          productData.bouquetPackage = `${currentProductState.customPackageSize}pcs`;
        } else {
          productData.bouquetPackage = currentProductState.bouquetPackage;
        }
      }

      const token = localStorage.getItem('token');
      if (!token) {
        setStatusMessage({ type: 'error', text: '❌ Admin session expired. Please log in again.' });
        setIsLoading(false);
        return;
      }

      const config = {
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        timeout: 10000
      };

      console.log('Attempting to register product:', productData);
      console.log('API endpoint: /api/products/add');

      let response;
      try {
        response = await axios.post('/api/products/add', productData, config);
        console.log('Registration successful:', response.data);
      } catch (initialError) {
        console.error('Initial request failed:', initialError);
        
        if (retryCount < 2 && (initialError.code === 'ECONNABORTED' || initialError.code === 'ERR_NETWORK' || (initialError.response && initialError.response.status >= 500))) {
          setRetryCount(prev => prev + 1);
          try {
            response = await retrySubmission(productData, config);
          } catch (retryError) {
            throw retryError; // Throw error from retry to be caught by outer catch block
          }
        } else {
          throw initialError; // Re-throw other errors to be handled by the main catch block
        }
      }
      
      setStatusMessage({ type: 'success', text: `✅ Product "${productData.productName}" registered successfully!` });
      
      // Reset form completely
      setProduct(initialFormState);
      setValidationErrors({});
      setRetryCount(0);
      setLastSubmissionTime(0);

      // Auto-clear success message after 5 seconds
      setTimeout(() => {
        setStatusMessage({ type: '', text: '' });
      }, 5000);

    } catch (error) {
      console.error('Error adding product:', error);
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        response: error.response ? { status: error.response.status, data: error.response.data } : 'N/A',
      });
      
      if (productData) {
        console.error('Product data being sent:', productData);
      } else {
        console.error('Product data was not prepared before the error.');
      }
      
      let errorMessage = "Failed to register product. Please try again.";
      let fieldErrors = {};
      
      if (error.response) {
        console.error('Server response:', error.response.data);
        if (error.response.status === 400) {
          if (error.response.data && error.response.data.errors) {
            errorMessage = `Validation failed: ${error.response.data.message || 'Please check the fields.'}`;
            error.response.data.errors.forEach(err => {
              fieldErrors[err.param] = err.msg;
            });
            setValidationErrors(fieldErrors);
          } else {
            errorMessage = `Error: ${error.response.data.message || 'Bad Request'}`;
          }
        } else if (error.response.status === 401) {
          errorMessage = "Unauthorized. Please log in again.";
          navigate('/login');
        } else if (error.response.status >= 500) {
          errorMessage = "Server error. Please try again later.";
        }
      } else if (error.code === 'ECONNABORTED' || error.code === 'ERR_NETWORK') {
        errorMessage = "Network error or request timed out. Please check your connection and try again.";
      }
      
      setStatusMessage({ type: 'error', text: `❌ ${errorMessage}` });
      
      // Auto-clear error message after 10 seconds for better UX
      setTimeout(() => {
        setStatusMessage({ type: '', text: '' });
      }, 10000);
      
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
                    className={`registration-input dropdown-toggle ${validationErrors.productCategory ? 'error' : ''} ${product.productCategory ? 'selected' : ''}`}
                    onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                  >
                    {product.productCategory || 'Product Category'}
                    <span className="dropdown-arrow-input">{isCategoryOpen ? '▲' : '▼'}</span>
                  </div>
                  {isCategoryOpen && (
                    <div className="dropdown-menu">
                      <div 
                        className={`dropdown-item ${product.productCategory === 'Flowers' ? 'selected' : ''}`}
                        onClick={() => handleCategorySelect('Flowers')}
                      >
                        Flowers
                      </div>
                      <div 
                        className={`dropdown-item ${product.productCategory === 'Accessories' ? 'selected' : ''}`}
                        onClick={() => handleCategorySelect('Accessories')}
                      >
                        Accessories
                      </div>
                      <div 
                        className={`dropdown-item ${product.productCategory === 'Bouquet' ? 'selected' : ''}`}
                        onClick={() => handleCategorySelect('Bouquet')}
                      >
                        Bouquet
                      </div>
                    </div>
                  )}
                  {validationErrors.productCategory && (
                    <span className="error-text">{validationErrors.productCategory}</span>
                  )}
                </div>
              </div>
              
              {/* Conditional fields for Flowers and Bouquet */}
              {['Flowers', 'Bouquet'].includes(product.productCategory) && (
                <div className="form-row">
                  <div className="input-group">
                    <input 
                      type="text" 
                      name="price" 
                      placeholder="Price (₱)" 
                      value={product.price} 
                      onChange={handleChange} 
                      className={`registration-input ${validationErrors.price ? 'error' : ''}`}
                      autoComplete="off"
                      required={['Flowers', 'Bouquet'].includes(product.productCategory)}
                    />
                    {validationErrors.price && (
                      <span className="error-text">{validationErrors.price}</span>
                    )}
                  </div>
                  <div className="input-group">
                    <input 
                      type="text" 
                      name="lifespanInDays" 
                      placeholder="Lifespan (Days)" 
                      value={product.lifespanInDays} 
                      onChange={handleChange} 
                      className={`registration-input ${validationErrors.lifespanInDays ? 'error' : ''}`}
                      autoComplete="off"
                      required={['Flowers', 'Bouquet'].includes(product.productCategory)}
                    />
                    {validationErrors.lifespanInDays && (
                      <span className="error-text">{validationErrors.lifespanInDays}</span>
                    )}
                  </div>
                </div>
              )}

              {/* Bouquet Package Selection (only for Bouquet category) */}
              {product.productCategory === 'Bouquet' && (
                <div className="form-row">
                  <div className="input-group full-width">
                    <label className="package-label">Bouquet Package Size:</label>
                    <div className="radio-group">
                      <label className="radio-item">
                        <input
                          type="radio"
                          name="bouquetPackage"
                          value="3pcs"
                          checked={product.bouquetPackage === '3pcs'}
                          onChange={(e) => handleBouquetPackageChange(e.target.value)}
                        />
                        <span className="radio-text">3 pieces</span>
                      </label>
                      <label className="radio-item">
                        <input
                          type="radio"
                          name="bouquetPackage"
                          value="6pcs"
                          checked={product.bouquetPackage === '6pcs'}
                          onChange={(e) => handleBouquetPackageChange(e.target.value)}
                        />
                        <span className="radio-text">6 pieces</span>
                      </label>
                      <label className="radio-item">
                        <input
                          type="radio"
                          name="bouquetPackage"
                          value="12pcs"
                          checked={product.bouquetPackage === '12pcs'}
                          onChange={(e) => handleBouquetPackageChange(e.target.value)}
                        />
                        <span className="radio-text">12 pieces</span>
                      </label>
                      <label className="radio-item">
                        <input
                          type="radio"
                          name="bouquetPackage"
                          value="custom"
                          checked={product.bouquetPackage === 'custom'}
                          onChange={(e) => handleBouquetPackageChange(e.target.value)}
                        />
                        <span className="radio-text">Custom</span>
                      </label>
                    </div>
                    {validationErrors.bouquetPackage && (
                      <span className="error-text">{validationErrors.bouquetPackage}</span>
                    )}
                  </div>
                </div>
              )}

              {/* Custom Package Size Input (only when custom is selected) */}
              {product.productCategory === 'Bouquet' && product.bouquetPackage === 'custom' && (
                <div className="form-row">
                  <div className="input-group full-width">
                    <input
                      type="text"
                      name="customPackageSize"
                      placeholder="Custom package size (pieces)"
                      value={product.customPackageSize}
                      onChange={handleChange}
                      className={`registration-input ${validationErrors.customPackageSize ? 'error' : ''}`}
                      autoComplete="off"
                      required
                    />
                    <small className="field-note">
                      Enter the number of pieces for your custom bouquet package
                    </small>
                    {validationErrors.customPackageSize && (
                      <span className="error-text">{validationErrors.customPackageSize}</span>
                    )}
                  </div>
                </div>
              )}

              <div className="form-row">
                <div className="input-group full-width">
                  <input 
                    type="text" 
                    name="minimumThreshold" 
                    placeholder="Minimum Threshold" 
                    value={product.minimumThreshold} 
                    onChange={handleChange} 
                    className={`registration-input ${validationErrors.minimumThreshold ? 'error' : ''}`}
                    autoComplete="off"
                    required 
                  />
                  <small className="field-note">
                    The minimum stock level that triggers a low inventory alert
                  </small>
                  {validationErrors.minimumThreshold && (
                    <span className="error-text">{validationErrors.minimumThreshold}</span>
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
                <button type="submit" className="register-button" disabled={isLoading || isRetrying}>
                  {isLoading ? (isRetrying ? 'Retrying...' : 'Registering...') : 'Register Product'}
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
