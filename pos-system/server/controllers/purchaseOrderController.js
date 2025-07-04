const PurchaseOrder = require('../models/PurchaseOrder');
const Product = require('../models/Product');
const User = require('../models/User');

// Create a new purchase order
exports.createPurchaseOrder = async (req, res) => {
    try {
        const { poNumber, supplier, expectedDeliveryDate, notes, items } = req.body;
        const userId = req.user.id;

        // Validate required fields
        if (!poNumber || !supplier || !items || items.length === 0) {
            return res.status(400).json({ 
                message: 'PO Number, supplier, and at least one item are required' 
            });
        }

        // Validate items
        for (const item of items) {
            if (!item.productId || !item.quantity || item.quantity <= 0 || item.unitPrice == null || item.unitPrice < 0) {
                return res.status(400).json({ 
                    message: 'Each item must have a valid product, quantity, and unit price' 
                });
            }

            // Check if product exists
            const product = await Product.findById(item.productId);
            if (!product) {
                return res.status(404).json({ 
                    message: `Product with ID ${item.productId} not found` 
                });
            }
        }

        // Check if PO number already exists
        const existingPO = await PurchaseOrder.findOne({ poNumber });
        if (existingPO) {
            return res.status(400).json({ 
                message: 'Purchase order number already exists' 
            });
        }

        // Calculate total prices for items
        const processedItems = items.map(item => {
            const totalPrice = item.quantity * item.unitPrice;
            return {
                ...item,
                totalPrice: totalPrice
            };
        });

        // Calculate total amount
        const totalAmount = processedItems.reduce((sum, item) => sum + item.totalPrice, 0);

        console.log('Processed items:', processedItems);
        console.log('Total amount calculated:', totalAmount);

        // Create purchase order
        const purchaseOrder = new PurchaseOrder({
            poNumber,
            supplier,
            expectedDeliveryDate: expectedDeliveryDate || null,
            notes: notes || '',
            items: processedItems,
            totalAmount,
            createdBy: userId
        });

        await purchaseOrder.save();

        // Populate product details
        await purchaseOrder.populate('items.productId', 'productName productCategory');
        await purchaseOrder.populate('createdBy', 'username');

        res.status(201).json({
            message: 'Purchase order created successfully',
            purchaseOrder
        });

    } catch (error) {
        console.error('Error creating purchase order:', error);
        res.status(500).json({ 
            message: 'Error creating purchase order',
            error: error.message 
        });
    }
};

// Get all purchase orders
exports.getPurchaseOrders = async (req, res) => {
    try {
        const { status, supplier, page = 1, limit = 10 } = req.query;
        
        // Build filter object
        const filter = {};
        if (status) filter.status = status;
        if (supplier) filter.supplier = { $regex: supplier, $options: 'i' };

        // Calculate skip value for pagination
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const purchaseOrders = await PurchaseOrder.find(filter)
            .populate('createdBy', 'username')
            .populate('receivedBy', 'username')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await PurchaseOrder.countDocuments(filter);

        res.json({
            purchaseOrders,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(total / parseInt(limit)),
                totalItems: total,
                itemsPerPage: parseInt(limit)
            }
        });

    } catch (error) {
        console.error('Error fetching purchase orders:', error);
        res.status(500).json({ 
            message: 'Error fetching purchase orders',
            error: error.message 
        });
    }
};

// Get a specific purchase order
exports.getPurchaseOrder = async (req, res) => {
    try {
        const { id } = req.params;

        const purchaseOrder = await PurchaseOrder.findById(id)
            .populate('items.productId', 'productName productCategory')
            .populate('createdBy', 'username')
            .populate('receivedBy', 'username');

        if (!purchaseOrder) {
            return res.status(404).json({ message: 'Purchase order not found' });
        }

        res.json(purchaseOrder);

    } catch (error) {
        console.error('Error fetching purchase order:', error);
        res.status(500).json({ 
            message: 'Error fetching purchase order',
            error: error.message 
        });
    }
};

// Update purchase order status
exports.updatePurchaseOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const validStatuses = ['Pending', 'Partially Received', 'Received', 'Cancelled'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ 
                message: 'Invalid status. Must be one of: ' + validStatuses.join(', ') 
            });
        }

        const purchaseOrder = await PurchaseOrder.findById(id);
        if (!purchaseOrder) {
            return res.status(404).json({ message: 'Purchase order not found' });
        }

        purchaseOrder.status = status;
        if (status === 'Received') {
            purchaseOrder.actualDeliveryDate = new Date();
            purchaseOrder.receivedBy = req.user.id;
        }

        await purchaseOrder.save();

        res.json({
            message: 'Purchase order status updated successfully',
            purchaseOrder
        });

    } catch (error) {
        console.error('Error updating purchase order status:', error);
        res.status(500).json({ 
            message: 'Error updating purchase order status',
            error: error.message 
        });
    }
};

// Delete purchase order
exports.deletePurchaseOrder = async (req, res) => {
    try {
        const { id } = req.params;

        const purchaseOrder = await PurchaseOrder.findById(id);
        if (!purchaseOrder) {
            return res.status(404).json({ message: 'Purchase order not found' });
        }

        // Only allow deletion if status is Pending or Cancelled
        if (!['Pending', 'Cancelled'].includes(purchaseOrder.status)) {
            return res.status(400).json({ 
                message: 'Cannot delete a purchase order that has been received' 
            });
        }

        await PurchaseOrder.findByIdAndDelete(id);

        res.json({ message: 'Purchase order deleted successfully' });

    } catch (error) {
        console.error('Error deleting purchase order:', error);
        res.status(500).json({ 
            message: 'Error deleting purchase order',
            error: error.message 
        });
    }
};

// Receive purchase order and update inventory
exports.receivePurchaseOrder = async (req, res) => {
    try {
        const { id } = req.params;
        const { receivedItems } = req.body;

        // Find the purchase order
        const purchaseOrder = await PurchaseOrder.findById(id).populate('items.productId');
        if (!purchaseOrder) {
            return res.status(404).json({ message: 'Purchase order not found' });
        }

        // Check if PO can be received
        if (purchaseOrder.status === 'Received') {
            return res.status(400).json({ message: 'Purchase order has already been received' });
        }

        if (purchaseOrder.status === 'Cancelled') {
            return res.status(400).json({ message: 'Cannot receive a cancelled purchase order' });
        }

        // Process received items and update inventory
        // If receivedItems is provided, use it; otherwise process all items from the PO
        const itemsToProcess = receivedItems || purchaseOrder.items.map(item => ({
            productId: item.productId._id || item.productId,
            receivedQuantity: item.quantity
        }));

        console.log('Processing received items:', itemsToProcess);

        for (const receivedItem of itemsToProcess) {
            const { productId, receivedQuantity } = receivedItem;
            
            if (receivedQuantity <= 0) continue;

            // Find the product and update its quantity
            const product = await Product.findById(productId);
            if (product) {
                console.log(`Updating product ${product.productName}: ${product.quantity} + ${receivedQuantity} = ${product.quantity + receivedQuantity}`);
                
                // Update the product quantity
                product.quantity += receivedQuantity;
                
                // Update the date restocked
                product.dateRestocked = new Date();
                
                await product.save();
                
                console.log(`Product ${product.productName} updated successfully`);
            } else {
                console.error(`Product with ID ${productId} not found`);
            }
        }

        // Update purchase order status
        purchaseOrder.status = 'Received';
        purchaseOrder.receivedBy = req.user.id;
        purchaseOrder.receivedDate = new Date();
        
        await purchaseOrder.save();

        console.log('Purchase order received successfully:', purchaseOrder.poNumber);

        res.json({ 
            success: true,
            message: 'Purchase order received successfully and inventory updated',
            purchaseOrder 
        });

    } catch (error) {
        console.error('Error receiving purchase order:', error);
        res.status(500).json({ 
            message: 'Error receiving purchase order',
            error: error.message 
        });
    }
};
