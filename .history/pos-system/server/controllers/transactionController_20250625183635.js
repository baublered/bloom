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

    // --- DEBUGGING STEP 1: Log the incoming items array ---
    console.log('[DEBUG] Received items for transaction:', JSON.stringify(items, null, 2));

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
        console.log('[DEBUG] No items in cart to update stock.');
        return res.status(201).json({ 
            success: true, 
            message: 'Transaction recorded (no items to update).',
            transaction: newTransaction 
        });
    }

    const operations = items.map(item => {
        // Add a check to ensure productId exists
        if (!item.productId) {
            console.error('[DEBUG] Error: Item is missing productId', item);
            return null; 
        }
        return {
            updateOne: {
                filter: { _id: item.productId }, 
                update: { $inc: { quantity: -item.quantity } }
            }
        };
    }).filter(Boolean); // Filter out any null operations

    // --- DEBUGGING STEP 2: Log the operations being sent to the database ---
    console.log('[DEBUG] Executing bulkWrite operations:', JSON.stringify(operations, null, 2));

    if (operations.length > 0) {
        const result = await Product.bulkWrite(operations);
        // --- DEBUGGING STEP 3: Log the result of the database operation ---
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
