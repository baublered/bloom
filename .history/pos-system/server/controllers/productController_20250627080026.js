const Product = require('../models/Product');

// Get all products from the database
const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find({}).sort({ createdAt: -1 });
    res.status(200).json(products);
  } catch (err) {
    console.error('Error fetching products:', err);
    res.status(500).json({ message: 'Failed to fetch products', error: err.message });
  }
};

// Add a new product to the database
const addProduct = async (req, res) => {
  try {
    const {
      productName,
      productCategory,
      price,
      quantity,
      supplierName,
      dateReceived,
      lifespanInDays 
    } = req.body;

    if (!productName || !productCategory || !price || !quantity || !lifespanInDays) {
        return res.status(400).json({ message: 'Please fill out all required fields, including lifespan.' });
    }

    const newProduct = new Product({
        productName,
        productCategory,
        price,
        quantity,
        supplierName,
        dateReceived,
        lifespanInDays
    });

    await newProduct.save();
    res.status(201).json({ message: 'Product added successfully!', product: newProduct });

  } catch (err) {
    console.error('Error adding product:', err);
    res.status(500).json({ message: err.message || 'Failed to add product' });
  }
};

// This is your existing function for deducting stock after a sale
const updateStock = async (req, res) => {
    try {
        const { cart } = req.body;

        if (!cart || !Array.isArray(cart)) {
            return res.status(400).json({ message: 'Invalid cart data provided.' });
        }

        const operations = cart.map(item => ({
            updateOne: {
                filter: { _id: item.productId, quantity: { $gte: item.quantity } },
                update: { $inc: { quantity: -item.quantity } }
            }
        }));

        const result = await Product.bulkWrite(operations);
        
        if (result.matchedCount !== cart.length) {
            return res.status(400).json({ message: 'Could not update stock for one or more items due to insufficient quantity.' });
        }

        res.status(200).json({ 
            success: true, 
            message: 'Inventory updated successfully.'
        });

    } catch (error) {
        console.error('Error updating stock:', error);
        res.status(500).json({ message: 'Failed to update inventory.' });
    }
};

// --- UPDATED: Function to handle adding stock with more robust validation ---
const restockProducts = async (req, res) => {
    try {
        const quantitiesToRestock = req.body;

        if (Object.keys(quantitiesToRestock).length === 0) {
            return res.status(400).json({ message: 'No restock data provided.' });
        }

        const operations = Object.entries(quantitiesToRestock).map(([productId, quantity]) => {
            const restockAmount = parseInt(quantity, 10);
            if (isNaN(restockAmount) || restockAmount <= 0) {
                return null;
            }
            return {
                updateOne: {
                    filter: { _id: productId },
                    update: { $inc: { quantity: restockAmount } }
                }
            };
        }).filter(Boolean);

        if (operations.length > 0) {
            const result = await Product.bulkWrite(operations);
            // --- FIX: Check if the number of products found matches the number of operations ---
            // This is a more reliable way to confirm the restock worked.
            if (result.matchedCount !== operations.length) {
                 return res.status(404).json({ message: 'One or more products could not be found to update.' });
            }
        } else {
            return res.status(400).json({ message: 'No valid quantities to restock.' });
        }

        res.status(200).json({
            success: true,
            message: 'Products have been restocked successfully.'
        });

    } catch (error) {
        console.error('Error restocking products:', error);
        res.status(500).json({ message: 'Failed to restock products.' });
    }
};


// Make sure to export all four functions
module.exports = {
  getAllProducts,
  addProduct,
  updateStock,
  restockProducts,
};
