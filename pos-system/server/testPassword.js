const bcrypt = require('bcryptjs');

async function testPassword() {
    const password = 'admin123';
    
    // Generate a new hash
    const newHash = await bcrypt.hash(password, 10);
    console.log('New hash for "admin123":', newHash);
    
    // Test the hash
    const isMatch = await bcrypt.compare(password, newHash);
    console.log('Hash verification test:', isMatch);
    
    // Test the current hash you have in MongoDB
    const currentHash = '$2a$10$CwTycUXWue0Thq9StjUM0uJ8vLGPjsxqtjKzP8rjuLQJq0XvP5HGO';
    const currentMatch = await bcrypt.compare(password, currentHash);
    console.log('Current hash matches "admin123":', currentMatch);
    
    // Test different common passwords
    console.log('\nTesting other passwords with current hash:');
    const testPasswords = ['admin', 'password', '123456', 'secret'];
    
    for (const testPass of testPasswords) {
        const match = await bcrypt.compare(testPass, currentHash);
        console.log(`"${testPass}" matches current hash:`, match);
    }
}

testPassword().catch(console.error);
