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

            // Check if product exists and get its details
            const product = await Product.findById(item.productId);
            if (!product) {
                return res.status(404).json({ 
                    message: `Product with ID ${item.productId} not found` 
                });
            }

            // Special validation for accessories - they must have a price > 0
            if (product.productCategory === 'Accessories') {
                if (!item.unitPrice || item.unitPrice <= 0) {
                    return res.status(400).json({ 
                        message: `Accessory "${product.productName}" must have a valid price greater than 0` 
                    });
                }
            }

            // Validate reasonable quantities (prevent potential errors)
            if (item.quantity > 100000) {
                return res.status(400).json({ 
                    message: `Quantity for "${product.productName}" seems unusually high. Please verify.` 
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
            .populate('items.productId', 'productName productCategory')
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

// Generate PDF for purchase order
exports.generatePurchaseOrderPDF = async (req, res) => {
    try {
        const { id } = req.params;
        console.log(`\n=== PDF Generation Request ===`);
        console.log(`Requested PO ID: ${id}`);
        console.log(`Request URL: ${req.originalUrl}`);
        console.log(`Request method: ${req.method}`);

        // Validate ObjectId format
        if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
            console.log(`Invalid ID format: ${id}`);
            return res.status(400).json({ message: 'Invalid purchase order ID format' });
        }

        console.log(`Searching for PO with ID: ${id}`);

        // First, let's try to find the PO without population to see if it exists at all
        const basicPO = await PurchaseOrder.findById(id);
        console.log(`Basic query result: ${basicPO ? 'FOUND' : 'NOT FOUND'}`);

        const purchaseOrder = await PurchaseOrder.findById(id)
            .populate('items.productId', 'productName productCategory')
            .populate('createdBy', 'username');

        console.log(`Query result: ${purchaseOrder ? 'FOUND' : 'NOT FOUND'}`);
        
        if (purchaseOrder) {
            console.log(`Found PO details:`);
            console.log(`- PO Number: ${purchaseOrder.poNumber}`);
            console.log(`- Supplier: ${purchaseOrder.supplier}`);
            console.log(`- Status: ${purchaseOrder.status}`);
            console.log(`- Items count: ${purchaseOrder.items.length}`);
        } else {
            console.log(`Purchase order with ID ${id} not found in database`);
            
            // Let's also check if there are any POs in the database
            const totalPOs = await PurchaseOrder.countDocuments();
            console.log(`Total POs in database: ${totalPOs}`);
            
            if (totalPOs > 0) {
                const allPOs = await PurchaseOrder.find({}, '_id poNumber').limit(5);
                console.log(`Sample PO IDs in database:`, allPOs.map(po => ({ id: po._id, number: po.poNumber })));
            }
        }

        if (!purchaseOrder) {
            return res.status(404).json({ message: 'Purchase order not found' });
        }

        // Import PDFKit here to avoid loading it if not needed
        const PDFDocument = require('pdfkit');
        
        // Create PDF document
        const doc = new PDFDocument({ 
            margin: 50,
            size: 'A4'
        });

        // Set response headers for PDF download
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="PO-${purchaseOrder.poNumber}.pdf"`);

        // Pipe PDF to response
        doc.pipe(res);

        // Helper function to format currency
        const formatCurrency = (amount) => {
            return new Intl.NumberFormat('en-PH', {
                style: 'currency',
                currency: 'PHP'
            }).format(amount);
        };

        // Helper function to format date
        const formatDate = (date) => {
            if (!date) return 'N/A';
            return new Date(date).toLocaleDateString('en-PH', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        };

        // Title
        doc.fontSize(20).font('Helvetica-Bold').text('PURCHASE ORDER', 50, 50);
        
        // Purchase Order ID
        doc.fontSize(14).font('Helvetica-Bold').text(`Purchase Order ID: ${purchaseOrder.poNumber}`, 50, 90);

        // Company Info Section
        doc.fontSize(12).font('Helvetica-Bold').text('Order by: Flowers by Edmar', 50, 120);
        doc.fontSize(10).font('Helvetica').text('Address: H31 New Public Market, Antipolo City, Rizal', 50, 140);
        
        // Date Ordered
        doc.fontSize(10).font('Helvetica-Bold').text(`Date Ordered: ${formatDate(purchaseOrder.orderDate)}`, 50, 160);
        
        // Expected Delivery Date
        if (purchaseOrder.expectedDeliveryDate) {
            doc.text(`Expected Delivery: ${formatDate(purchaseOrder.expectedDeliveryDate)}`, 50, 180);
        }

        // Supplier Details Section
        doc.fontSize(12).font('Helvetica-Bold').text('Supplier Details', 50, 220);
        doc.fontSize(10).font('Helvetica-Bold').text(`Supplier Name: ${purchaseOrder.supplier}`, 50, 240);
        doc.fontSize(10).font('Helvetica').text('Supplier Address: [To be filled]', 50, 260);

        // Table Section
        const tableTop = 300;
        const tableLeft = 50;
        const tableWidth = 500;

        // Table Headers
        doc.fontSize(10).font('Helvetica-Bold');
        doc.text('Product Name', tableLeft, tableTop);
        doc.text('Qty', tableLeft + 200, tableTop);
        doc.text('Unit Price', tableLeft + 250, tableTop);
        doc.text('Total Price', tableLeft + 350, tableTop);

        // Draw header line
        doc.moveTo(tableLeft, tableTop + 15)
           .lineTo(tableLeft + tableWidth, tableTop + 15)
           .stroke();

        // Table Rows
        let currentY = tableTop + 25;
        doc.font('Helvetica');
        
        let grandTotal = 0;
        
        purchaseOrder.items.forEach((item, index) => {
            const itemTotal = item.totalPrice || (item.quantity * item.unitPrice);
            grandTotal += itemTotal;

            doc.text(item.productName, tableLeft, currentY);
            doc.text(item.quantity.toString(), tableLeft + 200, currentY);
            doc.text(formatCurrency(item.unitPrice), tableLeft + 250, currentY);
            doc.text(formatCurrency(itemTotal), tableLeft + 350, currentY);
            
            currentY += 20;
            
            // Add page break if needed
            if (currentY > 700) {
                doc.addPage();
                currentY = 50;
            }
        });

        // Draw line before total
        doc.moveTo(tableLeft + 250, currentY + 5)
           .lineTo(tableLeft + tableWidth, currentY + 5)
           .stroke();

        // Grand Total
        currentY += 15;
        doc.fontSize(12).font('Helvetica-Bold');
        doc.text('Grand Total:', tableLeft + 250, currentY);
        doc.text(formatCurrency(grandTotal), tableLeft + 350, currentY);

        // Notes Section
        if (purchaseOrder.notes && purchaseOrder.notes.trim()) {
            currentY += 40;
            if (currentY > 650) {
                doc.addPage();
                currentY = 50;
            }
            
            doc.fontSize(12).font('Helvetica-Bold').text('Notes:', tableLeft, currentY);
            currentY += 20;
            doc.fontSize(10).font('Helvetica').text(purchaseOrder.notes, tableLeft, currentY, {
                width: tableWidth,
                align: 'left'
            });
            currentY += 40;
        } else {
            currentY += 40;
        }

        // Authorized Signatory Section
        if (currentY > 650) {
            doc.addPage();
            currentY = 50;
        }

        doc.fontSize(12).font('Helvetica-Bold').text('Authorized Signatory:', tableLeft, currentY);
        currentY += 40; // Space for signature
        
        // Draw signature line
        doc.moveTo(tableLeft, currentY)
           .lineTo(tableLeft + 200, currentY)
           .stroke();
        
        currentY += 15;
        doc.fontSize(10).font('Helvetica').text('Signature over Printed Name', tableLeft, currentY);
        
        currentY += 20;
        doc.fontSize(10).font('Helvetica').text(`Date: _________________`, tableLeft, currentY);

        // Footer - Generated by information
        const footerY = 750;
        doc.fontSize(8).font('Helvetica').text(
            `Generated on: ${new Date().toLocaleDateString('en-PH')} | Generated by: ${req.user.username || 'System User'}`,
            50,
            footerY,
            { align: 'center', width: 500 }
        );

        // Finalize the PDF
        doc.end();

    } catch (error) {
        console.error('Error generating PDF:', error);
        res.status(500).json({ 
            message: 'Error generating PDF',
            error: error.message 
        });
    }
};
