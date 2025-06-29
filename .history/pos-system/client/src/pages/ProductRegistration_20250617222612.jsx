import { useState } from 'react';
// --- DEBUGGING: Temporarily disabling calendar imports ---
// import Calendar from 'react-calendar';
// import 'react-calendar/Calendar.css'; 
import './ProductRegistration.css';

const ProductRegistration = () => {
  const [product, setProduct] = useState({
    productName: '',
    productCategory: '',
    price: '',
    quantity: '',
    supplierName: '',
    // Changed to a string for simplicity during debugging
    dateReceived: new Date().toISOString().split('T')[0], 
    lifespan: '',
  });

  const [isCategoryOpen, setIsCategoryOpen] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProduct((prev) => ({ ...prev, [name]: value }));
  };
  
  const handleCategorySelect = (category) => {
    setProduct((prev) => ({ ...prev, productCategory: category }));
    setIsCategoryOpen(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
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
            {/* --- DEBUGGING: Replaced calendar with a standard date input --- */}
            <div className="input-group">
              <label className="input-label-inline">Date Received</label>
              <input type="date" name="dateReceived" value={product.dateReceived} onChange={handleChange} className="registration-input" />
            </div>
            <div className="input-group">
               <label className="input-label-inline">Lifespan</label>
              <input type="text" name="lifespan" placeholder="e.g., 7 days" value={product.lifespan} onChange={handleChange} className="registration-input" />
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
