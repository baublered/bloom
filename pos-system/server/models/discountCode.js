const mongoose = require('mongoose');

const discountCodeSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  discount_amount: { type: Number, required: true },
  expiration_date: { type: Date, required: true },
  usage_count: { type: Number, default: 0 }
});

const DiscountCode = mongoose.model('DiscountCode', discountCodeSchema, 'discount_codes');

module.exports = DiscountCode;
