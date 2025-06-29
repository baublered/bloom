const express = require('express');
const router = express.Router();
// --- FIX: Import the new 'restockProducts' function ---
const { 
    getAllProducts, 
    addProduct, 
    updateStock, 
    restockProducts,
    editProduct,
    editProduct
} = require('../controllers/productController');

// GET /api/products - Fetches all products
router.get('/', getAllProducts);

// POST /api/products/add - Adds a new product
router.post('/add', addProduct);

// POST /api/products/update-stock - Deducts stock after a sale
router.post('/update-stock', updateStock);

// --- THIS IS THE MISSING ROUTE ---
// This defines the endpoint your Restock page needs to call.
// POST /api/products/restock
router.post('/restock', restockProducts);

module.exports = router;
