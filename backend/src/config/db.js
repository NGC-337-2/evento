// src/config/db.js
const mongoose = require('mongoose');
const logger = require('./logger');

const MAX_RETRIES = parseInt(process.env.MONGO_MAX_RETRIES) || 5;
const INITIAL_RETRY_DELAY_MS = parseInt(process.env.MONGO_RETRY_DELAY_MS) || 2000;

let retries = 0;
let isShuttingDown = false;

// 🔧 Setup connection event listeners (called once at module load)
const setupConnectionEvents = () => {
  mongoose.connection.on('connected', () => {
    logger.info(`✅ MongoDB connected: ${mongoose.connection.host}/${mongoose.connection.name}`);
  });

  mongoose.connection.on('disconnected', () => {
    if (!isShuttingDown) {
      logger.warn('⚠️ MongoDB disconnected');
    }
  });

  mongoose.connection.on('error', (err) => {
    if (!isShuttingDown) {
      logger.error('❌ MongoDB connection error:', err);
    }
  });
};

// ⏱️ Calculate retry delay with exponential backoff
const getRetryDelay = (attempt) => {
  return Math.min(INITIAL_RETRY_DELAY_MS * Math.pow(2, attempt), 30000);
};

// 🔌 Main connection function
const connectDB = async () => {
  if (!process.env.MONGO_URI) {
    logger.error('❌ MONGO_URI environment variable is missing');
    process.exit(1);
  }

  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      maxPoolSize: parseInt(process.env.MONGO_POOL_SIZE) || 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    logger.info(`🔗 Successfully connected to MongoDB: ${conn.connection.host}/${conn.connection.name}`);
    retries = 0;
    return conn.connection;
  } catch (error) {
    retries++;
    logger.error(`❌ MongoDB connection failed [${error.name}] (attempt ${retries}/${MAX_RETRIES}): ${error.message}`);

    if (retries < MAX_RETRIES) {
      const delay = getRetryDelay(retries);
      logger.info(`🔄 Retrying connection in ${(delay / 1000).toFixed(1)}s...`);
      await new Promise((resolve) => setTimeout(resolve, delay));
      return connectDB(); // Recursive retry
    } else {
      logger.error('💥 Max MongoDB retries reached. Exiting process.');
      process.exit(1);
    }
  }
};

// 🛑 Graceful shutdown helper
const closeConnection = async () => {
  if (isShuttingDown) return;
  isShuttingDown = true;

  try {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
      logger.info('✅ MongoDB connection closed gracefully');
    }
  } catch (err) {
    logger.error('❌ Error closing MongoDB connection:', err);
  }
};

// 📊 Health check helper
const getDbStatus = () => ({
  readyState: mongoose.connection.readyState, // 0=disconnected, 1=connected, 2=connecting, 3=disconnecting
  host: mongoose.connection.host,
  name: mongoose.connection.name,
});

// Initialize listeners
setupConnectionEvents();

module.exports = { connectDB, closeConnection, getDbStatus };