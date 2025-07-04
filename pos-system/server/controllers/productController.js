const Product = require('../models/Product');
const InventoryBatch = require('../models/InventoryBatch.js');
const mongoose = require('mongoose');

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
    const { productName, productCategory, price, quantity, supplierName, dateReceived, lifespanInDays, minimumThreshold, bouquetPackage } = req.body;
    
    // Basic required fields validation
    if (!productName || !productCategory || !supplierName || lifespanInDays === undefined || minimumThreshold === undefined) {
        return res.status(400).json({ message: 'Please fill out all required fields: product name, category, supplier name, lifespan, and minimum threshold.' });
    }
    
    // Trim and normalize the product name
    const normalizedProductName = productName.trim();
    
    if (!normalizedProductName) {
        return res.status(400).json({ message: 'Product name cannot be empty.' });
    }
    
    // Check for duplicate product names (case-insensitive)
    const existingProduct = await Product.findOne({ 
        productName: { $regex: new RegExp(`^${normalizedProductName}$`, 'i') }
    });
    
    if (existingProduct) {
        return res.status(400).json({ 
            message: `A product with the name "${normalizedProductName}" already exists. Please use a different name.` 
        });
    }
    
    // Category-specific validation
    if (productCategory === 'Flowers' || productCategory === 'Bouquet') {
        if (price === undefined || lifespanInDays === undefined) {
            return res.status(400).json({ message: 'Price and lifespan are required for flower and bouquet products.' });
        }
    } else if (productCategory !== 'Accessories') {
        return res.status(400).json({ message: 'Invalid product category. Must be either "Flowers", "Bouquet", or "Accessories".' });
    }
    
    // Create product data object
    const productData = {
        productName: normalizedProductName,
        productCategory,
        quantity: quantity || 0,
        supplierName: supplierName.trim(),
        dateReceived: dateReceived || new Date(),
        minimumThreshold
    };
    
    // Only add price and lifespan for Flowers and Bouquets
    if (productCategory === 'Flowers' || productCategory === 'Bouquet') {
        productData.price = price;
        productData.lifespanInDays = lifespanInDays;
    }
    
    // Add bouquet package information if provided
    if (bouquetPackage) {
        productData.bouquetPackage = bouquetPackage;
    }
    
    console.log('Creating product with data:', productData);
    
    const newProduct = new Product(productData);
    await newProduct.save();
    
    console.log('Product created successfully:', newProduct._id);
    
    res.status(201).json({ message: 'Product added successfully!', product: newProduct });
  } catch (err) {
    console.error('Error adding product:', err);
    
    // Handle MongoDB duplicate key errors
    if (err.code === 11000) {
        const duplicateField = err.keyPattern ? Object.keys(err.keyPattern)[0] : 'field';
        return res.status(400).json({ 
            message: `A product with this ${duplicateField} already exists. Please use a different value.` 
        });
    }
    
    // Handle validation errors
    if (err.name === 'ValidationError') {
        const validationErrors = Object.values(err.errors).map(e => e.message);
        return res.status(400).json({ 
            message: 'Validation failed: ' + validationErrors.join(', ') 
        });
    }
    
    res.status(500).json({ message: err.message || 'Failed to add product' });
  }
};

// Deduct stock after a sale using FIFO batch system
const updateStock = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    
    try {
        const { cart } = req.body;
        if (!cart || !Array.isArray(cart)) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({ message: 'Invalid cart data provided.' });
        }

        for (const item of cart) {
            const { productId, quantity } = item;
            let remainingToDeduct = quantity;

            // Get all available batches for this product, sorted by expiry date (FIFO)
            const batches = await InventoryBatch.find({
                product: productId,
                remainingQuantity: { $gt: 0 }
            }).sort({ expiryDate: 1, dateReceived: 1 }).session(session);

            if (batches.length === 0) {
                await session.abortTransaction();
                session.endSession();
                return res.status(400).json({ 
                    message: `No inventory batches available for product ${productId}` 
                });
            }

            // Check if we have enough total stock
            const totalAvailable = batches.reduce((sum, batch) => sum + batch.remainingQuantity, 0);
            if (totalAvailable < remainingToDeduct) {
                await session.abortTransaction();
                session.endSession();
                return res.status(400).json({ 
                    message: `Insufficient stock for product ${productId}. Available: ${totalAvailable}, Requested: ${remainingToDeduct}` 
                });
            }

            // Deduct from batches using FIFO
            for (const batch of batches) {
                if (remainingToDeduct <= 0) break;

                const deductFromThisBatch = Math.min(remainingToDeduct, batch.remainingQuantity);
                
                batch.quantitySold += deductFromThisBatch;
                batch.remainingQuantity -= deductFromThisBatch;
                await batch.save({ session });

                remainingToDeduct -= deductFromThisBatch;
            }

            // Update the main product quantity
            const product = await Product.findById(productId).session(session);
            if (!product) {
                await session.abortTransaction();
                session.endSession();
                return res.status(404).json({ message: `Product ${productId} not found` });
            }

            product.quantity -= quantity;
            await product.save({ session });
        }

        await session.commitTransaction();
        session.endSession();
        res.status(200).json({ success: true, message: 'Inventory updated successfully using FIFO batch system.' });
        
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        console.error('Error updating stock:', error);
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
