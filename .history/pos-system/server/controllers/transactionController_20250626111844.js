const Transaction = require('../models/Transaction');
const Product = require('../models/Product');

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

    // --- FIX: Smarter stock deduction logic ---
    // 1. Create a list of all products that need their stock updated.
    const stockDeductionList = [];
    items.forEach(item => {
        if (item.isBouquet) {
            // If the item is a bouquet, add its components to the list.
            item.components.forEach(component => {
                stockDeductionList.push({ 
                    productId: component._id, 
                    quantity: component.quantity,
                    productName: component.productName
                });
            });
        } else {
            // If it's a regular item, add it directly.
            stockDeductionList.push({ 
                productId: item._id, 
                quantity: item.quantity,
                productName: item.productName
            });
        }
    });

    // 2. Check for sufficient stock for all items at once.
    for (const item of stockDeductionList) {
        const product = await Product.findById(item.productId);
        if (!product || product.quantity < item.quantity) {
            return res.status(400).json({ message: `Not enough stock for ${item.productName}. Only ${product ? product.quantity : 0} available.` });
        }
    }

    // 3. Create and save the new transaction document
    const newTransaction = new Transaction({
      transactionType,
      items, // The `items` array still holds the original cart structure for the receipt
      subtotal,
      discountAmount,
      totalAmount,
      paymentMethod,
      eventDetails,
    });
    await newTransaction.save();

    // 4. Create the database operations based on the processed stockDeductionList
    const operations = stockDeductionList.map(item => ({
        updateOne: {
            filter: { _id: item.productId },
            update: { $inc: { quantity: -item.quantity } }
        }
    }));

    if (operations.length > 0) {
        await Product.bulkWrite(operations);
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

exports.getAllTransactions = async (req, res) => {
    try {
        const transactions = await Transaction.find({}).sort({ createdAt: -1 });
        res.status(200).json(transactions);
    } catch (error) {
        console.error('Error fetching transactions:', error);
        res.status(500).json({ message: 'Failed to fetch transaction history.' });
    }
};
