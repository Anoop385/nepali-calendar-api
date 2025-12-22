/**
 * Centralized error handling middleware
 */
class AppError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = true;
        Error.captureStackTrace(this, this.constructor);
    }
}

const errorHandler = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.message = err.message || 'Internal Server Error';

    // Send error response
    res.status(err.statusCode).json({
        success: false,
        error: {
            message: err.message,
            statusCode: err.statusCode,
            ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
        }
    });
};

// 404 handler
const notFoundHandler = (req, res, next) => {
    const error = new AppError(`Route ${req.originalUrl} not found`, 404);
    next(error);
};

module.exports = { errorHandler, notFoundHandler, AppError };
