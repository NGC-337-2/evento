/**
 * EventO Backend — Entry Point (Production-Ready)
 * Platform: Online Event Booking & Management System
 * Stack: Node.js + Express + MongoDB + JWT + Stripe
 */

require('dotenv').config();
require('express-async-errors');


const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const mongoSanitize = require('express-mongo-sanitize');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
const hpp = require('hpp');
const { v4: uuidv4 } = require('uuid');

const { connectDB } = require('./config/db');
const { errorHandler, notFound } = require('./middleware/errorHandler');
const logger = require('./config/logger');
const { getDbStatus } = require('./config/db'); // From improved connectDB module
const { configureCloudinary } = require('./utils/cloudinary');

// Route imports
const authRoutes = require('./routes/authRoutes');
const eventRoutes = require('./routes/eventRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const userRoutes = require('./routes/userRoutes');
const statsRoutes = require('./routes/statsRoutes');
const exportRoutes = require('./routes/exportRoutes');
const adminRoutes = require('./routes/adminRoutes');

// ─── Environment Validation ──────────────────────────────────────────────────
const requiredEnvVars = ['NODE_ENV', 'PORT', 'MONGO_URI', 'JWT_SECRET', 'CLIENT_URL'];
const missingVars = requiredEnvVars.filter((key) => !process.env[key]);
if (missingVars.length > 0) {
  logger.error(`❌ Missing required environment variables: ${missingVars.join(', ')}`);
  process.exit(1);
}

// ─── Express App Initialization ──────────────────────────────────────────────
const app = express();
const PORT = process.env.PORT || 5000;

// ─── Request ID & Context Middleware ─────────────────────────────────────────
app.use((req, res, next) => {
  req.id = req.headers['x-request-id'] || uuidv4();
  res.setHeader('X-Request-ID', req.id);

  // Add request context to logger (if using Winston/Pino)
  if (logger.child) {
    req.log = logger.child({ requestId: req.id, ip: req.ip, userAgent: req.get('user-agent') });
  }
  next();
});

// ─── Security Middleware ─────────────────────────────────────────────────────
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", 'https://js.stripe.com'],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'https:', 'http:'],
      connectSrc: ["'self'", 'https://api.stripe.com'],
      frameSrc: ["'self'", 'https://js.stripe.com'],
    },
  },
  crossOriginEmbedderPolicy: false, // Required for Stripe Elements
}));

// CORS with dynamic origin validation
const allowedOrigins = [
  process.env.CLIENT_URL,
  'http://localhost:5173',
  'http://localhost:3000',
  ...(process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : [])
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      logger.warn(`🚫 CORS blocked: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID'],
  exposedHeaders: ['X-Request-ID', 'X-Total-Count'],
}));

// HTTP Parameter Pollution protection
app.use(hpp());

// ─── Rate Limiting (Configurable per env) ────────────────────────────────────
const createLimiter = (windowMs, max, message) => rateLimit({
  windowMs,
  max,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.headers['x-forwarded-for'] || req.ip,
  handler: (req, res) => {
    logger.warn(`⚠️ Rate limit exceeded: ${req.method} ${req.path} from ${req.ip}`);
    res.status(429).json({ success: false, message });
  },
});

// Global API limiter
app.use('/api', createLimiter(
  15 * 60 * 1000,
  parseInt(process.env.RATE_LIMIT_GLOBAL_MAX) || 100,
  'Too many requests, please try again later.'
));

// Auth-specific stricter limiter
app.use('/api/v1/auth', createLimiter(
  15 * 60 * 1000,
  parseInt(process.env.RATE_LIMIT_AUTH_MAX) || 20,
  'Too many auth attempts, please try again later.'
));

// ─── Stripe Webhook (MUST be before body parsers) ────────────────────────────
const { stripeWebhook } = require('./controllers/bookingController');
app.post(
  '/api/v1/bookings/webhook',
  express.raw({ type: 'application/json' }),
  (req, res, next) => {
    req.log?.info('📦 Stripe webhook received', {
      signature: req.headers['stripe-signature']?.substring(0, 20) + '...'
    });
    next();
  },
  stripeWebhook
);

// ─── Body Parsing & Sanitization ─────────────────────────────────────────────
app.use(express.json({
  limit: process.env.MAX_UPLOAD_SIZE || '10kb',
  strict: true
}));
app.use(express.urlencoded({
  extended: true,
  limit: process.env.MAX_UPLOAD_SIZE || '10kb'
}));
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(mongoSanitize({ replaceWith: '_' }));


// ─── Performance & Reliability ───────────────────────────────────────────────
app.use(compression({ level: 6, threshold: '1kb' }));

// Request timeout (disable for webhooks/long-polling)
app.use((req, res, next) => {
  if (!req.path.includes('/webhook')) {
    res.setTimeout(30000, () => {
      req.log?.warn('⏱️ Request timeout');
      res.status(408).json({ success: false, message: 'Request timeout' });
    });
  }
  next();
});

// ─── Logging ─────────────────────────────────────────────────────────────────
if (process.env.NODE_ENV === 'development') {
  // Enhanced morgan format with request ID
  morgan.token('id', (req) => req.id);
  app.use(morgan('[:id] :method :url :status :response-time ms - :res[content-length]', {
    stream: { write: (message) => logger.http(message.trim()) }
  }));
} else {
  // Structured JSON logging for production
  app.use(morgan('combined', {
    stream: {
      write: (message) => logger.info('HTTP Request', {
        raw: message.trim(),
        requestId: 'N/A' 
      })
    }
  }));
}


// ─── Enhanced Health Check ───────────────────────────────────────────────────
app.get('/api/health', async (req, res) => {
  try {
    const db = getDbStatus();
    const isDbHealthy = db.readyState === 1; // connected
    const overallHealthy = isDbHealthy; // Add Redis, Stripe status later

    res.status(overallHealthy ? 200 : 503).json({
      success: overallHealthy,
      status: overallHealthy ? 'healthy' : 'degraded',
      service: 'EventO API',
      version: process.env.APP_VERSION || '1.0.0',
      environment: process.env.NODE_ENV,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: {
        status: ['disconnected', 'connected', 'connecting', 'disconnecting'][db.readyState],
        host: db.host,
        name: db.name,
      },
      // Add more services as implemented:
      // stripe: { status: 'ok' },
      // email: { status: 'ok' },
    });
  } catch (error) {
    logger.error('Health check failed', error);
    res.status(503).json({
      success: false,
      status: 'unhealthy',
      message: 'Health check failed',
      timestamp: new Date().toISOString(),
    });
  }
});

// Root redirect to docs/health
app.get('/', (req, res) => {
  res.redirect('/api/health');
});

// ─── API Routes ───────────────────────────────────────────────────────────────
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/events', eventRoutes);
app.use('/api/v1/bookings', bookingRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/stats', statsRoutes);
app.use('/api/v1/export', exportRoutes);
app.use('/api/v1/admin', adminRoutes);

// ─── 404 & Error Handling ─────────────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

// ─── Server Startup & Graceful Shutdown ───────────────────────────────────────
let server;

const startServer = async () => {
  try {
    // ✅ Connect to DB and Cloudinary first
    await connectDB();
    configureCloudinary();

    server = app.listen(PORT, '0.0.0.0', () => {
      logger.info(`🚀 EventO API server running in ${process.env.NODE_ENV} mode`, {
        port: PORT,
        pid: process.pid,
        environment: process.env.NODE_ENV,
        requestId: 'startup'
      });
    });

    // Handle server-level errors
    server.on('error', (err) => {
      logger.error('❌ Server error', err);
    });

    // Handle graceful shutdown
    const gracefulShutdown = async (signal) => {
      logger.info(`🛑 ${signal} received. Starting graceful shutdown...`, { requestId: 'shutdown' });

      // Stop accepting new requests
      server.close((err) => {
        if (err) {
          logger.error('❌ Error closing HTTP server', err);
          process.exit(1);
        }
      });

      // Close DB connections
      try {
        const { closeConnection } = require('./config/db');
        await closeConnection?.();
        logger.info('✅ MongoDB connection closed');
      } catch (dbErr) {
        logger.error('❌ Error closing MongoDB', dbErr);
      }

      // Final exit
      setTimeout(() => {
        logger.info('💤 Shutdown complete');
        process.exit(0);
      }, 1000); // Allow in-flight requests to finish
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    // Unhandled rejections & exceptions
    process.on('unhandledRejection', (reason, promise) => {
      logger.error('💥 Unhandled Rejection at', { promise, reason });
      gracefulShutdown('UNHANDLED_REJECTION');
    });

    process.on('uncaughtException', (error) => {
      logger.error('💥 Uncaught Exception', error);
      gracefulShutdown('UNCAUGHT_EXCEPTION');
    });

  } catch (error) {
    logger.error('❌ Failed to start server', error);
    process.exit(1);
  }
};

// Start only if this is the entry point (not required in tests)
if (require.main === module) {
  startServer();
}

module.exports = { app, startServer }; // Export for testing & clustering
