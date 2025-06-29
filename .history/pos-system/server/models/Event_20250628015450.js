const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  customerName: { type: String, required: true },
  address: { type: String, required: true },
  phone: { type: String, required: true },
  eventType: { type: String, required: true },
  notes: { type: String },
  eventDate: { type: Date, required: true },
  
  status: {
    type: String,
    enum: ['Pending', 'Fully Paid', 'Cancelled'],
    default: 'Pending',
  },
  
  // These fields will be calculated based on the arrays below
  totalAmount: { type: Number, default: 0 },
  totalPaid: { type: Number, default: 0 },
  remainingBalance: { type: Number, default: 0 },

  // This array will store all the products selected for the event
  products: [{
      productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
      productName: String,
      quantity: Number,
      price: Number,
  }],

  // --- NEW: This array will store a history of all payments made ---
  paymentHistory: [{
      amountPaid: { type: Number, required: true },
      paymentDate: { type: Date, default: Date.now },
      paymentMethod: { type: String },
      proofOfPayment: { type: String } // To store filename or URL of uploaded proof
  }]
}, {
  timestamps: true
});

// --- NEW: Logic to automatically calculate totals before saving ---
// This Mongoose "pre-save hook" runs every time an event is saved or updated.
eventSchema.pre('save', function(next) {
    // Calculate the total amount from the products array
    this.totalAmount = this.products.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    
    // Calculate the total amount paid from the payment history
    this.totalPaid = this.paymentHistory.reduce((acc, payment) => acc + payment.amountPaid, 0);

    // Calculate the remaining balance
    this.remainingBalance = this.totalAmount - this.totalPaid;

    // Update the status based on the remaining balance
    if (this.remainingBalance <= 0 && this.totalAmount > 0) {
        this.status = 'Fully Paid';
    } else {
        this.status = 'Pending';
    }

    next(); // Continue with the save operation
});


module.exports = mongoose.model('Event', eventSchema);
