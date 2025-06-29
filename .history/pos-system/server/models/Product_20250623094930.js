const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  productName: { type: String, required: true },
  productCategory: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true },
  supplierName: { type: String, required: true },
  dateReceived: { type: Date, default: Date.now },
  // --- UPDATED FIELD ---
  // Storing lifespan as a number of days is much more reliable for calculations.
  lifespanInDays: { type: Number, required: true, default: 7 }, 
  image: { type: String, default: 'http://localhost:5000/uploads/default.jpg' }
}, {
  timestamps: true 
});

module.exports = mongoose.model('Product', productSchema);
