const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const AIJob = require('../models/AIJob');
const { createJob } = require('../services/jobQueue');
const router = express.Router();

// Configure multer for local storage (mock S3)
const uploadDir = process.env.UPLOAD_DIR || '/app/node-backend/uploads';

// Ensure upload directory exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error('Only image files are allowed'));
  }
});

/**
 * POST /api/uploads/image
 * Upload image, store in S3 (mock: local), create AIJob, push to Bull queue
 * Returns: { "jobId": "", "status": "queued" }
 */
router.post('/image', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    // Get job type from request (default: 'style')
    const jobType = req.body.type || 'style';
    
    // Validate job type matches schema
    const validTypes = ['style', 'wardrobe', 'body-scan'];
    const normalizedType = validTypes.includes(jobType) ? jobType : 'style';

    // Mock S3 URL (local file path for now)
    const inputImage = `file://${req.file.path}`;

    // Create AIJob in MongoDB
    const aiJob = new AIJob({
      userId: req.userId || null, // From auth middleware if present
      type: normalizedType,
      inputImage: inputImage,
      status: 'queued',
      output: {},
      createdAt: new Date(),
      updatedAt: new Date()
    });
    await aiJob.save();

    // Create job in queue
    const queueJob = await createJob({
      mongoJobId: aiJob._id.toString(),
      type: normalizedType,
      inputImage: inputImage,
      imagePath: req.file.path,
      filename: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype,
      uploadedAt: new Date().toISOString()
    });

    // Link queue job ID to MongoDB job
    aiJob.queueJobId = queueJob.id;
    await aiJob.save();

    console.log(`📤 Image uploaded: ${req.file.filename}`);
    console.log(`📦 AIJob created: ${aiJob._id}`);
    console.log(`🔄 Queue job: ${queueJob.id}`);

    res.status(201).json({
      jobId: aiJob._id.toString(),
      status: 'queued'
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: error.message || 'Upload failed' });
  }
});

/**
 * POST /api/uploads/images (multiple)
 * For body-scan which requires front + side photos
 */
router.post('/images', upload.array('images', 2), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No image files provided' });
    }

    const jobType = req.body.type || 'body-scan';
    const inputImages = req.files.map(f => `file://${f.path}`);

    // Create AIJob in MongoDB
    const aiJob = new AIJob({
      userId: req.userId || null,
      type: 'body-scan',
      inputImage: inputImages.join(','), // Store multiple as comma-separated
      status: 'queued',
      output: {},
      createdAt: new Date(),
      updatedAt: new Date()
    });
    await aiJob.save();

    // Create job in queue
    const queueJob = await createJob({
      mongoJobId: aiJob._id.toString(),
      type: 'body-scan',
      inputImages: inputImages,
      files: req.files.map(f => ({
        path: f.path,
        filename: f.filename,
        originalName: f.originalname
      })),
      uploadedAt: new Date().toISOString()
    });

    aiJob.queueJobId = queueJob.id;
    await aiJob.save();

    console.log(`📤 ${req.files.length} images uploaded for body-scan`);
    console.log(`📦 AIJob created: ${aiJob._id}`);

    res.status(201).json({
      jobId: aiJob._id.toString(),
      status: 'queued'
    });
  } catch (error) {
    console.error('Multi-upload error:', error);
    res.status(500).json({ error: error.message || 'Upload failed' });
  }
});

module.exports = router;
