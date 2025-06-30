const mongoose = require('mongoose');
const Event = require('./models/Event');
const Product = require('./models/Product');

async function createTestEvent() {
  try {
    await mongoose.connect('mongodb://localhost:27017/pos_db');
    console.log('Connected to MongoDB');
    
    // Find a product that exists
    const product = await Product.findOne({ quantity: { $gt: 0 } });
    if (!product) {
      console.log('No products with stock found');
      await mongoose.disconnect();
      return;
    }
    
    console.log(`Using product: ${product.productName} (ID: ${product._id}) - Current stock: ${product.quantity}`);
    
    // Create a test event
    const testEvent = new Event({
      customerName: 'Test Customer',
      address: '123 Test St',
      phone: '09123456789',
      eventType: 'Wedding',
      eventDate: new Date('2025-07-01'),
      products: [{
        productId: product._id,
        productName: product.productName,
        quantity: 2,
        price: product.price
      }],
      paymentHistory: [{
        amountPaid: 50, // Partial payment (less than total)
        paymentMethod: 'CASH',
        isDownpayment: true
      }]
    });
    
    await testEvent.save();
    
    console.log('\n=== TEST EVENT CREATED ===');
    console.log(`Event ID: ${testEvent._id}`);
    console.log(`Customer: ${testEvent.customerName}`);
    console.log(`Status: ${testEvent.status}`);
    console.log(`Total Amount: ₱${testEvent.totalAmount}`);
    console.log(`Total Paid: ₱${testEvent.totalPaid}`);
    console.log(`Remaining Balance: ₱${testEvent.remainingBalance}`);
    console.log('Products:');
    testEvent.products.forEach(p => {
      console.log(`  - ${p.productName}: ${p.quantity} units @ ₱${p.price}`);
    });
    
    await mongoose.disconnect();
    console.log('\nTest event created successfully! You can now test payment completion.');
    
  } catch (error) {
    console.error('Error:', error);
    await mongoose.disconnect();
  }
}

createTestEvent();
