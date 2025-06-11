const express = require('express');
const DiscountCode = require('../models/discountCode');
const router = express.Router();

// Endpoint to validate the discount code
router.get('/validate', async (req, res) => {
  const { code } = req.query;

  if (!code) {
    return res.status(400).json({ valid: false, discountAmount: 0, error: 'No discount code provided' });
  }

  try {
    // Check if the discount code exists in the database
    const discount = await DiscountCode.findOne({ code });

    console.log('Found Discount:', discount);  // Log the discount object

    if (!discount) {
      return res.json({ valid: false, discountAmount: 0, error: 'Discount code not found' });
    }

    // Log the expiration date and current date for debugging
   const currentDate = new Date();
    console.log('Current Date:', currentDate);
    console.log('Expiration Date:', discount.expiration_date);

    if (discount.expiration_date < currentDate) {
    console.log('Code expired');
    return res.json({ valid: false, discountAmount: 0, error: 'Discount code expired' });
    }

    // Check if the discount code has already been used (if necessary)
    if (discount.usage_count >= 1) {  // Example: allow a single use
      return res.json({ valid: false, discountAmount: 0, error: 'Discount code already used' });
    }

    // Return the discount amount if everything is valid
    res.json({ valid: true, discountAmount: discount.discount_amount });

  } catch (error) {
    console.error('Error validating discount code:', error);
    res.status(500).json({ valid: false, discountAmount: 0, error: 'Internal server error' });
  }
});


module.exports = router;
