import { useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/Calendar.css'; // Default calendar styles
import './ProductRegistration.css'; // Your new custom styles

const ProductRegistration = () => {
  const [product, setProduct] = useState({
    productName: '',
    productCategory: '',
    price: '',
    quantity: '',
    supplierName: '',
    dateReceived: new Date(),
    lifespan: '',
  });

  // State to manage the custom dropdown and calendar visibility
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProduct((prev) => ({ ...prev, [name]: value }));
  };
  
  const handleDateChange = (date) => {
      setProduct((prev) => ({ ...prev, dateReceived: date }));
      setIsCalendarOpen(false); // Close calendar after selection
  }

  const handleCategorySelect = (category) => {
    setProduct((prev) => ({ ...prev, productCategory: category }));
    setIsCategoryOpen(false); // Close dropdown after selection
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: Add logic to submit the 'product' state to your backend API
    console.log('Registering new product:', product);
    alert('Product registration submitted! Check the console.');
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
          <div className="form-row">
            <div className="input-group full-width">
              <input type="text" name="productName" placeholder="Product Name" value={product.productName} onChange={handleChange} className="registration-input" required />
            </div>
          </div>

          <div className="form-row">
            {/* Custom Category Dropdown */}
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
            {/* Custom Date Field with Calendar */}
            <div className="input-group date-picker">
              <div className="registration-input dropdown-toggle" onClick={() => setIsCalendarOpen(!isCalendarOpen)}>
                {product.dateReceived.toLocaleDateString()}
                <span className="dropdown-arrow">▼</span>
              </div>
              {isCalendarOpen && (
                <div className="calendar-popup">
                    <Calendar onChange={handleDateChange} value={product.dateReceived} />
                </div>
              )}
            </div>
            <div className="input-group">
              <input type="text" name="lifespan" placeholder="Lifespan" value={product.lifespan} onChange={handleChange} className="registration-input" />
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" className="register-button">Register Product</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductRegistration;
