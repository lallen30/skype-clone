import jwt from 'jsonwebtoken';
export const authMiddleware = (req, res, next) => {
    // Get token from header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
            success: false,
            message: 'Authorization denied. No token provided.'
        });
    }
    // Extract token
    const token = authHeader.split(' ')[1];
    try {
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default_jwt_secret');
        // Add user ID to request object
        req.userId = decoded.userId;
        next();
    }
    catch (error) {
        res.status(401).json({
            success: false,
            message: 'Token is not valid'
        });
    }
};
//# sourceMappingURL=auth.middleware.js.map