export const errorHandler = (err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({
        success: false,
        error: {
            message: err.message || 'Server Error',
            stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
        }
    });
};
//# sourceMappingURL=error.middleware.js.map