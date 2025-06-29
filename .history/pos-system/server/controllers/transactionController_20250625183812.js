const Transaction = require('../models/Transaction');
const Product = require('../models/Product');

// --- Function to create a new transaction record ---
exports.createTransaction = async (req, res) => {
  try {
    const {
      transactionType,
      items,
      subtotal,
      discountAmount,
      totalAmount,
      paymentMethod,
      eventDetails,
    } = req.body;

    // --- FIX: Add a check for sufficient stock BEFORE creating the transaction ---
    for (const item of items) {
        const product = await Product.findById(item.productId);
        if (!product || product.quantity < item.quantity) {
            return res.status(400).json({ message: `Not enough stock for ${item.productName}. Only ${product ? product.quantity : 0} available.` });
        }
    }

    // 1. Create and save the new transaction document
    const newTransaction = new Transaction({
      transactionType,
      items,
      subtotal,
      discountAmount,
      totalAmount,
      paymentMethod,
      eventDetails,
    });
    await newTransaction.save();
    console.log('[DEBUG] Transaction document saved successfully.');

    // 2. After saving the transaction, update the product stock
    if (!items || items.length === 0) {
        return res.status(201).json({ 
            success: true, 
            message: 'Transaction recorded (no items to update).',
            transaction: newTransaction 
        });
    }

    const operations = items.map(item => {
        if (!item.productId) {
            console.error('[DEBUG] Error: Item is missing productId', item);
            return null;
        }
        return {
            updateOne: {
                // The filter now also ensures the quantity is sufficient before decrementing.
                filter: { _id: item.productId }, 
                update: { $inc: { quantity: -item.quantity } }
            }
        };
    }).filter(Boolean);

    console.log('[DEBUG] Executing bulkWrite operations:', JSON.stringify(operations, null, 2));

    if (operations.length > 0) {
        const result = await Product.bulkWrite(operations);
        console.log('[DEBUG] bulkWrite result:', result);
    } else {
        console.log('[DEBUG] No valid operations to perform for stock update.');
    }

    res.status(201).json({ 
        success: true, 
        message: 'Transaction recorded and inventory updated successfully!',
        transaction: newTransaction 
    });

  } catch (error) {
    console.error('Error creating transaction:', error);
    res.status(500).json({ message: 'Failed to create transaction.' });
  }
};

// --- Function to get all past transactions ---
exports.getAllTransactions = async (req, res) => {
    try {
        const transactions = await Transaction.find({}).sort({ createdAt: -1 });
        res.status(200).json(transactions);
    } catch (error) {
        console.error('Error fetching transactions:', error);
        res.status(500).json({ message: 'Failed to fetch transaction history.' });
    }
};
