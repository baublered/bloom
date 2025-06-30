const mongoose = require('mongoose');
const Event = require('./models/Event');
const Product = require('./models/Product');

async function checkEventsAndInventory() {
  try {
    await mongoose.connect('mongodb://localhost:27017/pos_db');
    console.log('Connected to MongoDB');
    
    // Get recent events
    const events = await Event.find({}).sort({eventDate: -1}).limit(5);
    console.log('\n=== RECENT EVENTS ===');
    events.forEach(e => {
      console.log(`- ${e.customerName} (${e.eventType}) - Status: ${e.status} - Products: ${e.products.length} - Total: ₱${e.totalAmount} - Paid: ₱${e.totalPaid}`);
    });
    
    // Check a few products for inventory
    const products = await Product.find({}).limit(5);
    console.log('\n=== SAMPLE INVENTORY ===');
    products.forEach(p => {
      console.log(`- ${p.productName}: ${p.quantity} units`);
    });
    
    // Find a pending event with products for testing
    const pendingEvent = await Event.findOne({ status: 'Pending', 'products.0': { $exists: true } });
    if (pendingEvent) {
      console.log('\n=== PENDING EVENT WITH PRODUCTS ===');
      console.log(`Event: ${pendingEvent.customerName} - ${pendingEvent.eventType}`);
      console.log(`Status: ${pendingEvent.status}`);
      console.log(`Total Amount: ₱${pendingEvent.totalAmount}`);
      console.log(`Total Paid: ₱${pendingEvent.totalPaid}`);
      console.log(`Remaining Balance: ₱${pendingEvent.remainingBalance}`);
      console.log('Products:');
      pendingEvent.products.forEach(product => {
        console.log(`  - ${product.productName}: ${product.quantity} units @ ₱${product.price}`);
      });
      
      // Check current inventory for these products
      console.log('\nCurrent inventory for these products:');
      for (const product of pendingEvent.products) {
        const inventoryItem = await Product.findById(product.productId);
        if (inventoryItem) {
          console.log(`  - ${inventoryItem.productName}: ${inventoryItem.quantity} units in stock`);
        }
      }
    } else {
      console.log('\n=== NO PENDING EVENTS WITH PRODUCTS FOUND ===');
    }
    
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
    
  } catch (error) {
    console.error('Error:', error);
    await mongoose.disconnect();
  }
}

checkEventsAndInventory();
