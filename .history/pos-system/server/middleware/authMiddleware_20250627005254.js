[const jwt = require('jsonwebtoken');

// This function checks for a valid token in the request
const authenticate = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    // The token is expected in the format "Bearer TOKEN_STRING"
    const token = authHeader && authHeader.split(' ')[1];

    if (token == null) {
        // If no token is provided, deny access
        return res.status(401).json({ message: 'No token provided, authorization denied.' });
    }

    // Verify the token using the secret key from your .env file
    jwt.verify(token, process.env.JWT_SECRET || 'your_default_secret_key', (err, decoded) => {
        if (err) {
            // If the token is expired or invalid, deny access
            return res.status(403).json({ message: 'Token is not valid.' });
        }
        // If the token is valid, attach the user's info to the request object
        req.user = decoded.user;
        next(); // Proceed to the next middleware or controller
    });
};

// This middleware checks if the authenticated user is an admin
const adminOnly = (req, res, next) => {
    // This runs *after* the authenticate middleware has successfully run
    if (req.user && req.user.role === 'admin') {
        next(); // User is an admin, proceed
    } else {
        // If the user is not an admin, deny access
        res.status(403).json({ message: 'Access denied. Admin privileges required.' });
    }
};

module.exports = {
    authenticate,
    adminOnly
};
]