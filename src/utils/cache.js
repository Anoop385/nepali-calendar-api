const NodeCache = require('node-cache');

// Initialize cache with TTL from environment or default to 1 hour
const cacheTTL = parseInt(process.env.CACHE_TTL) || 3600;

const cache = new NodeCache({
    stdTTL: cacheTTL,
    checkperiod: cacheTTL * 0.2,
    useClones: false
});

/**
 * Generate cache key from request parameters
 */
const generateCacheKey = (prefix, params) => {
    return `${prefix}:${JSON.stringify(params)}`;
};

/**
 * Cache middleware wrapper
 */
const cacheMiddleware = (duration = cacheTTL) => {
    return (req, res, next) => {
        if (req.method !== 'GET') {
            return next();
        }

        const key = generateCacheKey(req.path, req.query);
        const cachedResponse = cache.get(key);

        if (cachedResponse) {
            // Add cache hit header
            res.set('X-Cache', 'HIT');
            return res.json(cachedResponse);
        }

        // Store original json method
        const originalJson = res.json.bind(res);

        // Override json method to cache response
        res.json = (body) => {
            // Calculate TTL if duration is a function, otherwise use value
            const ttl = typeof duration === 'function' ? duration() : duration;
            cache.set(key, body, ttl);
            res.set('X-Cache', 'MISS');
            return originalJson(body);
        };

        next();
    };
};

/**
 * Get cache statistics
 */
const getCacheStats = () => {
    return cache.getStats();
};

/**
 * Clear all cache
 */
const clearCache = () => {
    cache.flushAll();
};

module.exports = {
    cache,
    cacheMiddleware,
    generateCacheKey,
    getCacheStats,
    clearCache
};
