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
  
  // Discount fields
  subtotal: { type: Number, default: 0 },
  discountAmount: { type: Number, default: 0 },
  discountPercentage: { type: Number, default: 0 },

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
      proofOfPayment: { type: String }, // To store filename or URL of uploaded proof
      isDownpayment: { type: Boolean, default: false } // Flag to identify downpayments
  }]
}, {
  timestamps: true
});

// --- Logic to automatically calculate totals before saving ---
// This Mongoose "pre-save hook" runs every time an event is saved or updated.
eventSchema.pre('save', function(next) {
    console.log('🔧 Pre-save hook running for event:', this._id);
    console.log('🔧 Current values:', {
        totalAmount: this.totalAmount,
        discountAmount: this.discountAmount,
        discountPercentage: this.discountPercentage,
        paymentHistoryLength: this.paymentHistory.length
    });
    
    // Only auto-calculate if totalAmount is not manually set (no discount scenario)
    if (this.totalAmount === 0 || (this.discountAmount === 0 && this.discountPercentage === 0)) {
        // Calculate the total amount from the products array (original behavior)
        this.totalAmount = this.products.reduce((acc, item) => acc + (item.price * item.quantity), 0);
        console.log('🔧 Calculated totalAmount from products:', this.totalAmount);
    }
    
    // Always recalculate total paid from payment history
    this.totalPaid = this.paymentHistory.reduce((acc, payment) => acc + payment.amountPaid, 0);
    
    // Always recalculate remaining balance using the correct total amount
    this.remainingBalance = this.totalAmount - this.totalPaid;

    console.log('🔧 Calculated values:', {
        totalPaid: this.totalPaid,
        remainingBalance: this.remainingBalance
    });

    // Update the status based on the remaining balance
    if (this.remainingBalance <= 0 && this.totalAmount > 0) {
        this.status = 'Fully Paid';
    } else if (this.totalAmount > 0) {
        this.status = 'Pending';
    }

    console.log('🔧 Final status:', this.status);
    next(); // Continue with the save operation
});


module.exports = mongoose.model('Event', eventSchema);
