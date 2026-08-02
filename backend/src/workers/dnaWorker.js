import { processFileDNA, processRepositoryDNA } from '../services/dnaService.js';
import File from '../models/File.js';

// Simple in-memory queue to process DNA asynchronously
const taskQueue = [];
let isProcessing = false;

const processNext = async () => {
  if (taskQueue.length === 0) {
    isProcessing = false;
    return;
  }

  isProcessing = true;
  const task = taskQueue.shift();

  try {
    if (task.type === 'FILE') {
      const file = await File.findById(task.fileId);
      if (file) {
        await processFileDNA(file);
        
        if (task.triggerRepoUpdate && task.repoId) {
          // Add repo processing to queue
          taskQueue.push({ type: 'REPO', repoId: task.repoId });
        }
      }
    } else if (task.type === 'REPO') {
      await processRepositoryDNA(task.repoId);
    } else if (task.type === 'FULL_REPO') {
      // Process all files then repo
      const files = await File.find({ repository: task.repoId });
      for (const file of files) {
        await processFileDNA(file);
      }
      await processRepositoryDNA(task.repoId);
    }
  } catch (error) {
    console.error(`[DNA Worker] Error processing task ${task.type}:`, error);
    task.retries = (task.retries || 0) + 1;
    if (task.retries < 3) {
      console.log(`[DNA Worker] Retrying task ${task.type} (Attempt ${task.retries})`);
      taskQueue.push(task);
    } else {
      console.error(`[DNA Worker] Task ${task.type} failed after 3 attempts.`);
    }
  }

  // Process next tick to yield event loop
  setTimeout(processNext, 0);
};

export const queueFileDNA = (fileId, triggerRepoUpdate = true, repoId = null) => {
  taskQueue.push({ type: 'FILE', fileId, triggerRepoUpdate, repoId });
  if (!isProcessing) processNext();
};

export const queueRepositoryDNA = (repoId) => {
  taskQueue.push({ type: 'REPO', repoId });
  if (!isProcessing) processNext();
};

export const queueFullRepositoryDNA = (repoId) => {
  taskQueue.push({ type: 'FULL_REPO', repoId });
  if (!isProcessing) processNext();
};
