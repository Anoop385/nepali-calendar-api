const rateLimit = require('express-rate-limit');

/**
 * General API rate limiter
 * Limits: 100 requests per 15 minutes per IP
 */
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: {
        success: false,
        error: {
            message: 'Too many requests from this IP, please try again after 15 minutes',
            statusCode: 429
        }
    },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    handler: (req, res) => {
        res.status(429).json({
            success: false,
            error: {
                message: 'Too many requests from this IP, please try again after 15 minutes',
                statusCode: 429,
                retryAfter: req.rateLimit.resetTime
            }
        });
    }
});

/**
 * Strict rate limiter for conversion endpoints
 * Limits: 30 requests per minute per IP
 */
const strictLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 30, // Limit each IP to 30 requests per minute
    message: {
        success: false,
        error: {
            message: 'Too many conversion requests, please slow down',
            statusCode: 429
        }
    },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: false,
    handler: (req, res) => {
        res.status(429).json({
            success: false,
            error: {
                message: 'Too many conversion requests, please slow down',
                statusCode: 429,
                retryAfter: req.rateLimit.resetTime
            }
        });
    }
});

module.exports = {
    apiLimiter,
    strictLimiter
};
