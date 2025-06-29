const mongoose = require('mongoose');

async function fixUsernames() {
  try {
    await mongoose.connect('mongodb://localhost:27017/pos_db');
    console.log('Connected to MongoDB');
    
    // Get all users
    const users = await mongoose.connection.db.collection('users').find({}).toArray();
    console.log('Current users:');
    users.forEach((user, index) => {
      console.log(`${index + 1}. ID: ${user._id}, employeeId: ${user.employeeId}, username: ${user.username}, email: ${user.email}, role: ${user.role}`);
    });
    
    // Set username equal to employeeId for all users
    const result = await mongoose.connection.db.collection('users').updateMany(
      {},
      [{ $set: { username: "$employeeId" } }]
    );
    
    console.log('\nUpdated users to set username = employeeId:', result);
    
    // Recreate the username unique index
    await mongoose.connection.db.collection('users').createIndex(
      { username: 1 }, 
      { unique: true, background: true }
    );
    console.log('Recreated username unique index');
    
    // Verify the fix
    const updatedUsers = await mongoose.connection.db.collection('users').find({}).toArray();
    console.log('\nUsers after fix:');
    updatedUsers.forEach((user, index) => {
      console.log(`${index + 1}. ID: ${user._id}, employeeId: ${user.employeeId}, username: ${user.username}, email: ${user.email}, role: ${user.role}`);
    });
    
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  } catch (error) {
    console.error('Error:', error);
    await mongoose.disconnect();
  }
}

fixUsernames();
