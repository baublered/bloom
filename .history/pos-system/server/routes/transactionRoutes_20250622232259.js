const express = require('express');
const router = express.Router();
const { 
    createTransaction, 
    getAllTransactions 
} = require('../controllers/transactionController');

// Endpoint to create a new transaction record
// POST /api/transactions/create
router.post('/create', createTransaction);

// Endpoint to get all transaction history
// GET /api/transactions
router.get('/', getAllTransactions);

module.exports = router;
