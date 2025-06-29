const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  customerName: { type: String, required: true },
  address: { type: String, required: true },
  phone: { type: String, required: true },
  eventType: { type: String, required: true },
  notes: { type: String },
  eventDate: { type: Date, required: true },
  
  // --- NEW FIELDS for Payment Status and Amounts ---
  status: {
    type: String,
    enum: ['Pending', 'Fully Paid', 'Cancelled'],
    default: 'Pending', // New events will default to 'Pending'
  },
  totalAmount: {
    type: Number,
    required: true,
    default: 0,
  },
  downPayment: {
    type: Number,
    default: 0,
  },
  remainingBalance: {
      type: Number,
      default: 0,
  },
  // To link the selected products to the event
  products: [{
      productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
      productName: String,
      quantity: Number,
      price: Number,
  }],
}, {
  timestamps: true // Adds createdAt and updatedAt fields
});

module.exports = mongoose.model('Event', eventSchema);
