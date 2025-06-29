const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  // Details about the transaction itself
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
  // Details about the items sold
  items: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
      productName: String,
      quantity: Number,
      price: Number,
    },
  ],
  // Details specific to 'Events' transactions
  eventDetails: {
    customerName: String,
    address: String,
    phone: String,
    eventType: String,
    notes: String,
    eventDate: Date,
  },
  // The user who processed the transaction
  cashierName: {
      type: String,
      default: 'Employee 1' // You can update this with real user data later
  }
}, {
  timestamps: true // Adds `createdAt` and `updatedAt` fields
});

module.exports = mongoose.model('Transaction', transactionSchema);
