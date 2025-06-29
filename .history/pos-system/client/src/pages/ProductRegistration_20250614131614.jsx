import axios from 'axios'; // Import axios for HTTP requests
import { useState } from 'react';
import './ProductRegistration.css';

function ProductRegistration() {
  const [product, setProduct] = useState({
    name: '',
    category: '',
    quantity: '',
    price: '',
    description: '',
  });

  const [statusMessage, setStatusMessage] = useState(''); // State for status message

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProduct((prev) => ({
      ...prev,
      [name]: value, // Update state based on the input field
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Send POST request to backend with product data
      const response = await axios.post('http://localhost:5000/api/products/add', product, {
        headers: { 'Content-Type': 'application/json' }, // Ensure Content-Type is JSON
      });

      setStatusMessage('✅ Product added successfully!');

      // Clear form after successful submission
      setProduct({
        name: '',
        category: '',
        quantity: '',
        price: '',
        description: '',
      });
    } catch (error) {
      console.error('Error adding product:', error);
      setStatusMessage('❌ Failed to add product.');
    }
  };

  return (
    <div className="product-registration-container">
      <h2>Product Registration</h2>

      {/* Show success or error message */}
      {statusMessage && (
        <p style={{ color: statusMessage.includes('Failed') ? 'red' : 'green' }}>
          {statusMessage}
        </p>
      )}

      <form onSubmit={handleSubmit} className="product-form">
        <label>Product Name:
          <input
            type="text"
            name="name"
            value={product.name}
            onChange={handleChange}
            required
          />
        </label>

       <select
              name="category"
              value={form.eventType}
              onChange={handleInputChange}
              required
            >
              <option value="">Category</option>
              <option value="Type 1">Flowers</option>
              <option value="Type 2">Add-Ons</option>
            </select>

        <label>Quantity:
          <input
            type="number"
            name="quantity"
            value={product.quantity}
            onChange={handleChange}
            required
          />
        </label>

        <label>Price:
          <input
            type="number"
            name="price"
            value={product.price}
            onChange={handleChange}
            required
          />
        </label>

        <label>Description:
          <textarea
            name="description"
            value={product.description}
            onChange={handleChange}
            required
          />
        </label>

        <button type="submit">Add Product</button>
      </form>
    </div>
  );
}

export default ProductRegistration;