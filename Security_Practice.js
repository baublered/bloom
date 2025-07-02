/**
 * BloomTrack Security Practice - RS256 Demonstration
 * 
 * This file demonstrates how RS256 (RSA SHA-256) asymmetric encryption works
 * in the context of JWT tokens and secure authentication for BloomTrack POS system.
 * 
 * RS256 uses:
 * - RSA algorithm for key generation and signing
 * - SHA-256 for hashing
 * - Public/Private key pair for asymmetric encryption
 * 
 * Author: BloomTrack Development Team
 * Date: July 2, 2025
 */

const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');

console.log('='.repeat(80));
console.log('BLOOMTRACK SECURITY PRACTICE - RS256 DEMONSTRATION');
console.log('='.repeat(80));

// 1. KEY GENERATION DEMONSTRATION
console.log('\nSTEP 1: RSA KEY PAIR GENERATION');
console.log('-'.repeat(50));

// Generate RSA key pair (2048-bit for production security)
const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
  modulusLength: 2048,
  publicKeyEncoding: {
    type: 'spki',
    format: 'pem'
  },
  privateKeyEncoding: {
    type: 'pkcs8',
    format: 'pem'
  }
});

console.log('RSA Key Pair Generated Successfully!');
console.log(`Key Size: 2048 bits`);
console.log(`Private Key Length: ${privateKey.length} characters`);
console.log(`Public Key Length: ${publicKey.length} characters`);

console.log('\nPRIVATE KEY (First 100 characters):');
console.log(privateKey.substring(0, 100) + '...');

console.log('\nPUBLIC KEY (First 100 characters):');
console.log(publicKey.substring(0, 100) + '...');

// 2. JWT TOKEN CREATION WITH RS256
console.log('\nSTEP 2: JWT TOKEN CREATION WITH RS256');
console.log('-'.repeat(50));

// Sample user data for BloomTrack
const userData = {
  userId: '66422b8c9d1e2f4a5b6c7d8e',
  username: 'admin@bloomtrack.com',
  role: 'admin',
  permissions: ['read', 'write', 'delete', 'manage_users'],
  store: 'BloomTrack Main Store',
  iat: Math.floor(Date.now() / 1000), // Issued at
  exp: Math.floor(Date.now() / 1000) + (60 * 60) // Expires in 1 hour
};

console.log('User Data to be signed:');
console.log(JSON.stringify(userData, null, 2));

// Create JWT token using RS256
const token = jwt.sign(userData, privateKey, { 
  algorithm: 'RS256',
  issuer: 'BloomTrack-POS-System',
  audience: 'BloomTrack-Users'
});

console.log('\nGenerated JWT Token:');
console.log(token);

// Break down the JWT token
const tokenParts = token.split('.');
console.log('\nJWT TOKEN BREAKDOWN:');
console.log(`Header (Base64): ${tokenParts[0]}`);
console.log(`Payload (Base64): ${tokenParts[1]}`);
console.log(`Signature (Base64): ${tokenParts[2]}`);

// Decode header and payload
const decodedHeader = JSON.parse(Buffer.from(tokenParts[0], 'base64').toString());
const decodedPayload = JSON.parse(Buffer.from(tokenParts[1], 'base64').toString());

console.log('\nDECODED HEADER:');
console.log(JSON.stringify(decodedHeader, null, 2));

console.log('\nDECODED PAYLOAD:');
console.log(JSON.stringify(decodedPayload, null, 2));

// 3. TOKEN VERIFICATION DEMONSTRATION
console.log('\nSTEP 3: JWT TOKEN VERIFICATION WITH PUBLIC KEY');
console.log('-'.repeat(50));

try {
  const verified = jwt.verify(token, publicKey, { 
    algorithms: ['RS256'],
    issuer: 'BloomTrack-POS-System',
    audience: 'BloomTrack-Users'
  });
  
  console.log('TOKEN VERIFICATION SUCCESSFUL!');
  console.log('Verified User Data:');
  console.log(JSON.stringify(verified, null, 2));
} catch (error) {
  console.log('TOKEN VERIFICATION FAILED!');
  console.log('Error:', error.message);
}

// 4. SECURITY DEMONSTRATION - TAMPERING DETECTION
console.log('\nSTEP 4: SECURITY DEMONSTRATION - TAMPERING DETECTION');
console.log('-'.repeat(50));

// Attempt to tamper with the token
const tamperedToken = token.substring(0, token.length - 10) + 'tampered123';
console.log('Attempting to verify tampered token...');

try {
  jwt.verify(tamperedToken, publicKey, { algorithms: ['RS256'] });
  console.log('ERROR: This should not happen - tampered token was accepted!');
} catch (error) {
  console.log('SECURITY WORKING! Tampered token was rejected.');
  console.log('Error:', error.message);
}

// 5. DIGITAL SIGNATURE DEMONSTRATION
console.log('\nSTEP 5: DIGITAL SIGNATURE DEMONSTRATION');
console.log('-'.repeat(50));

const message = 'BloomTrack transaction: Customer John Doe purchased roses for P500.00';
console.log('Original Message:', message);

// Create digital signature
const signature = crypto.sign('sha256', Buffer.from(message), privateKey);
console.log('Digital Signature (Base64):', signature.toString('base64'));

// Verify digital signature
const isValid = crypto.verify('sha256', Buffer.from(message), publicKey, signature);
console.log('Signature Verification:', isValid ? 'VALID' : 'INVALID');

// Test with tampered message
const tamperedMessage = message + ' HACKED!';
const isValidTampered = crypto.verify('sha256', Buffer.from(tamperedMessage), publicKey, signature);
console.log('Tampered Message Verification:', isValidTampered ? 'SHOULD BE INVALID' : 'CORRECTLY INVALID');

// 6. BLOOMTRACK SECURITY IMPLEMENTATION EXAMPLE
console.log('\nSTEP 6: BLOOMTRACK SECURITY IMPLEMENTATION EXAMPLE');
console.log('-'.repeat(50));

const BloomTrackSecurity = {
  // Simulate login process
  authenticateUser: (username, password) => {
    console.log(`Authenticating user: ${username}`);
    // In real implementation, this would check against database
    if (username === 'admin@bloomtrack.com' && password === 'secure123') {
      const userPayload = {
        userId: '66422b8c9d1e2f4a5b6c7d8e',
        username: username,
        role: 'admin',
        loginTime: new Date().toISOString(),
        storeId: 'store_001'
      };
      
      const authToken = jwt.sign(userPayload, privateKey, {
        algorithm: 'RS256',
        expiresIn: '8h',
        issuer: 'BloomTrack-System'
      });
      
      console.log('Authentication successful!');
      console.log('Auth Token generated');
      return { success: true, token: authToken };
    } else {
      console.log('Authentication failed!');
      return { success: false, error: 'Invalid credentials' };
    }
  },

  // Simulate middleware for protecting routes
  verifyToken: (token) => {
    try {
      const decoded = jwt.verify(token, publicKey, {
        algorithms: ['RS256'],
        issuer: 'BloomTrack-System'
      });
      console.log(`Token valid for user: ${decoded.username}`);
      return { valid: true, user: decoded };
    } catch (error) {
      console.log(`Token validation failed: ${error.message}`);
      return { valid: false, error: error.message };
    }
  }
};

// Demonstrate BloomTrack authentication flow
console.log('\nBLOOMTRACK AUTHENTICATION FLOW SIMULATION:');
const authResult = BloomTrackSecurity.authenticateUser('admin@bloomtrack.com', 'secure123');

if (authResult.success) {
  console.log('\nSimulating protected route access...');
  const verification = BloomTrackSecurity.verifyToken(authResult.token);
  
  if (verification.valid) {
    console.log('Access granted to BloomTrack admin dashboard!');
    console.log(`Welcome back, ${verification.user.username}!`);
  }
}

console.log('\n='.repeat(80));
console.log('BLOOMTRACK RS256 SECURITY DEMONSTRATION COMPLETE!');
console.log('This demonstrates the cryptographic security behind BloomTrack\'s authentication system.');
console.log('Your flower shop data is protected with industry-standard encryption!');
console.log('='.repeat(80));

// Optional: Save keys to files for reference (commented out for security)
/*
fs.writeFileSync(path.join(__dirname, 'demo_private_key.pem'), privateKey);
fs.writeFileSync(path.join(__dirname, 'demo_public_key.pem'), publicKey);
console.log('\nDemo keys saved to files (for educational purposes only)');
*/
