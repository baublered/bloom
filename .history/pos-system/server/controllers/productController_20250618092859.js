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
      lifespan
    } = req.body;

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
const updateStock = async (req, res) => {
    try {
        const { cart } = req.body;

        if (!cart || !Array.isArray(cart)) {
            return res.status(400).json({ message: 'Invalid cart data provided.' });
        }

        const operations = cart.map(item => ({
            updateOne: {
                filter: { _id: item._id, quantity: { $gte: item.quantity } },
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

// Export all three functions
module.exports = {
  getAllProducts,
  addProduct,
  updateStock,
};
