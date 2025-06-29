const express = require('express');
const router = express.Router();
const { 
    getAllProducts, 
    addProduct, 
    updateStock,
    restockProducts,
    editProduct // Import the new function
} = require('../controllers/productController');

// GET /api/products
router.get('/', getAllProducts);

// POST /api/products/add
router.post('/add', addProduct);

// POST /api/products/update-stock (for sales)
router.post('/update-stock', updateStock);

// POST /api/products/restock
router.post('/restock', restockProducts);

// --- THIS IS THE MISSING ROUTE ---
// PUT /api/products/:id
router.put('/:id', editProduct);

module.exports = router;
