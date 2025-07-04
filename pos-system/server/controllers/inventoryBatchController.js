const InventoryBatch = require('../models/InventoryBatch');
const PurchaseOrder = require('../models/PurchaseOrder');
const Product = require('../models/Product');

// Receive items from a purchase order and create inventory batches
exports.receiveItems = async (req, res) => {
    try {
        const { purchaseOrderId, receivedItems } = req.body;
        const userId = req.user.id;

        // Validate input
        if (!purchaseOrderId || !receivedItems || receivedItems.length === 0) {
            return res.status(400).json({ 
                message: 'Purchase order ID and received items are required' 
            });
        }

        // Find the purchase order
        const purchaseOrder = await PurchaseOrder.findById(purchaseOrderId);
        if (!purchaseOrder) {
            return res.status(404).json({ message: 'Purchase order not found' });
        }

        if (purchaseOrder.status === 'Cancelled') {
            return res.status(400).json({ 
                message: 'Cannot receive items from a cancelled purchase order' 
            });
        }

        const createdBatches = [];

        // Process each received item
        for (const receivedItem of receivedItems) {
            const { productId, quantityReceived, unitCost, receivedDate } = receivedItem;

            // Find the corresponding item in the purchase order
            const poItem = purchaseOrder.items.find(
                item => item.productId.toString() === productId.toString()
            );

            if (!poItem) {
                return res.status(400).json({ 
                    message: `Product ${productId} not found in purchase order` 
                });
            }

            // Check if received quantity doesn't exceed ordered quantity
            const totalReceivedSoFar = poItem.receivedQuantity + quantityReceived;
            if (totalReceivedSoFar > poItem.quantity) {
                return res.status(400).json({ 
                    message: `Cannot receive more than ordered quantity for product ${productId}` 
                });
            }

            // Get product details
            const product = await Product.findById(productId);
            if (!product) {
                return res.status(404).json({ 
                    message: `Product ${productId} not found` 
                });
            }

            // Generate batch number
            const batchNumber = `BATCH-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;

            // Create inventory batch
            const inventoryBatch = new InventoryBatch({
                productId,
                purchaseOrderId,
                batchNumber,
                quantity: quantityReceived,
                remainingQuantity: quantityReceived,
                unitCost: unitCost || poItem.unitPrice,
                receivedDate: receivedDate || new Date(),
                lifespanInDays: product.lifespanInDays,
                supplier: purchaseOrder.supplier
            });

            await inventoryBatch.save();
            createdBatches.push(inventoryBatch);

            // Update received quantity in purchase order
            poItem.receivedQuantity += quantityReceived;

            // Update product stock
            product.stock += quantityReceived;
            await product.save();
        }

        // Update purchase order status
        purchaseOrder.updateStatus();
        purchaseOrder.receivedBy = userId;
        await purchaseOrder.save();

        res.status(201).json({
            message: 'Items received successfully',
            batches: createdBatches,
            purchaseOrder
        });

    } catch (error) {
        console.error('Error receiving items:', error);
        res.status(500).json({ 
            message: 'Error receiving items',
            error: error.message 
        });
    }
};

// Get all inventory batches
exports.getInventoryBatches = async (req, res) => {
    try {
        const { productId, status, page = 1, limit = 10 } = req.query;
        
        // Build filter object
        const filter = {};
        if (productId) filter.productId = productId;
        if (status) filter.status = status;

        // Calculate skip value for pagination
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const batches = await InventoryBatch.find(filter)
            .populate('productId', 'productName productCategory')
            .populate('purchaseOrderId', 'poNumber supplier')
            .sort({ receivedDate: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await InventoryBatch.countDocuments(filter);

        res.json({
            batches,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(total / parseInt(limit)),
                totalItems: total,
                itemsPerPage: parseInt(limit)
            }
        });

    } catch (error) {
        console.error('Error fetching inventory batches:', error);
        res.status(500).json({ 
            message: 'Error fetching inventory batches',
            error: error.message 
        });
    }
};

// Get active batches for a specific product (FIFO order)
exports.getActiveBatches = async (req, res) => {
    try {
        const { productId } = req.params;

        const batches = await InventoryBatch.getActiveBatches(productId)
            .populate('productId', 'productName productCategory')
            .populate('purchaseOrderId', 'poNumber supplier');

        res.json(batches);

    } catch (error) {
        console.error('Error fetching active batches:', error);
        res.status(500).json({ 
            message: 'Error fetching active batches',
            error: error.message 
        });
    }
};

// Update batch status (e.g., mark as expired)
exports.updateBatchStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const validStatuses = ['Active', 'Expired', 'Depleted'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ 
                message: 'Invalid status. Must be one of: ' + validStatuses.join(', ') 
            });
        }

        const batch = await InventoryBatch.findById(id);
        if (!batch) {
            return res.status(404).json({ message: 'Inventory batch not found' });
        }

        batch.status = status;
        await batch.save();

        res.json({
            message: 'Batch status updated successfully',
            batch
        });

    } catch (error) {
        console.error('Error updating batch status:', error);
        res.status(500).json({ 
            message: 'Error updating batch status',
            error: error.message 
        });
    }
};

// Get batches expiring soon
exports.getExpiringBatches = async (req, res) => {
    try {
        const { days = 7 } = req.query; // Default to 7 days
        
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + parseInt(days));

        const expiringBatches = await InventoryBatch.find({
            status: 'Active',
            expiryDate: { $lte: futureDate, $gte: new Date() },
            remainingQuantity: { $gt: 0 }
        })
        .populate('productId', 'productName productCategory')
        .populate('purchaseOrderId', 'poNumber supplier')
        .sort({ expiryDate: 1 });

        res.json(expiringBatches);

    } catch (error) {
        console.error('Error fetching expiring batches:', error);
        res.status(500).json({ 
            message: 'Error fetching expiring batches',
            error: error.message 
        });
    }
};
