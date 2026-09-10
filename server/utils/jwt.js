const jwt = require('jsonwebtoken');

const generateToken = (user) => {
    return jwt.sign(
        {
            id: user._id,
            email: user.email,
            name: user.name,
            role: user.role
        },
        process.env.JWT_KEY || 'supersecretkeyforplacementcellcrmmis',
        {
            expiresIn: '7d'
        }
    );
};

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    // Format can be "Bearer <token>" or just "<token>" or in query parameter
    let token = authHeader && (authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : authHeader);

    if (!token && req.query.token) {
        token = req.query.token;
    }

    if (!token) {
        return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_KEY || 'supersecretkeyforplacementcellcrmmis');
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(403).json({ message: 'Invalid or expired token.' });
    }
};

const requireRole = (allowedRoles) => {
    return (req, res, next) => {
        if (!req.user || !allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ message: 'Access forbidden: Insufficient permissions.' });
        }
        next();
    };
};

module.exports = {
    generateToken,
    authenticateToken,
    requireRole
};
