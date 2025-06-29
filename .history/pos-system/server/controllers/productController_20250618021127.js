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
    // The data comes from the ProductRegistration form
    const {
      productName,
      productCategory,
      price,
      quantity,
      supplierName,
      dateReceived,
      lifespan
    } = req.body;

    // Basic validation
    if (!productName || !productCategory || !price || !quantity) {
        return res.status(400).json({ message: 'Please fill out all required fields.' });
    }

    const newProduct = new Product({
        productName,
        productCategory,
        price,
        quantity,
        supplierName,
        dateReceived,
        lifespan
    });

    await newProduct.save();
    res.status(201).json({ message: 'Product added successfully!', product: newProduct });

  } catch (err) {
    console.error('Error adding product:', err);
    res.status(500).json({ message: 'Failed to add product', error: err.message });
  }
};

// --- NEW FUNCTION TO UPDATE STOCK ---
// This function will be called after a successful payment
const updateStock = async (req, res) => {
    try {
        const { cart } = req.body; // Expect an array of cart items

        if (!cart || !Array.isArray(cart)) {
            return res.status(400).json({ message: 'Invalid cart data provided.' });
        }

        // Create an array of update operations to perform in one go
        const operations = cart.map(item => ({
            updateOne: {
                filter: { _id: item._id, quantity: { $gte: item.quantity } }, // Ensure stock is sufficient
                // Use $inc to decrement the quantity field by the amount sold
                update: { $inc: { quantity: -item.quantity } }
            }
        }));

        // Execute all updates in a single database transaction
        const result = await Product.bulkWrite(operations);

        // Check if any products were not found or had insufficient stock
        if (result.matchedCount !== cart.length) {
            // This is a simple way to handle stock errors, could be made more robust
            return res.status(400).json({ message: 'Could not update stock for one or more items, possibly due to insufficient quantity.' });
        }

        res.status(200).json({ 
            success: true, 
            message: 'Inventory updated successfully.',
            result
        });

    } catch (error) {
        console.error('Error updating stock:', error);
        res.status(500).json({ message: 'Failed to update inventory.' });
    }
};

// Export all functions to be used by the router
module.exports = {
  getAllProducts,
  addProduct,
  updateStock,
};
