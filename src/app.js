require('dotenv').config();
const express = require('express');
const cors = require('cors');
const calendarRoutes = require('./routes/calendarRoutes');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');
const { apiLimiter } = require('./middleware/rateLimiter');

const app = express();

// Trust the first proxy (Render)
app.set('trust proxy', 1);

// Middleware
app.use(cors());
app.use(express.json());

// Apply rate limiting to all API routes
app.use('/api', apiLimiter);

// Routes
app.use('/api', calendarRoutes);

app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'Nepali Calendar API is running',
        version: '2.0.0',
        endpoints: {
            today: '/api/today',
            adToBs: '/api/convert/ad-to-bs?date=YYYY-MM-DD',
            bsToAd: '/api/convert/bs-to-ad?year=YYYY&month=MM&day=DD',
            calendar: '/api/calendar/bs?year=YYYY&month=MM'
        }
    });
});

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
