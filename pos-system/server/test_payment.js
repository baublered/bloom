const mongoose = require('mongoose');
const Event = require('./models/Event');
const Product = require('./models/Product');

async function testPaymentAndInventory() {
  try {
    await mongoose.connect('mongodb://localhost:27017/pos_db');
    console.log('Connected to MongoDB');
    
    // Find the test event we just created
    const pendingEvent = await Event.findOne({ 
      customerName: 'Test Customer',
      status: 'Pending', 
      'products.0': { $exists: true },
      remainingBalance: { $gt: 0 }
    });
    
    if (!pendingEvent) {
      console.log('No suitable pending event found. Looking for any pending events...');
      const allPending = await Event.find({ status: 'Pending' });
      console.log('All pending events:');
      allPending.forEach(e => {
        console.log(`- ${e.customerName}: Products: ${e.products.length}, Balance: ₱${e.remainingBalance}, Total: ₱${e.totalAmount}`);
      });
      await mongoose.disconnect();
      return;
    }
    
    console.log('\n=== BEFORE PAYMENT ===');
    console.log(`Event: ${pendingEvent.customerName} - ${pendingEvent.eventType}`);
    console.log(`Status: ${pendingEvent.status}`);
    console.log(`Remaining Balance: ₱${pendingEvent.remainingBalance}`);
    
    // Check current inventory
    for (const product of pendingEvent.products) {
      const inventoryItem = await Product.findById(product.productId);
      if (inventoryItem) {
        console.log(`Inventory BEFORE: ${inventoryItem.productName} = ${inventoryItem.quantity} units`);
      }
    }
    
    // Simulate completing the payment by calling the updateEvent logic
    console.log('\n=== SIMULATING FINAL PAYMENT ===');
    
    // Store the previous status
    const previousStatus = pendingEvent.status;
    
    // Add the final payment to complete the event
    pendingEvent.paymentHistory.push({
      amountPaid: pendingEvent.remainingBalance,
      paymentMethod: 'CASH',
      isDownpayment: false
    });
    
    // Save the event (this will trigger the pre-save hook to recalculate status)
    const updatedEvent = await pendingEvent.save();
    
    console.log(`Status changed from "${previousStatus}" to "${updatedEvent.status}"`);
    console.log(`Total Paid: ₱${updatedEvent.totalPaid}`);
    console.log(`Remaining Balance: ₱${updatedEvent.remainingBalance}`);
    
    // Check if inventory was deducted (our new logic)
    if (previousStatus === 'Pending' && updatedEvent.status === 'Fully Paid' && updatedEvent.products.length > 0) {
      console.log('\n=== DEDUCTING INVENTORY ===');
      console.log('Products to deduct:');
      updatedEvent.products.forEach(p => {
        console.log(`  - Product ID: ${p.productId}, Name: ${p.productName}, Quantity: ${p.quantity}`);
      });
      
      // Check if products exist before deduction
      for (const product of updatedEvent.products) {
        const inventoryItem = await Product.findById(product.productId);
        if (inventoryItem) {
          console.log(`  Found in inventory: ${inventoryItem.productName} - Current stock: ${inventoryItem.quantity}`);
        } else {
          console.log(`  ❌ Product not found in inventory: ${product.productId}`);
        }
      }
      
      const operations = updatedEvent.products.map(item => ({
        updateOne: {
          filter: { _id: item.productId, quantity: { $gte: item.quantity } },
          update: { $inc: { quantity: -item.quantity } }
        }
      }));
      
      console.log('Bulk operations:', JSON.stringify(operations, null, 2));
      
      const bulkResult = await Product.bulkWrite(operations);
      console.log('Inventory deduction result:', bulkResult);
    }
    
    // Check inventory after
    console.log('\n=== AFTER PAYMENT ===');
    for (const product of updatedEvent.products) {
      const inventoryItem = await Product.findById(product.productId);
      if (inventoryItem) {
        console.log(`Inventory AFTER: ${inventoryItem.productName} = ${inventoryItem.quantity} units`);
      }
    }
    
    await mongoose.disconnect();
    console.log('\nTest completed!');
    
  } catch (error) {
    console.error('Error:', error);
    await mongoose.disconnect();
  }
}

testPaymentAndInventory();
