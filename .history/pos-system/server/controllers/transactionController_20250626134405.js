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

    // --- FIX: This is the crucial new logic ---
    // 1. Prepare a separate list of items for the stock deduction logic.
    const stockDeductionList = [];
    items.forEach(item => {
        if (item.isBouquet) {
            // If it's a bouquet, we deduct stock for its components.
            item.components.forEach(component => {
                stockDeductionList.push({ productId: component._id, quantity: component.quantity });
            });
        } else {
            // If it's a regular product, we deduct stock for it directly.
            stockDeductionList.push({ productId: item._id, quantity: item.quantity });
        }
    });

    // 2. Prepare the items to be saved in the transaction history.
    // For bouquets, we remove the invalid `_id` to prevent the CastError.
    const itemsForTransactionRecord = items.map(item => {
        if (item.isBouquet) {
            // Create a new object without the top-level `_id` for bouquets
            const { _id, ...bouquetData } = item;
            // The productId for components is still valid and will be saved inside the components array
            return { ...bouquetData, productId: null }; // Set productId to null for the bouquet itself
        }
        // For regular items, we rename `_id` to `productId` to match the schema
        return { ...item, productId: item._id };
    });

    // 3. Check for sufficient stock using the processed list.
    for (const item of stockDeductionList) {
        const product = await Product.findById(item.productId);
        if (!product || product.quantity < item.quantity) {
            return res.status(400).json({ message: `Not enough stock for one or more items.` });
        }
    }

    // 4. Create and save the new transaction with the cleaned-up item list.
    const newTransaction = new Transaction({
      transactionType,
      items: itemsForTransactionRecord, // Use the cleaned-up list
      subtotal,
      discountAmount,
      totalAmount,
      paymentMethod,
      eventDetails,
    });
    await newTransaction.save();

    // 5. Perform the stock deduction using the processed list.
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
