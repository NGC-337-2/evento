// utils/connectDB.js
const mongoose = require('mongoose');
const logger = require('./logger');

const MAX_RETRIES = parseInt(process.env.MONGO_MAX_RETRIES) || 5;
const INITIAL_RETRY_DELAY_MS = parseInt(process.env.MONGO_RETRY_DELAY_MS) || 5000;
const MAX_RETRY_DELAY_MS = 60000; // Cap at 60s

let retries = 0;
let isShuttingDown = false;

// ✅ Move event listeners outside connectDB to avoid duplicate registration
const setupConnectionEvents = () => {
  mongoose.connection.on('connected', () => {
    logger.info(`✅ MongoDB connected: ${mongoose.connection.host}/${mongoose.connection.name}`);
  });

  mongoose.connection.on('disconnected', () => {
    if (!isShuttingDown) {
      logger.warn('⚠️ MongoDB disconnected. Reconnection attempts will begin...');
    }
  });

  mongoose.connection.on('reconnected', () => {
    logger.info('🔄 MongoDB reconnected successfully');
    retries = 0; // Reset retry counter on successful reconnection
  });

  mongoose.connection.on('error', (err) => {
    // Only log as error if not during intentional shutdown
    if (!isShuttingDown) {
      logger.error(`❌ MongoDB connection error: ${err.message}`, {
        code: err.code,
        name: err.name
      });
    }
  });

  // ✅ Handle graceful shutdown
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
};

const shutdown = async () => {
  if (isShuttingDown) return;
  isShuttingDown = true;

  logger.info('🛑 Shutting down: Closing MongoDB connection...');
  try {
    await mongoose.connection.close();
    logger.info('✅ MongoDB connection closed gracefully');
    process.exit(0);
  } catch (err) {
    logger.error('❌ Error during MongoDB shutdown', err);
    process.exit(1);
  }
};

// ✅ Exponential backoff with jitter to avoid thundering herd
const calculateRetryDelay = (attempt) => {
  const exponential = INITIAL_RETRY_DELAY_MS * Math.pow(2, attempt - 1);
  const capped = Math.min(exponential, MAX_RETRY_DELAY_MS);
  const jitter = Math.random() * 0.2 * capped; // ±10% jitter
  return capped + jitter;
};

const connectDB = async () => {
  // ✅ Validate critical environment variables upfront
  if (!process.env.MONGO_URI) {
    logger.error('❌ MONGO_URI environment variable is not set');
    process.exit(1);
  }

  try {
    await mongoose.connect(process.env.MONGO_URI, {
      // ✅ Updated options for Mongoose 7+
      maxPoolSize: parseInt(process.env.MONGO_POOL_SIZE) || 10,
      minPoolSize: parseInt(process.env.MONGO_MIN_POOL_SIZE) || 5,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      heartbeatFrequencyMS: 10000, // Faster failure detection
      retryWrites: true,
      retryReads: true,
      // ✅ Remove deprecated 'family' option; let DNS handle IPv4/IPv6
    });

    // ✅ Success: reset state
    retries = 0;
    return mongoose.connection;

  } catch (error) {
    retries += 1;

    // ✅ Classify errors for better observability
    const errorType = error.name === 'MongoServerSelectionError' ? 'NETWORK' :
      error.name === 'MongoAuthenticationError' ? 'AUTH' :
        error.name === 'MongoParseError' ? 'CONFIG' : 'UNKNOWN';

    logger.error(`❌ MongoDB connection failed [${errorType}] (attempt ${retries}/${MAX_RETRIES}): ${error.message}`, {
      name: error.name,
      code: error.code,
      topology: error.topology?.description?.type
    });

    if (retries < MAX_RETRIES) {
      const delay = calculateRetryDelay(retries);
      logger.info(`🔄 Retrying MongoDB connection in ${(delay / 1000).toFixed(1)}s...`);

      // ✅ Return promise to enable proper async handling
      return new Promise((resolve) => {
        setTimeout(async () => {
          try {
            const conn = await connectDB();
            resolve(conn);
          } catch (err) {
            // Propagate if all retries exhausted
            if (retries >= MAX_RETRIES) throw err;
          }
        }, delay);
      });
    } else {
      logger.error('💥 Max MongoDB connection retries reached. Terminating process.');
      // ✅ Allow upstream error handling instead of immediate exit
      throw new Error(`MongoDB connection failed after ${MAX_RETRIES} attempts: ${error.message}`);
    }
  }
};

// ✅ Initialize event listeners once at module load
setupConnectionEvents();

// ✅ Export connection utility + health check helper
module.exports = {
  connectDB,
  getDbStatus: () => ({
    readyState: mongoose.connection.readyState, // 0=disconnected, 1=connected, 2=connecting, 3=disconnecting
    host: mongoose.connection.host,
    name: mongoose.connection.name,
  }),
  closeConnection: () => mongoose.connection.close(),
};