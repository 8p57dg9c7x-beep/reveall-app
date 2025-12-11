/**
 * In-Memory Job Queue
 * Simulates Bull/Redis queue for local development
 */

const { processJob } = require('./aiOrchestrator');

// In-memory job storage
const jobs = new Map();
const jobResults = new Map();

let jobIdCounter = 1;

/**
 * Create a new job
 * @param {Object} data - Job data
 * @returns {Object} Created job
 */
async function createJob(data) {
  const jobId = `job_${Date.now()}_${jobIdCounter++}`;
  
  const job = {
    id: jobId,
    data,
    status: 'queued',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    progress: 0
  };

  jobs.set(jobId, job);
  
  console.log(`📦 Job ${jobId} created and queued`);
  
  // Process job asynchronously (simulate queue processing)
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
function updateJob(jobId, updates) {
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
  try {
    const job = getJob(jobId);
    if (!job) {
      console.error(`❌ Job ${jobId} not found`);
      return;
    }

    console.log(`⚙️  Processing job ${jobId}...`);
    updateJob(jobId, { status: 'processing', progress: 25 });

    // Call AI orchestrator to process the job
    const result = await processJob(job);

    // Store result
    jobResults.set(jobId, result);
    
    updateJob(jobId, {
      status: 'completed',
      progress: 100,
      completedAt: new Date().toISOString()
    });

    console.log(`✅ Job ${jobId} completed successfully`);
  } catch (error) {
    console.error(`❌ Job ${jobId} failed:`, error.message);
    
    updateJob(jobId, {
      status: 'failed',
      error: error.message,
      failedAt: new Date().toISOString()
    });
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
  console.log('🗑️  All jobs cleared');
}

module.exports = {
  createJob,
  getJob,
  getJobResult,
  updateJob,
  getAllJobs,
  clearAllJobs
};
