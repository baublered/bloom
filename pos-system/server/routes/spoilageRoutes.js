const express = require('express');
const router = express.Router();
const { 
    processSpoilage,
    getSpoilageReport
} = require('../controllers/spoilageController');

// Endpoint to run the spoilage check and process expired items
// This could be triggered by a button in the admin's maintenance page
// POST /api/spoilage/process
router.post('/process', processSpoilage);

// Endpoint to get the list of all spoiled products for the report
// GET /api/spoilage
router.get('/', getSpoilageReport);

module.exports = router;
