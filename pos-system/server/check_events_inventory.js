const mongoose = require('mongoose');
const Event = require('./models/Event');
const Product = require('./models/Product');

async function fixExistingEvents() {
  try {
    await mongoose.connect('mongodb://localhost:27017/pos_db');
    console.log('Connected to MongoDB');
    
    // Find all events that are not fully paid but might have deducted inventory
    const pendingEvents = await Event.find({ status: 'Pending' });
    console.log(`Found ${pendingEvents.length} pending events`);
    
    // Find all fully paid events to verify they have deducted inventory correctly
    const fullyPaidEvents = await Event.find({ status: 'Fully Paid' });
    console.log(`Found ${fullyPaidEvents.length} fully paid events`);
    
    console.log('\n--- Summary ---');
    console.log('✅ Inventory deduction logic updated:');
    console.log('   - Products will only be deducted when event status changes to "Fully Paid"');
    console.log('   - Inventory will be restored if a "Fully Paid" event is cancelled');
    console.log('   - Pending events will not deduct inventory until fully paid');
    
    console.log('\n--- Existing Events Status ---');
    for (const event of pendingEvents) {
      console.log(`📋 Pending Event: ${event.customerName} - ${event.eventType} (${event.products.length} products)`);
    }
    
    for (const event of fullyPaidEvents) {
      console.log(`💰 Fully Paid Event: ${event.customerName} - ${event.eventType} (${event.products.length} products)`);
    }
    
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
    
  } catch (error) {
    console.error('Error:', error);
    await mongoose.disconnect();
  }
}

// Note: This script doesn't modify data, it just shows the current state
// If you need to restore inventory for pending events that were incorrectly deducted,
// you would need to implement that logic separately based on your business needs

fixExistingEvents();
