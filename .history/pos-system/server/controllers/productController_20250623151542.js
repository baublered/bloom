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
      lifespanInDays // This now comes from the form
    } = req.body;

    // --- FIX: Added validation for lifespanInDays ---
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
        lifespanInDays // Save the correct field
    });

    await newProduct.save();
    res.status(201).json({ message: 'Product added successfully!', product: newProduct });

  } catch (err) {
    console.error('Error adding product:', err);
    // Send back the specific validation error message from Mongoose
    res.status(500).json({ message: err.message || 'Failed to add product' });
  }
};

const updateStock = async (req, res) => {
    // ... your existing updateStock function
};

module.exports = {
  getAllProducts,
  addProduct,
  updateStock,
};
