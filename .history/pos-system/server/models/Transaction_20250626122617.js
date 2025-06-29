const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  transactionType: {
    type: String,
    required: true,
    enum: ['Retail', 'Events'],
  },
  totalAmount: {
    type: Number,
    required: true,
  },
  subtotal: {
    type: Number,
    required: true,
  },
  discountAmount: {
    type: Number,
    default: 0,
  },
  paymentMethod: {
    type: String,
    required: true,
  },
  // --- UPDATED: The 'items' array is now more flexible ---
  items: [
    {
      // ProductId is now optional, for custom items like bouquets
      productId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Product' 
      },
      productName: String,
      quantity: Number,
      price: Number,
      // We can also store the bouquet flag and its components for detailed records
      isBouquet: { type: Boolean, default: false },
      components: [mongoose.Schema.Types.Mixed]
    },
  ],
  eventDetails: {
    customerName: String,
    address: String,
    phone: String,
    eventType: String,
    notes: String,
    eventDate: Date,
  },
  cashierName: {
      type: String,
      default: 'Employee 1'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Transaction', transactionSchema);
