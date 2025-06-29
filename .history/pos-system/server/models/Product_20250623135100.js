const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  productName: { type: String, required: true },
  productCategory: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true },
  supplierName: { type: String, required: true },
  dateReceived: { type: Date, default: Date.now },
  // --- FIX: Removed the "default: 7" property ---
  // This field will now strictly use the value sent from the form.
  lifespanInDays: { type: Number, required: true }, 
  image: { type: String, default: 'http://localhost:5000/uploads/default.jpg' }
}, {
  timestamps: true 
});

module.exports = mongoose.model('Product', productSchema);
