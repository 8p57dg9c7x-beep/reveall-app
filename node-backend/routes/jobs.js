const express = require('express');
const router = express.Router();
const { getJob, getJobResult, getAllJobs } = require('../services/jobQueue');

/**
 * GET /api/jobs/:jobId
 * Get job status by ID
 */
router.get('/:jobId', (req, res) => {
  try {
    const { jobId } = req.params;
    const job = getJob(jobId);

    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    res.json({
      jobId: job.id,
      status: job.status,
      progress: job.progress,
      createdAt: job.createdAt,
      updatedAt: job.updatedAt,
      ...(job.completedAt && { completedAt: job.completedAt }),
      ...(job.failedAt && { failedAt: job.failedAt }),
      ...(job.error && { error: job.error })
    });
  } catch (error) {
    console.error('Error fetching job:', error);
    res.status(500).json({ error: 'Failed to fetch job status' });
  }
});

/**
 * GET /api/jobs/:jobId/result
 * Get job result
 */
router.get('/:jobId/result', (req, res) => {
  try {
    const { jobId } = req.params;
    const job = getJob(jobId);

    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    if (job.status === 'queued' || job.status === 'processing') {
      return res.status(202).json({
        message: 'Job is still processing',
        status: job.status,
        progress: job.progress
      });
    }

    if (job.status === 'failed') {
      return res.status(500).json({
        error: 'Job processing failed',
        message: job.error
      });
    }

    const result = getJobResult(jobId);
    if (!result) {
      return res.status(404).json({ error: 'Job result not found' });
    }

    res.json({
      jobId,
      status: 'completed',
      result
    });
  } catch (error) {
    console.error('Error fetching job result:', error);
    res.status(500).json({ error: 'Failed to fetch job result' });
  }
});

/**
 * GET /api/jobs
 * Get all jobs (debugging endpoint)
 */
router.get('/', (req, res) => {
  try {
    const jobs = getAllJobs();
    res.json({
      totalJobs: jobs.length,
      jobs: jobs.map(job => ({
        id: job.id,
        status: job.status,
        type: job.data.type,
        progress: job.progress,
        createdAt: job.createdAt,
        updatedAt: job.updatedAt
      }))
    });
  } catch (error) {
    console.error('Error fetching jobs:', error);
    res.status(500).json({ error: 'Failed to fetch jobs' });
  }
});

module.exports = router;
