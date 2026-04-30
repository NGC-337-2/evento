const { v2: cloudinary } = require('cloudinary');
const multer = require('multer');
const logger = require('../config/logger');

// 1. Configure Cloudinary v2
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

// 2. Configure Multer to store files in memory (buffer)
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Not an image! Please upload only images.'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

// 3. Helper function to upload buffer to Cloudinary v2
const uploadToCloudinary = (fileBuffer, folder = 'evento') => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: folder,
        resource_type: 'auto',
        transformation: [{ width: 1280, height: 720, crop: 'limit' }],
      },
      (error, result) => {
        if (error) {
          logger.error('Cloudinary upload error:', error);
          reject(error);
        } else {
          resolve(result);
        }
      }
    );
    uploadStream.end(fileBuffer);
  });
};

module.exports = {
  upload, // Use as middleware: upload.single('image')
  uploadToCloudinary, // Use in controller: await uploadToCloudinary(req.file.buffer)
  cloudinary,
};