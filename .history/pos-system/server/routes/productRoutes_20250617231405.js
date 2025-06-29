const express = require('express');
const router = express.Router();
const { getAllProducts, addProduct } = require('../controllers/productController');

// GET /api/products - Fetches all products
router.get('/', getAllProducts);

// POST /api/products/add - Adds a new product
router.post('/add', addProduct);

module.exports = router;
