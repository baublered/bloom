const express = require('express');
const router = express.Router();
const { getAllProducts, addProduct, updateStock } = require('../controllers/productController');

// GET /api/products
router.get('/', getAllProducts);

// POST /api/products/add
router.post('/add', addProduct);

// --- NEW ROUTE FOR UPDATING STOCK ---
// POST /api/products/update-stock
router.post('/update-stock', updateStock);

module.exports = router;
