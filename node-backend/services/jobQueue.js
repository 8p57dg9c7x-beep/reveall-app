/**
 * Reveal Job Queue
 * In-Memory Job Queue with MongoDB persistence
 * Simulates Bull/Redis queue for local development
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
  
  // Persist to MongoDB
  try {
    const dbJob = new AIJob({
      type: data.type || 'upload',
      status: 'pending',
      input: {
        jobId,
        ...data
      },
      output: {}
    });
    await dbJob.save();
    job.mongoId = dbJob._id.toString();
    console.log(`💾 Job ${jobId} persisted to MongoDB (${job.mongoId})`);
  } catch (err) {
    console.warn(`⚠️ MongoDB persistence failed for ${jobId}:`, err.message);
    // Continue anyway - in-memory queue will handle it
  }
  
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
async function updateJob(jobId, updates) {
  const job = jobs.get(jobId);
  if (job) {
    Object.assign(job, updates, {
      updatedAt: new Date().toISOString()
    });
    jobs.set(jobId, job);
    
    // Update MongoDB if we have a mongoId
    if (job.mongoId) {
      try {
        const dbStatus = updates.status === 'completed' ? 'completed' 
          : updates.status === 'failed' ? 'failed' 
          : updates.status === 'processing' ? 'processing' 
          : 'pending';
        
        await AIJob.findByIdAndUpdate(job.mongoId, {
          status: dbStatus,
          ...(updates.error && { error: updates.error }),
          updatedAt: new Date()
        });
      } catch (err) {
        console.warn(`⚠️ MongoDB update failed for ${jobId}`);
      }
    }
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
    await updateJob(jobId, { status: 'processing', progress: 25 });

    // Call AI orchestrator to process the job
    const result = await processJob(job);

    // Store result in memory
    jobResults.set(jobId, result);
    
    // Update MongoDB with result
    if (job.mongoId) {
      try {
        await AIJob.findByIdAndUpdate(job.mongoId, {
          status: 'completed',
          output: result,
          updatedAt: new Date()
        });
        console.log(`💾 Job ${jobId} result persisted to MongoDB`);
      } catch (err) {
        console.warn(`⚠️ MongoDB result save failed for ${jobId}`);
      }
    }
    
    await updateJob(jobId, {
      status: 'completed',
      progress: 100,
      completedAt: new Date().toISOString()
    });

    console.log(`✅ Job ${jobId} completed successfully`);
  } catch (error) {
    console.error(`❌ Job ${jobId} failed:`, error.message);
    
    await updateJob(jobId, {
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
