const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  productName: { type: String, required: true },
  productCategory: { type: String, required: true },
  price: { type: Number, required: false }, // Not required for Accessories
  quantity: { type: Number, required: true },
  supplierName: { type: String, required: false }, // Made optional
  dateReceived: { type: Date, default: Date.now },
  dateRestocked: { type: Date, default: null }, // Added dateRestocked field
  lifespanInDays: { type: Number, required: false }, // Not required for Accessories
  minimumThreshold: { type: Number, required: true, default: 0 }, // Added minimumThreshold
  image: { type: String, default: 'http://localhost:5000/uploads/default.jpg' },
  bouquetPackage: { type: String, required: false } // Add bouquet package field
}, {
  timestamps: true 
});

// Create a unique index on productName (case-insensitive)
productSchema.index({ productName: 1 }, { unique: true, collation: { locale: 'en', strength: 2 } });

module.exports = mongoose.model('Product', productSchema);
