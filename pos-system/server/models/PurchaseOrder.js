const mongoose = require('mongoose');

const purchaseOrderItemSchema = new mongoose.Schema({
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    productName: {
        type: String,
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        min: 1
    },
    unitPrice: {
        type: Number,
        required: true,
        min: 0
    },
    totalPrice: {
        type: Number,
        required: true,
        min: 0
    },
    lifespanInDays: {
        type: Number,
        min: 0
    },
    receivedQuantity: {
        type: Number,
        default: 0,
        min: 0
    }
});

const purchaseOrderSchema = new mongoose.Schema({
    poNumber: {
        type: String,
        required: true,
        unique: true
    },
    supplier: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['Pending', 'Partially Received', 'Received', 'Cancelled'],
        default: 'Pending'
    },
    orderDate: {
        type: Date,
        default: Date.now
    },
    expectedDeliveryDate: {
        type: Date
    },
    actualDeliveryDate: {
        type: Date
    },
    items: [purchaseOrderItemSchema],
    totalAmount: {
        type: Number,
        required: true,
        min: 0
    },
    notes: {
        type: String,
        default: ''
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    receivedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    receivedDate: {
        type: Date
    }
}, {
    timestamps: true
});

// Index for efficient querying
purchaseOrderSchema.index({ poNumber: 1 });
purchaseOrderSchema.index({ supplier: 1 });
purchaseOrderSchema.index({ status: 1 });
purchaseOrderSchema.index({ orderDate: 1 });

// Pre-save middleware to calculate total amount
purchaseOrderSchema.pre('save', function(next) {
    if (this.items && this.items.length > 0) {
        this.totalAmount = this.items.reduce((total, item) => total + item.totalPrice, 0);
    }
    next();
});

// Instance method to check if PO is fully received
purchaseOrderSchema.methods.isFullyReceived = function() {
    return this.items.every(item => item.receivedQuantity >= item.quantity);
};

// Instance method to check if PO is partially received
purchaseOrderSchema.methods.isPartiallyReceived = function() {
    return this.items.some(item => item.receivedQuantity > 0) && 
           !this.isFullyReceived();
};

// Instance method to update status based on received quantities
purchaseOrderSchema.methods.updateStatus = function() {
    if (this.isFullyReceived()) {
        this.status = 'Received';
        this.actualDeliveryDate = new Date();
    } else if (this.isPartiallyReceived()) {
        this.status = 'Partially Received';
    } else {
        this.status = 'Pending';
    }
};

module.exports = mongoose.model('PurchaseOrder', purchaseOrderSchema);
