const mongoose = require('mongoose');

// This schema will store a record of products that have expired.
const spoiledProductSchema = new mongoose.Schema({
  originalProductId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
  },
  productName: {
    type: String,
    required: true,
  },
  productCategory: {
    type: String,
    required: true,
  },
  quantitySpoiled: {
    type: Number,
    required: true,
  },
  supplierName: {
    type: String,
  },
  dateReceived: {
    type: Date,
  },
  dateSpoiled: { // The date this record was created
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('SpoiledProduct', spoiledProductSchema);
