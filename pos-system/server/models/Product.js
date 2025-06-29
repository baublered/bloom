const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  productName: { type: String, required: true },
  productCategory: { type: String, required: true },
  price: { type: Number, required: false }, // Not required for Accessories
  quantity: { type: Number, required: true },
  supplierName: { type: String, required: true },
  dateReceived: { type: Date, default: Date.now },
  lifespanInDays: { type: Number, required: false }, // Not required for Accessories
  image: { type: String, default: 'http://localhost:5000/uploads/default.jpg' }
}, {
  timestamps: true 
});

module.exports = mongoose.model('Product', productSchema);
