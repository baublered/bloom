const express = require('express');
const router = express.Router();
// Make sure you are importing the controller correctly
const { getAllProducts, addProduct, updateStock } = require('../controllers/productController');

// GET /api/products - Fetches all products
router.get('/', getAllProducts);

// POST /api/products/add - Adds a new product
router.post('/add', addProduct);

// --- NEW ROUTE FOR UPDATING STOCK ---
// This endpoint will be called after a successful payment.
// POST /api/products/update-stock
router.post('/update-stock', updateStock);

module.exports = router;
