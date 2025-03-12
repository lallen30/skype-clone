import jwt from 'jsonwebtoken';
export const socketAuthMiddleware = (socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
        return next(new Error('Authentication error: Token not provided'));
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default_jwt_secret');
        // Attach user data to socket for later use
        socket.data.userId = decoded.userId;
        next();
    }
    catch (error) {
        next(new Error('Authentication error: Invalid token'));
    }
};
//# sourceMappingURL=socket.middleware.js.map