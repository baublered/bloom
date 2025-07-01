const crypto = require('crypto');
const fs = require('fs');

console.log('Generating new RSA key pair...');

// Generate new RSA key pair
const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
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

console.log('Keys generated successfully!');

// Format keys for environment variables (escape newlines)
const formattedPrivateKey = privateKey.replace(/\n/g, '\\n');
const formattedPublicKey = publicKey.replace(/\n/g, '\\n');

// Read current .env file
const envPath = '.env';
let envContent = fs.readFileSync(envPath, 'utf8');

// Replace the RSA keys in the .env file
envContent = envContent.replace(
    /RSA_PRIVATE_KEY="[^"]*"/,
    `RSA_PRIVATE_KEY="${formattedPrivateKey}"`
);

envContent = envContent.replace(
    /RSA_PUBLIC_KEY="[^"]*"/,
    `RSA_PUBLIC_KEY="${formattedPublicKey}"`
);

// Write back to .env file
fs.writeFileSync(envPath, envContent);

console.log('✅ Updated .env file with new RSA keys');
console.log('🔄 Please restart your server now');
