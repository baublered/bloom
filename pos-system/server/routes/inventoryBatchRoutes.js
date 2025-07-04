const express = require('express');
const router = express.Router();
const { 
    receiveItems, 
    getInventoryBatches,
    getActiveBatches,
    getExpiringBatches 
} = require('../controllers/inventoryBatchController');
const { authenticate, adminOnly } = require('../middleware/authMiddleware');

// @route   POST /api/inventory/receive
// @desc    Receive items and create inventory batches
// @access  Private/Admin
router.post('/receive', authenticate, adminOnly, receiveItems);

// @route   GET /api/inventory/batches/product/:productId
// @desc    Get active batches for a specific product
// @access  Private/Admin
router.get('/batches/product/:productId', authenticate, adminOnly, getActiveBatches);

// @route   GET /api/inventory/batches/expiring
// @desc    Get all expiring batches
// @access  Private/Admin
router.get('/batches/expiring', authenticate, adminOnly, getExpiringBatches);

// @route   GET /api/inventory/batches
// @desc    Get all inventory batches
// @access  Private/Admin
router.get('/batches', authenticate, adminOnly, getInventoryBatches);

module.exports = router;
