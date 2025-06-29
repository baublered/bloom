const mongoose = require('mongoose');

async function cleanupUsername() {
  try {
    await mongoose.connect('mongodb://localhost:27017/pos_db');
    console.log('Connected to MongoDB');
    
    // Remove username field from all users
    const result = await mongoose.connection.db.collection('users').updateMany(
      {},
      { $unset: { username: 1 } }
    );
    
    console.log('Updated users to remove username field:', result);
    
    // Verify the cleanup
    const users = await mongoose.connection.db.collection('users').find({}).toArray();
    console.log('\nUsers after cleanup:');
    users.forEach((user, index) => {
      console.log(`${index + 1}. ID: ${user._id}, employeeId: ${user.employeeId}, email: ${user.email}, role: ${user.role}, username: ${user.username || 'REMOVED'}`);
    });
    
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  } catch (error) {
    console.error('Error:', error);
    await mongoose.disconnect();
  }
}

cleanupUsername();
