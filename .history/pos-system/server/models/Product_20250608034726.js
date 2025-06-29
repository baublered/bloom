const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, required: true },
  quantity: { type: Number, default: 0 },
  unit: { type: String, default: 'pcs' }, // Optional, just a default value for consistency
  cost: { type: Number, required: false }, // You can keep this field for tracking the cost of items
  price: { type: Number, required: true },
  supplier: { type: String, required: false },
  expiryDate: { type: Date, required: false },
  description: { type: String, required: false },
  image: { type: String, required: false }, // Field for storing the image URL
}, {
  timestamps: true // Automatically add createdAt and updatedAt fields
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
