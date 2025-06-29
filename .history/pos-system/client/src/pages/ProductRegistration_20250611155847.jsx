import axios from 'axios'; // <== Don't forget this
import React, { useState } from 'react';
import './ProductRegistration.css';

function ProductRegistration() {
  const [product, setProduct] = useState({
    name: '',
    category: '',
    quantity: '',
    price: '',
    description: '',
  });

  const [statusMessage, setStatusMessage] = useState(''); // ✅ New state for message

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProduct((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post('http://localhost:5000/api/products/add', product);
      setStatusMessage('✅ Product added successfully!');
      // Clear form
      setProduct({
        name: '',
        category: '',
        quantity: '',
        price: '',
        description: '',
      });
    } catch (error) {
      console.error(error);
      setStatusMessage('❌ Failed to add product.');
    }
  };

  return (
    <div className="product-registration-container">
      <h2>Product Registration</h2>

      {/* ✅ Show status message */}
      {statusMessage && (
        <p style={{ color: statusMessage.includes('Failed') ? 'red' : 'green' }}>
          {statusMessage}
        </p>
      )}

      <form onSubmit={handleSubmit} className="product-form">
        <label>Product Name:
          <input type="text" name="name" value={product.name} onChange={handleChange} required />
        </label>

        <label>Category:
          <input type="text" name="category" value={product.category} onChange={handleChange} required />
        </label>

        <label>Quantity:
          <input type="number" name="quantity" value={product.quantity} onChange={handleChange} required />
        </label>

        <label>Price:
          <input type="number" name="price" value={product.price} onChange={handleChange} required />
        </label>

        <label>Description:
          <textarea name="description" value={product.description} onChange={handleChange}></textarea>
        </label>

        <button type="submit">Add Product</button>
      </form>
    </div>
  );
}

export default ProductRegistration;
