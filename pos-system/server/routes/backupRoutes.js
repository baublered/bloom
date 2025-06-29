const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const Transaction = require('../models/Transaction');
const Event = require('../models/Event');
const User = require('../models/User');

// Get all data for backup
router.get('/export', async (req, res) => {
  try {
    console.log('Starting backup export...');
    
    const [products, transactions, events, users] = await Promise.all([
      Product.find({}).lean(),
      Transaction.find({}).lean(),
      Event.find({}).lean(),
      User.find({}).select('-password').lean() // Exclude passwords for security
    ]);

    const backupData = {
      timestamp: new Date().toISOString(),
      version: '1.0',
      system: 'BloomTrack POS',
      data: {
        products,
        transactions,
        events,
        users
      },
      counts: {
        products: products.length,
        transactions: transactions.length,
        events: events.length,
        users: users.length
      }
    };

    console.log('Backup export completed:', backupData.counts);

    res.json({
      success: true,
      backup: backupData
    });
  } catch (error) {
    console.error('Backup export error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create backup',
      error: error.message
    });
  }
});

module.exports = router;
