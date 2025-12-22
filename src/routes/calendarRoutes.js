const express = require('express');
const router = express.Router();
const { convertADtoBS, getBSMonthCalendar, convertBStoAD } = require('../utils/dateConverter');
const { cacheMiddleware } = require('../utils/cache');
const { AppError } = require('../middleware/errorHandler');
const { strictLimiter } = require('../middleware/rateLimiter');

// Async handler wrapper to catch errors
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

// Apply caching to all GET routes
// Helper to calculate seconds until next midnight
// Helper to get current Nepal time
const getNepalTime = () => {
    return new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Kathmandu" }));
};

// Helper to calculate seconds until next midnight (Nepal Time)
const getSecondsUntilMidnight = () => {
    const now = getNepalTime();
    const midnight = new Date(now);
    midnight.setHours(24, 0, 0, 0);
    return Math.floor((midnight - now) / 1000);
};

// GET /api/today - Get today's date in both AD and BS
router.get('/today', cacheMiddleware(getSecondsUntilMidnight), asyncHandler(async (req, res) => {
    // Get time in Nepal
    const today = getNepalTime();
    const bsDate = convertADtoBS(today);

    // Format date manually to avoid timezone shifts when using toISOString() on a shifted Date object
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const dateString = `${year}-${month}-${day}`;

    res.json({
        success: true,
        data: {
            ad: {
                year: year,
                month: parseInt(month),
                day: parseInt(day),
                weekday: today.toLocaleDateString('en-US', { weekday: 'long' }),
                date: dateString
            },
            bs: bsDate
        }
    });
}));

// GET /api/convert/ad-to-bs?date=YYYY-MM-DD
router.get('/convert/ad-to-bs', cacheMiddleware(), strictLimiter, asyncHandler(async (req, res) => {
    const { date } = req.query;

    if (!date) {
        throw new AppError("Date parameter is required (format: YYYY-MM-DD)", 400);
    }

    const adDate = new Date(date);
    if (isNaN(adDate.getTime())) {
        throw new AppError("Invalid date format. Use YYYY-MM-DD", 400);
    }

    const bsDate = convertADtoBS(adDate);

    res.json({
        success: true,
        data: {
            ad: {
                year: adDate.getFullYear(),
                month: adDate.getMonth() + 1,
                day: adDate.getDate(),
                date: date
            },
            bs: bsDate
        }
    });
}));

// GET /api/calendar/bs?year=YYYY&month=MM
router.get('/calendar/bs', cacheMiddleware(), asyncHandler(async (req, res) => {
    const year = parseInt(req.query.year);
    const month = parseInt(req.query.month);

    if (!year || !month) {
        throw new AppError("Year and Month parameters are required", 400);
    }

    if (isNaN(year) || isNaN(month)) {
        throw new AppError("Year and Month must be valid numbers", 400);
    }

    if (month < 1 || month > 12) {
        throw new AppError("Month must be between 1 and 12", 400);
    }

    const calendar = getBSMonthCalendar(year, month);

    if (!calendar) {
        throw new AppError("Year out of supported range (2000-2099 BS)", 400);
    }

    res.json({
        success: true,
        data: calendar
    });
}));

// GET /api/convert/bs-to-ad?year=YYYY&month=MM&day=DD
router.get('/convert/bs-to-ad', cacheMiddleware(), strictLimiter, asyncHandler(async (req, res) => {
    const year = parseInt(req.query.year);
    const month = parseInt(req.query.month);
    const day = parseInt(req.query.day);

    if (!year || !month || !day) {
        throw new AppError("Year, Month, and Day parameters are required", 400);
    }

    if (isNaN(year) || isNaN(month) || isNaN(day)) {
        throw new AppError("Year, Month, and Day must be valid numbers", 400);
    }

    if (month < 1 || month > 12) {
        throw new AppError("Month must be between 1 and 12", 400);
    }

    if (day < 1 || day > 32) {
        throw new AppError("Day must be between 1 and 32", 400);
    }

    const adDate = convertBStoAD(year, month, day);

    res.json({
        success: true,
        data: {
            bs: {
                year,
                month,
                day
            },
            ad: {
                year: adDate.getFullYear(),
                month: adDate.getMonth() + 1,
                day: adDate.getDate(),
                weekday: adDate.toLocaleDateString('en-US', { weekday: 'long' }),
                date: adDate.toISOString().split('T')[0]
            }
        }
    });
}));

module.exports = router;
