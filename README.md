# Nepali Calendar REST API

Accurate Nepali (Bikram Sambat) calendar system with REST API built with Node.js and Express.

## Features

- Convert **Gregorian (AD) ↔ Nepali (BS)**
- Get **BS monthly calendar**
- Get **today's date** in both AD & BS
- Accurate year, month, day, and weekday (2000 BS – 2099 BS)
- **In-memory caching** for faster responses
- Fully offline, **CORS enabled**
- Rate limiting to prevent abuse

## Installation

```bash
npm install
```

## Configuration

Create a `.env` file in the root directory (optional):

```env
PORT=3000
CACHE_TTL=3600
NODE_ENV=development
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## Usage

Start the server:

```bash
node src/server.js
```

API base URL: `http://localhost:3000`

---

## API Endpoints

### 1. Get Today's Date

**Endpoint:** `GET /api/today`

Returns the current date in both AD and BS formats.

**Example Request:**
```bash
curl "http://localhost:3000/api/today"
```

**Example Response:**
```json
{
  "success": true,
  "data": {
    "ad": {
      "year": 2025,
      "month": 12,
      "day": 22,
      "weekday": "Monday",
      "date": "2025-12-22"
    },
    "bs": {
      "year": 2082,
      "month": 9,
      "monthName": "Poush",
      "day": 7,
      "weekday": "Monday"
    }
  }
}
```

---

### 2. Convert AD to BS

**Endpoint:** `GET /api/convert/ad-to-bs?date=YYYY-MM-DD`

Converts a Gregorian (AD) date to Nepali (BS) date.

**Parameters:**
- `date` (required): Date in YYYY-MM-DD format

**Example Request:**
```bash
curl "http://localhost:3000/api/convert/ad-to-bs?date=2024-12-07"
```

**Example Response:**
```json
{
  "success": true,
  "data": {
    "ad": {
      "year": 2024,
      "month": 12,
      "day": 7,
      "date": "2024-12-07"
    },
    "bs": {
      "year": 2081,
      "month": 8,
      "monthName": "Mangsir",
      "day": 22,
      "weekday": "Saturday"
    }
  }
}
```

---

### 3. Convert BS to AD

**Endpoint:** `GET /api/convert/bs-to-ad?year=YYYY&month=MM&day=DD`

Converts a Nepali (BS) date to Gregorian (AD) date.

**Parameters:**
- `year` (required): BS year (2000-2099)
- `month` (required): BS month (1-12)
- `day` (required): BS day (1-32)

**Example Request:**
```bash
curl "http://localhost:3000/api/convert/bs-to-ad?year=2081&month=8&day=22"
```

**Example Response:**
```json
{
  "success": true,
  "data": {
    "bs": {
      "year": 2081,
      "month": 8,
      "day": 22
    },
    "ad": {
      "year": 2024,
      "month": 12,
      "day": 7,
      "weekday": "Saturday",
      "date": "2024-12-07"
    }
  }
}
```

---

### 4. Get BS Monthly Calendar

**Endpoint:** `GET /api/calendar/bs?year=YYYY&month=MM`

Returns calendar information for a specific BS month.

**Parameters:**
- `year` (required): BS year (2000-2099)
- `month` (required): BS month (1-12)

**Example Request:**
```bash
curl "http://localhost:3000/api/calendar/bs?year=2081&month=8"
```

**Example Response:**
```json
{
  "success": true,
  "data": {
    "year": 2081,
    "month": 8,
    "monthName": "Mangsir",
    "daysInMonth": 30,
    "startWeekdayIndex": 4
  }
}
```

**Note:** `startWeekdayIndex` is 0-indexed (0=Sunday, 1=Monday, ..., 6=Saturday)

---

## Error Handling

All endpoints return consistent error responses:

**Example Error Response:**
```json
{
  "success": false,
  "error": {
    "message": "Invalid date format. Use YYYY-MM-DD",
    "statusCode": 400
  }
}
```

**Common Error Codes:**
- `400` - Bad Request (invalid parameters)
- `404` - Not Found (invalid endpoint)
- `429` - Too Many Requests (rate limit exceeded)
- `500` - Internal Server Error

---

## Rate Limiting

The API implements rate limiting to prevent abuse:

### General API Limit
- **100 requests per 15 minutes** per IP address
- Applies to all `/api/*` endpoints

### Strict Conversion Limit
- **30 requests per minute** per IP address
- Applies to:
  - `/api/convert/ad-to-bs`
  - `/api/convert/bs-to-ad`

### Rate Limit Headers
All responses include rate limit information:
```
RateLimit-Limit: 100
RateLimit-Remaining: 95
RateLimit-Reset: 1640000000
```

### Rate Limit Exceeded Response
```json
{
  "success": false,
  "error": {
    "message": "Too many requests from this IP, please try again after 15 minutes",
    "statusCode": 429,
    "retryAfter": 1640000000
  }
}
```

---

## Caching

The API implements in-memory caching for all GET requests:
- **Cache TTL:** 3600 seconds (configurable via `CACHE_TTL`)
- **Cache Headers:**
  - `X-Cache: HIT` - Response served from cache
  - `X-Cache: MISS` - Response computed and cached

---

## BS Month Names

| Month | Nepali | English |
|-------|--------|---------|
| 1 | बैशाख | Baishakh |
| 2 | जेष्ठ | Jestha |
| 3 | असार | Ashadh |
| 4 | श्रावण | Shrawan |
| 5 | भाद्र | Bhadra |
| 6 | आश्विन | Ashwin |
| 7 | कार्तिक | Kartik |
| 8 | मंसिर | Mangsir |
| 9 | पौष | Poush |
| 10 | माघ | Magh |
| 11 | फाल्गुण | Falgun |
| 12 | चैत्र | Chaitra |

---

## Project Structure

```
/src
├── data/
│   └── bsMonthData.js          # BS month length data (2000-2099)
├── utils/
│   ├── dateConverter.js         # Core conversion logic
│   └── cache.js                 # Caching utilities
├── middleware/
│   ├── errorHandler.js          # Error handling
│   └── rateLimiter.js           # Rate limiting
├── routes/
│   └── calendarRoutes.js        # API endpoints
├── app.js                       # Express configuration
└── server.js                    # Server entry point
```

---

## Technical Details

- **Anchor Date:** 2000-01-01 BS = 1943-04-17 AD
- **Algorithm:** Day-counting from anchor with year-wise month length table
- **Timezone:** UTC-based calculations to avoid DST issues
- **Supported Range:** 2000 BS to 2099 BS

---

## License

ISC# nepali-calendar-api
