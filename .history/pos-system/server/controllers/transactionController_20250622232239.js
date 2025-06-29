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
      eventDetails, // This will be present for 'Events' type
    } = req.body;

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

    // 2. After saving the transaction, update the product stock
    const operations = items.map(item => ({
        updateOne: {
            filter: { _id: item._id },
            update: { $inc: { quantity: -item.quantity } }
        }
    }));
    await Product.bulkWrite(operations);

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
