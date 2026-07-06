import { Queue, QueueEvents } from "bullmq";
import IORedis from "ioredis";
import { config } from "../config/env";

export const EMAIL_QUEUE =
  config.nodeEnv === "production" ? "email-sending-prod" : "email-sending-dev";

let connection: IORedis | null = null;

export function getConnection(): IORedis {
  if (!connection) {
    const isTLS = config.redisUrl.startsWith("rediss://");
    connection = new IORedis(config.redisUrl, {
      maxRetriesPerRequest: null,
      tls: isTLS ? { rejectUnauthorized: false } : undefined,
    });
  }
  return connection;
}

export const emailQueue = new Queue(EMAIL_QUEUE, {
  connection: getConnection() as never,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: "exponential", delay: 5000 },
  },
});

export const queueEvents = new QueueEvents(EMAIL_QUEUE, {
  connection: getConnection() as never,
});

export async function addEmailJob(
  jobId: string,
  payload: Record<string, unknown>,
  delaySeconds: number = 0,
) {
  await emailQueue.add("send-email", payload, {
    jobId,
    delay: delaySeconds * 1000,
  });
}

export async function removeEmailJob(jobId: string) {
  const job = await emailQueue.getJob(jobId);
  if (job) {
    await job.remove();
  }
}
