const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const router = express.Router();
const { createJob } = require('../services/jobQueue');
const { optionalAuth } = require('../middleware/auth');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = process.env.UPLOAD_DIR || '/tmp/uploads';
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Only image files are allowed (jpeg, jpg, png, webp)'));
  }
});

/**
 * POST /api/uploads/image
 * Upload image and create AI processing job
 * 
 * Body (multipart/form-data):
 * - image: File (required)
 * - type: string (optional) - 'stylist', 'wardrobe', 'body-scan'
 * - metadata: JSON string (optional)
 */
router.post('/image', optionalAuth, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    const { type = 'general', metadata } = req.body;
    
    // Parse metadata if provided
    let parsedMetadata = {};
    if (metadata) {
      try {
        parsedMetadata = JSON.parse(metadata);
      } catch (e) {
        console.warn('Invalid metadata JSON, using empty object');
      }
    }

    // Create job in queue
    const job = await createJob({
      type,
      imagePath: req.file.path,
      filename: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype,
      metadata: parsedMetadata,
      uploadedAt: new Date().toISOString()
    });

    console.log(`✅ Image uploaded: ${req.file.filename}`);
    console.log(`📦 Job created: ${job.id}`);

    res.status(201).json({
      message: 'Image uploaded successfully',
      jobId: job.id,
      filename: req.file.filename,
      status: 'queued',
      estimatedProcessingTime: '2-5 seconds'
    });
  } catch (error) {
    console.error('❌ Upload error:', error);
    
    // Clean up file if upload failed
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(500).json({ error: 'Upload failed: ' + error.message });
  }
});

/**
 * POST /api/uploads/images
 * Upload multiple images (for body scanner: front + side)
 */
router.post('/images', upload.array('images', 2), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No image files provided' });
    }

    const { type = 'body-scan', metadata } = req.body;
    
    let parsedMetadata = {};
    if (metadata) {
      try {
        parsedMetadata = JSON.parse(metadata);
      } catch (e) {
        console.warn('Invalid metadata JSON');
      }
    }

    // Create job with multiple images
    const job = await createJob({
      type,
      images: req.files.map(file => ({
        path: file.path,
        filename: file.filename,
        originalName: file.originalname,
        size: file.size,
        mimetype: file.mimetype
      })),
      metadata: parsedMetadata,
      uploadedAt: new Date().toISOString()
    });

    console.log(`✅ ${req.files.length} images uploaded`);
    console.log(`📦 Job created: ${job.id}`);

    res.status(201).json({
      message: `${req.files.length} images uploaded successfully`,
      jobId: job.id,
      fileCount: req.files.length,
      status: 'queued',
      estimatedProcessingTime: '3-7 seconds'
    });
  } catch (error) {
    console.error('❌ Multi-upload error:', error);
    
    // Clean up files if upload failed
    if (req.files) {
      req.files.forEach(file => {
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      });
    }
    
    res.status(500).json({ error: 'Upload failed: ' + error.message });
  }
});

module.exports = router;
