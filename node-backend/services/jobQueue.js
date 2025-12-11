/**
 * Reveal Job Queue
 * In-Memory Queue with MongoDB persistence (Bull-like interface)
 * Uses local storage for S3 mock
 */

const { processJob } = require('./aiOrchestrator');
const AIJob = require('../models/AIJob');

// In-memory job storage (for quick access)
const jobs = new Map();
const jobResults = new Map();

let jobIdCounter = 1;

/**
 * Create a new job
 * @param {Object} data - Job data
 * @returns {Object} Created job
 */
async function createJob(data) {
  const jobId = `queue_${Date.now()}_${jobIdCounter++}`;
  
  const job = {
    id: jobId,
    data,
    status: 'queued',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    progress: 0
  };

  jobs.set(jobId, job);
  
  console.log(`📦 Queue job ${jobId} created`);
  
  // Process job asynchronously (simulate Bull queue processing)
  setTimeout(() => processJobAsync(jobId), 100);
  
  return job;
}

/**
 * Get job by ID
 * @param {string} jobId
 * @returns {Object|null} Job data
 */
function getJob(jobId) {
  return jobs.get(jobId) || null;
}

/**
 * Get job result
 * @param {string} jobId
 * @returns {Object|null} Job result
 */
function getJobResult(jobId) {
  return jobResults.get(jobId) || null;
}

/**
 * Update job status
 * @param {string} jobId
 * @param {Object} updates
 */
async function updateJob(jobId, updates) {
  const job = jobs.get(jobId);
  if (job) {
    Object.assign(job, updates, {
      updatedAt: new Date().toISOString()
    });
    jobs.set(jobId, job);
  }
}

/**
 * Process job asynchronously
 * @param {string} jobId
 */
async function processJobAsync(jobId) {
  const job = getJob(jobId);
  if (!job) {
    console.error(`❌ Queue job ${jobId} not found`);
    return;
  }

  const mongoJobId = job.data.mongoJobId;

  try {
    console.log(`⚙️  Processing queue job ${jobId}...`);
    await updateJob(jobId, { status: 'processing', progress: 25 });

    // Update MongoDB job status
    if (mongoJobId) {
      await AIJob.findByIdAndUpdate(mongoJobId, {
        status: 'processing',
        updatedAt: new Date()
      });
    }

    // Call AI orchestrator to process the job
    const result = await processJob(job);

    // Store result in memory
    jobResults.set(jobId, result);
    
    // Update MongoDB with result
    if (mongoJobId) {
      await AIJob.findByIdAndUpdate(mongoJobId, {
        status: 'completed',
        output: result,
        updatedAt: new Date()
      });
      console.log(`💾 MongoDB job ${mongoJobId} completed with results`);
    }
    
    await updateJob(jobId, {
      status: 'completed',
      progress: 100,
      completedAt: new Date().toISOString()
    });

    console.log(`✅ Queue job ${jobId} completed successfully`);
  } catch (error) {
    console.error(`❌ Queue job ${jobId} failed:`, error.message);
    
    await updateJob(jobId, {
      status: 'failed',
      error: error.message,
      failedAt: new Date().toISOString()
    });

    // Update MongoDB with error
    if (mongoJobId) {
      await AIJob.findByIdAndUpdate(mongoJobId, {
        status: 'failed',
        error: error.message,
        updatedAt: new Date()
      });
    }
  }
}

/**
 * Get all jobs (for debugging)
 * @returns {Array} All jobs
 */
function getAllJobs() {
  return Array.from(jobs.values());
}

/**
 * Clear all jobs (for testing)
 */
function clearAllJobs() {
  jobs.clear();
  jobResults.clear();
  jobIdCounter = 1;
  console.log('🗑️  All queue jobs cleared');
}

module.exports = {
  createJob,
  getJob,
  getJobResult,
  updateJob,
  getAllJobs,
  clearAllJobs
};
