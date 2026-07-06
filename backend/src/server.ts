import app from './app';
import { config, useMocks } from './config/env';
import { startWorker, scheduleEmailJob } from './queue/queueService';
import { prismaRepo } from './db/prismaRepo';
import { emailQueue } from './queue/bullQueue';

async function syncPendingJobs() {
  if (useMocks) return;
  console.log('[Startup] Re-syncing pending jobs...');
  try {
    const pendingJobs = await prismaRepo.findAllPending();
    
    // Get currently queued jobs to avoid duplicates
    const queuedBullJobs = await emailQueue.getJobs(['delayed', 'waiting', 'active']);
    const queuedJobIds = new Set(queuedBullJobs.map(j => j.opts.jobId));

    for (const job of pendingJobs) {
      if (!queuedJobIds.has(job.id)) {
        console.log(`[Startup] Re-queueing missed job: ${job.id}`);
        // If the start time is in the past, it will run immediately (delay 0)
        const now = Date.now();
        const startTime = new Date(job.startTime).getTime();
        const delaySeconds = Math.max(0, Math.floor((startTime - now) / 1000));
        
        await scheduleEmailJob({
          emailId: job.id,
          userId: job.userId,
          subject: job.subject,
          body: job.body,
          recipients: job.recipients,
          delaySeconds: delaySeconds,
          hourlyLimit: job.hourlyLimit,
        });
      }
    }
    console.log('[Startup] Sync complete.');
  } catch (error) {
    console.error('[Startup] Failed to sync jobs:', error);
  }
}

async function startServer() {
  startWorker();
  await syncPendingJobs();
  app.listen(config.port, () => {
    console.log(`ReachInbox API listening on :${config.port}`);
  });
}

startServer();
