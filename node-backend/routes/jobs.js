const express = require('express');
const AIJob = require('../models/AIJob');
const { getJob, getJobResult } = require('../services/jobQueue');
const router = express.Router();

/**
 * GET /api/jobs/:jobId
 * Get job status and result
 * Response: {
 *   "jobId": "",
 *   "status": "queued | processing | completed | failed",
 *   "result": {}
 * }
 */
router.get('/:jobId', async (req, res) => {
  try {
    const { jobId } = req.params;

    // Try to get from MongoDB first (jobId is MongoDB _id)
    const aiJob = await AIJob.findById(jobId);
    
    if (aiJob) {
      return res.json({
        jobId: aiJob._id.toString(),
        status: aiJob.status,
        result: aiJob.output || {}
      });
    }

    // Fallback to in-memory queue (for backwards compatibility)
    const queueJob = getJob(jobId);
    if (queueJob) {
      const result = getJobResult(jobId);
      return res.json({
        jobId: queueJob.id,
        status: queueJob.status,
        result: result || {}
      });
    }

    res.status(404).json({ error: 'Job not found' });
  } catch (error) {
    console.error('Get job error:', error);
    res.status(500).json({ error: 'Failed to get job status' });
  }
});

/**
 * GET /api/jobs/:jobId/result
 * Get just the job result (if completed)
 */
router.get('/:jobId/result', async (req, res) => {
  try {
    const { jobId } = req.params;

    // Try MongoDB first
    const aiJob = await AIJob.findById(jobId);
    
    if (aiJob) {
      if (aiJob.status !== 'completed') {
        return res.status(202).json({
          jobId: aiJob._id.toString(),
          status: aiJob.status,
          message: 'Job still processing'
        });
      }
      
      return res.json({
        jobId: aiJob._id.toString(),
        status: 'completed',
        result: aiJob.output || {}
      });
    }

    // Fallback to in-memory queue
    const queueJob = getJob(jobId);
    if (queueJob) {
      if (queueJob.status !== 'completed') {
        return res.status(202).json({
          jobId: queueJob.id,
          status: queueJob.status,
          message: 'Job still processing'
        });
      }
      
      const result = getJobResult(jobId);
      return res.json({
        jobId: queueJob.id,
        status: 'completed',
        result: result || {}
      });
    }

    res.status(404).json({ error: 'Job not found' });
  } catch (error) {
    console.error('Get job result error:', error);
    res.status(500).json({ error: 'Failed to get job result' });
  }
});

module.exports = router;
