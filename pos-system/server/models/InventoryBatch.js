const mongoose = require('mongoose');

const inventoryBatchSchema = new mongoose.Schema({
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    purchaseOrderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'PurchaseOrder',
        required: true
    },
    batchNumber: {
        type: String,
        required: true,
        unique: true
    },
    quantity: {
        type: Number,
        required: true,
        min: 0
    },
    remainingQuantity: {
        type: Number,
        required: true,
        min: 0
    },
    unitCost: {
        type: Number,
        required: true,
        min: 0
    },
    receivedDate: {
        type: Date,
        required: true,
        default: Date.now
    },
    expiryDate: {
        type: Date,
        required: function() {
            // Only required for products with lifespans (like flowers)
            return this.lifespanInDays && this.lifespanInDays > 0;
        }
    },
    lifespanInDays: {
        type: Number,
        min: 0
    },
    supplier: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['Active', 'Expired', 'Depleted'],
        default: 'Active'
    },
    notes: {
        type: String,
        default: ''
    }
}, {
    timestamps: true
});

// Index for efficient querying
inventoryBatchSchema.index({ productId: 1, status: 1 });
inventoryBatchSchema.index({ expiryDate: 1 });
inventoryBatchSchema.index({ batchNumber: 1 });

// Pre-save middleware to calculate expiry date
inventoryBatchSchema.pre('save', function(next) {
    if (this.lifespanInDays && this.lifespanInDays > 0 && this.receivedDate) {
        const expiryDate = new Date(this.receivedDate);
        expiryDate.setDate(expiryDate.getDate() + this.lifespanInDays);
        this.expiryDate = expiryDate;
    }
    next();
});

// Instance method to check if batch is expired
inventoryBatchSchema.methods.isExpired = function() {
    if (!this.expiryDate) return false;
    return new Date() > this.expiryDate;
};

// Instance method to check if batch is depleted
inventoryBatchSchema.methods.isDepleted = function() {
    return this.remainingQuantity <= 0;
};

// Static method to get active batches for a product (FIFO order)
inventoryBatchSchema.statics.getActiveBatches = function(productId) {
    return this.find({
        productId: productId,
        status: 'Active',
        remainingQuantity: { $gt: 0 }
    }).sort({ receivedDate: 1 }); // FIFO - oldest first
};

module.exports = mongoose.model('InventoryBatch', inventoryBatchSchema);
