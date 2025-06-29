const Product = require('../models/Product');

// Get all products from the database
const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find({}).sort({ createdAt: -1 });
    res.status(200).json(products);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch products', error: err.message });
  }
};

// Add a new product to the database
const addProduct = async (req, res) => {
  try {
    const { productName, productCategory, price, quantity, supplierName, dateReceived, lifespanInDays } = req.body;
    
    // Basic required fields validation
    if (!productName || !productCategory || !quantity || !supplierName) {
        return res.status(400).json({ message: 'Please fill out all required fields: product name, category, quantity, and supplier name.' });
    }
    
    // Category-specific validation
    if (productCategory === 'Flowers') {
        if (!price || !lifespanInDays) {
            return res.status(400).json({ message: 'Price and lifespan are required for flower products.' });
        }
    } else if (productCategory === 'Accessories') {
        // Accessories don't need price or lifespan validation
        console.log('Creating accessory product without price/lifespan');
    } else {
        return res.status(400).json({ message: 'Invalid product category. Must be either "Flowers" or "Accessories".' });
    }
    
    // Create product data object
    const productData = {
        productName,
        productCategory,
        quantity,
        supplierName,
        dateReceived
    };
    
    // Only add price and lifespan for Flowers
    if (productCategory === 'Flowers') {
        productData.price = price;
        productData.lifespanInDays = lifespanInDays;
    }
    
    const newProduct = new Product(productData);
    await newProduct.save();
    res.status(201).json({ message: 'Product added successfully!', product: newProduct });
  } catch (err) {
    console.error('Error adding product:', err);
    res.status(500).json({ message: err.message || 'Failed to add product' });
  }
};

// Deduct stock after a sale
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
        res.status(200).json({ success: true, message: 'Inventory updated successfully.' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to update inventory.' });
    }
};

// Add stock to existing products
const restockProducts = async (req, res) => {
    try {
        const quantitiesToRestock = req.body;
        if (Object.keys(quantitiesToRestock).length === 0) {
            return res.status(400).json({ message: 'No restock data provided.' });
        }
        const operations = Object.entries(quantitiesToRestock).map(([productId, quantity]) => {
            const restockAmount = parseInt(quantity, 10);
            if (isNaN(restockAmount) || restockAmount <= 0) return null;
            return {
                updateOne: {
                    filter: { _id: productId },
                    update: { $inc: { quantity: restockAmount } }
                }
            };
        }).filter(Boolean);
        if (operations.length > 0) {
            const result = await Product.bulkWrite(operations);
            if (result.matchedCount !== operations.length) {
                 return res.status(404).json({ message: 'One or more products could not be found to update.' });
            }
        } else {
            return res.status(400).json({ message: 'No valid quantities to restock.' });
        }
        res.status(200).json({ success: true, message: 'Products have been restocked successfully.' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to restock products.' });
    }
};

// --- NEW FUNCTION to edit product details ---
const editProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const { productName, productCategory, price, supplierName, lifespanInDays } = req.body;
        const updatedData = { productName, productCategory, price, supplierName, lifespanInDays };

        const updatedProduct = await Product.findByIdAndUpdate(id, updatedData, {
            new: true,
            runValidators: true,
        });

        if (!updatedProduct) {
            return res.status(404).json({ message: "Product not found." });
        }

        res.status(200).json({
            success: true,
            message: "Product updated successfully!",
            product: updatedProduct,
        });
    } catch (error) {
        console.error("Error updating product:", error);
        res.status(500).json({ message: "Failed to update product details." });
    }
};

// --- Export all five functions ---
module.exports = {
  getAllProducts,
  addProduct,
  updateStock,
  restockProducts,
  editProduct,
};
