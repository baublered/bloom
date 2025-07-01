const jwt = require('jsonwebtoken');

// --- Load RSA Public Key from Environment Variables ---
let publicKey = process.env.RSA_PUBLIC_KEY;

if (!publicKey) {
    console.error('Error: RSA_PUBLIC_KEY must be set in environment variables');
    process.exit(1);
}

// Clean up the key - remove extra quotes and handle escaped newlines
publicKey = publicKey.replace(/^["']|["']$/g, '').replace(/\\n/g, '\n');

console.log('Successfully loaded RSA public key from environment variables.');

// This function checks for a valid token in the request
const authenticate = (req, res, next) => {
    // --- DEBUGGING STEP 1: Log all incoming headers ---
    console.log('[DEBUG] Headers received:', req.headers);

    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Format is "Bearer TOKEN_STRING"

    // --- DEBUGGING STEP 2: Log the token we found ---
    console.log('[DEBUG] Auth Header:', authHeader);
    console.log('[DEBUG] Extracted Token:', token);

    if (token == null) {
        // If no token is provided, deny access
        return res.status(401).json({ message: 'No token provided, authorization denied.' });
    }

    // Verify the token using the public key and RS256 algorithm
    console.log('[DEBUG] Verifying token with RS256 algorithm.');
    
    jwt.verify(token, publicKey, { algorithms: ['RS256'] }, (err, decoded) => {
        if (err) {
            // --- DEBUGGING STEP 3: Log the specific verification error ---
            console.error('[DEBUG] JWT Verification Error:', err);
            // If the token is expired or invalid, deny access
            return res.status(403).json({ message: 'Token is not valid.' });
        }

        // If the token is valid, attach the user's info to the request object
        console.log('[DEBUG] Token decoded successfully:', decoded);
        req.user = decoded.user;
        next(); // Proceed to the next middleware or controller
    });
};

// This middleware checks if the authenticated user is an admin
const adminOnly = (req, res, next) => {
    // This runs *after* the authenticate middleware has successfully run
    if (req.user && req.user.role === 'admin') {
        console.log('[DEBUG] Admin role verified.');
        next(); // User is an admin, proceed
    } else {
        console.log('[DEBUG] Admin access denied. User role:', req.user?.role);
        // If the user is not an admin, deny access
        res.status(403).json({ message: 'Access denied. Admin privileges required.' });
    }
};

module.exports = {
    authenticate,
    adminOnly
};
