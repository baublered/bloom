const mongoose = require('mongoose');

async function fixUserRegistration() {
  try {
    await mongoose.connect('mongodb://localhost:27017/pos_db');
    console.log('Connected to MongoDB');
    
    // 1. First, set username = employeeId for existing users (before creating index)
    const result = await mongoose.connection.db.collection('users').updateMany(
      {},
      [{ $set: { username: "$employeeId" } }] // Copy employeeId to username
    );
    console.log('Updated existing users to set username = employeeId:', result);
    
    // 2. Now restore the username index (it was needed for login!)
    await mongoose.connection.db.collection('users').createIndex(
      { username: 1 }, 
      { unique: true, background: true }
    );
    console.log('Recreated username unique index');
    
    // 3. Verify the fix
    const users = await mongoose.connection.db.collection('users').find({}).toArray();
    console.log('\nUsers after fix:');
    users.forEach((user, index) => {
      console.log(`${index + 1}. ID: ${user._id}, employeeId: ${user.employeeId}, username: ${user.username}, email: ${user.email}, role: ${user.role}`);
    });
    
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  } catch (error) {
    console.error('Error:', error);
    await mongoose.disconnect();
  }
}

fixUserRegistration();
