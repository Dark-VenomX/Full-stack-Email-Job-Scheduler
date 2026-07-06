import { randomUUID } from 'crypto';

// In-memory queue shim used when no Redis is reachable. It mimics the
// BullMQ surface the rest of the app depends on: enqueue + delayed dispatch.
type Job = {
  id: string;
  payload: Record<string, unknown>;
  delayMs: number;
};

const jobs: Job[] = [];
const listeners: Array<(job: Job) => void> = [];

export function enqueue(payload: Record<string, unknown>, delaySeconds = 0): string {
  const job: Job = { id: randomUUID(), payload, delayMs: delaySeconds * 1000 };
  jobs.push(job);
  setTimeout(() => {
    listeners.forEach((fn) => fn(job));
  }, Math.min(job.delayMs, 1500)); // sandbox: accelerate for preview
  return job.id;
}

export function onJob(fn: (job: Job) => void) {
  listeners.push(fn);
}

export function pendingCount(): number {
  return jobs.length;
}
