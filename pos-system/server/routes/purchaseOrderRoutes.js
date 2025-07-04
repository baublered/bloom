const express = require('express');
const router = express.Router();
const { 
    createPurchaseOrder, 
    getPurchaseOrders, 
    getPurchaseOrder,
    updatePurchaseOrderStatus,
    receivePurchaseOrder,
    generatePurchaseOrderPDF
} = require('../controllers/purchaseOrderController');
const { authenticate, adminOnly } = require('../middleware/authMiddleware');

// @route   POST /api/purchase-orders
// @desc    Create a new purchase order
// @access  Private/Admin
router.post('/', authenticate, adminOnly, createPurchaseOrder);

// @route   GET /api/purchase-orders
// @desc    Get all purchase orders
// @access  Private/Admin
router.get('/', authenticate, adminOnly, getPurchaseOrders);

// @route   GET /api/purchase-orders/:id/pdf
// @desc    Generate PDF for purchase order
// @access  Private/Admin
router.get('/:id/pdf', authenticate, adminOnly, generatePurchaseOrderPDF);

// @route   GET /api/purchase-orders/:id
// @desc    Get purchase order by ID
// @access  Private/Admin
router.get('/:id', authenticate, adminOnly, getPurchaseOrder);

// @route   PUT /api/purchase-orders/:id/status
// @desc    Update purchase order status
// @access  Private/Admin
router.put('/:id/status', authenticate, adminOnly, updatePurchaseOrderStatus);

// @route   POST /api/purchase-orders/:id/receive
// @desc    Receive a purchase order and update inventory
// @access  Private/Admin
router.post('/:id/receive', authenticate, adminOnly, receivePurchaseOrder);

module.exports = router;
