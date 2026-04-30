// src/utils/cloudinary.js
const { v2: cloudinary } = require('cloudinary');
const multer = require('multer');
const logger = require('../config/logger');

// 🌐 Initialize Cloudinary configuration
const configureCloudinary = () => {
  const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env;
  
  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
    throw new Error('❌ Missing required Cloudinary environment variables');
  }

  cloudinary.config({
    cloud_name: CLOUDINARY_CLOUD_NAME,
    api_key: CLOUDINARY_API_KEY,
    api_secret: CLOUDINARY_API_SECRET,
    secure: true,
  });
  logger.info('✅ Cloudinary configured successfully');
};

// 📦 Multer setup for in-memory storage (buffers files before Cloudinary upload)
const storage = multer.memoryStorage();
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only images are allowed.'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: parseInt(process.env.MAX_IMAGE_SIZE) || 5 * 1024 * 1024 }, // 5MB default
});

// ☁️ Upload buffer to Cloudinary with transformations
const uploadToCloudinary = (fileBuffer, folder = 'evento') => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'auto',
        transformation: [{ width: 1280, height: 720, crop: 'limit', quality: 'auto' }],
      },
      (error, result) => {
        if (error) {
          logger.error('❌ Cloudinary upload failed', error);
          reject(error);
        } else {
          resolve(result);
        }
      }
    );
    uploadStream.end(fileBuffer);
  });
};

module.exports = { configureCloudinary, upload, uploadToCloudinary, cloudinary };