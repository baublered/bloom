const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  productName: { type: String, required: true },
  productCategory: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true },
  supplierName: { type: String, required: true },
  dateReceived: { type: Date, default: Date.now },
  lifespan: { type: String },
  // Adding the image field from your previous routes
  image: { type: String, default: 'http://localhost:5000/uploads/default.jpg' }
}, {
  timestamps: true // Adds createdAt and updatedAt fields automatically
});

module.exports = mongoose.model('Product', productSchema);
