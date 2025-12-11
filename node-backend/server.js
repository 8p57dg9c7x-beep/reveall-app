require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const authRoutes = require('./routes/auth');
const uploadRoutes = require('./routes/upload');
const jobRoutes = require('./routes/jobs');
const addiletsRoutes = require('./routes/addilets');
const bodyScanRoutes = require('./routes/bodyscan');

const app = express();
const PORT = process.env.PORT || 8001;

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB connected to Reveal database'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Ensure upload directory exists
const uploadDir = process.env.UPLOAD_DIR || '/app/node-backend/uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log(`📁 Created upload directory: ${uploadDir}`);
}

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    service: 'Reveal AI Engine',
    version: '1.0.0',
    mode: 'local-development',
    timestamp: new Date().toISOString()
  });
});

// Routes - all prefixed with /api for Kubernetes ingress compatibility
app.use('/api/auth', authRoutes);
app.use('/api/uploads', uploadRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/reveal-dna', revealDNARoutes);
app.use('/api/body-scan', bodyScanRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('❌ Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log('');
  console.log('🚀 ================================================');
  console.log('🤖 REVEAL AI ENGINE - LOCAL DEVELOPMENT MODE');
  console.log('🚀 ================================================');
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`📁 Upload directory: ${uploadDir}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
  console.log('🚀 ================================================');
  console.log('');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  mongoose.connection.close();
  process.exit(0);
});
