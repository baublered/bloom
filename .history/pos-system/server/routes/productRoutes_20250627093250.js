const express = require('express');
const router = express.Router();
// --- FIX: Import the new 'restockProducts' function ---
const { 
    getAllProducts, 
    addProduct, 
    updateStock, 
    restockProducts,
    editProduct
} = require('../controllers/productController');

// GET /api/products - Fetches all products
router.get('/', getAllProducts);

// POST /api/products/add - Adds a new product
router.post('/add', addProduct);

// POST /api/products/update-stock - Deducts stock after a sale
router.post('/update-stock', updateStock);

// POST /api/products/restock
router.post('/restock', restockProducts);

// POST /api/products/edit
router.put('/edit/:id', editProduct);

module.exports = router;
