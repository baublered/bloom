const jwt = require('jsonwebtoken');

// This function acts as a gatekeeper for your protected routes
const authenticate = (req, res, next) => {
    // Get the token from the request header
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Format is "Bearer TOKEN"

    if (token == null) {
        // If there's no token, the user is unauthorized
        return res.status(401).json({ message: 'No token provided, authorization denied.' });
    }

    // Verify the token
    jwt.verify(token, process.env.JWT_SECRET || 'your_default_secret_key', (err, decoded) => {
        if (err) {
            // If the token is invalid or expired
            return res.status(403).json({ message: 'Token is not valid.' });
        }

        // If the token is valid, add the decoded user payload to the request object
        req.user = decoded.user;
        next(); // Proceed to the next function (e.g., the getMe controller)
    });
};

// This is an extra middleware for routes that only admins should access
const adminOnly = (req, res, next) => {
    // This runs *after* the authenticate middleware
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ message: 'Access denied. Admin role required.' });
    }
};


module.exports = {
    authenticate,
    adminOnly
};
