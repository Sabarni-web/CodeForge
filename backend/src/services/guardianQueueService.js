/**
 * guardianQueueService.js
 * In-memory job queue for processing background Guardian tasks
 * (DNA Generation, Analytics updates, etc.) without blocking the event loop.
 */
import { generateRepositoryDNA } from './dnaService.js';
import { generateRepositoryCertificate } from './certificateService.js';
import { updateGlobalAnalytics } from './guardianAnalyticsService.js';
import { getIo } from './socketService.js';

class GuardianQueue {
  constructor() {
    this.queue = [];
    this.isProcessing = false;
    this.retryLimit = 3;
  }

  /**
   * Add a job to the queue
   * @param {Object} job - { type: 'DNA_GENERATION' | 'ANALYTICS_UPDATE', payload: {} }
   */
  addJob(job) {
    this.queue.push({ ...job, retries: 0 });
    this.processNext();
  }

  async processNext() {
    if (this.isProcessing || this.queue.length === 0) return;
    
    this.isProcessing = true;
    const job = this.queue.shift();

    try {
      if (job.type === 'DNA_GENERATION') {
        const { repositoryId, userId } = job.payload;
        await generateRepositoryDNA(repositoryId, userId);
        
        const io = getIo();
        if (io) io.to(userId.toString()).emit('DNAUpdated', { repositoryId });

      } else if (job.type === 'CERTIFICATE_UPDATE') {
        const { repositoryId, userId } = job.payload;
        await generateRepositoryCertificate(repositoryId, userId);
        
        const io = getIo();
        if (io) io.to(userId.toString()).emit('CertificateGenerated', { repositoryId });

      } else if (job.type === 'ANALYTICS_UPDATE') {
        await updateGlobalAnalytics();
        const io = getIo();
        if (io) io.emit('GuardianDashboardUpdated', {}); // Broadcast to all
      }
      // Add other job types as needed
    } catch (error) {
      console.error(`Guardian Job Failed (${job.type}):`, error.message);
      if (job.retries < this.retryLimit) {
        job.retries++;
        this.queue.push(job); // push back to the end of the queue
      }
    } finally {
      this.isProcessing = false;
      
      // Let the event loop breathe before processing the next job
      setImmediate(() => this.processNext());
    }
  }
}

export const guardianQueue = new GuardianQueue();
