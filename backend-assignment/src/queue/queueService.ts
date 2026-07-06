import { Worker, Job, DelayedError } from "bullmq";
import { config } from "../config/env";
import { EMAIL_QUEUE, addEmailJob, getConnection } from "./bullQueue";
import { sendMail } from "../services/mailer";
import { repo } from "../db/repo";

export interface EmailJobPayload {
  emailId: string;
  userId: string;
  subject: string;
  body: string;
  recipients: string[];
  delaySeconds: number;
  hourlyLimit: number;
  attachments?: any[];
}

export async function scheduleEmailJob(
  payload: EmailJobPayload,
): Promise<string> {
  await addEmailJob(
    payload.emailId,
    payload as unknown as Record<string, unknown>,
    payload.delaySeconds,
  );
  return payload.emailId;
}

export async function cancelEmailJob(emailId: string): Promise<void> {
  const { removeEmailJob } = await import("./bullQueue.js");
  await removeEmailJob(emailId);
}

async function processEmailJob(payload: EmailJobPayload, job?: Job) {
  await repo.updateStatus(payload.emailId, "PROCESSING");

  if (job) {
    const redis = getConnection();
    const sender = config.smtp.user || "ethereal_test";
    const rateLimitKey = `rate_limit:${sender}`;
    const currentCount = await redis.get(rateLimitKey);
    const count = currentCount ? parseInt(currentCount, 10) : 0;

    if (count + payload.recipients.length > payload.hourlyLimit) {
      const ttl = await redis.pttl(rateLimitKey);
      const delayMs = ttl > 0 ? ttl : 3600000;
      console.log(
        `[RateLimit] Limit reached for ${sender}. Delaying job ${job.id} for ${delayMs}ms`,
      );
      await job.moveToDelayed(Date.now() + delayMs, job.token!);
      throw new DelayedError();
    }

    await redis.incrby(rateLimitKey, payload.recipients.length);
    if (count === 0) {
      await redis.expire(rateLimitKey, 3600);
    }
  }

  try {
    let sent = 0;
    let failed = 0;
    let lastError = "";
    for (const recipient of payload.recipients) {
      const alreadySent = await repo.hasBeenSent(payload.emailId, recipient);
      if (alreadySent) {
        console.log(
          `[Idempotency] Skipping recipient ${recipient} for email ${payload.emailId} as it was already sent.`,
        );
        sent++;
        continue;
      }

      const ok = await sendMail({
        to: recipient,
        subject: payload.subject,
        html: payload.body,
        attachments: payload.attachments,
      });
      if (ok) {
        sent++;
        await repo.logSentRecord(
          payload.emailId,
          payload.userId,
          recipient,
          payload.subject,
          "SENT",
        );
      } else {
        failed++;
        lastError = "SMTP delivery failed";
        await repo.logSentRecord(
          payload.emailId,
          payload.userId,
          recipient,
          payload.subject,
          "FAILED",
          lastError,
        );
      }

      if (payload.recipients.length > 1) {
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }
    }
    if (failed === 0) {
      await repo.incrementSent(payload.emailId, sent);
    } else {
      await repo.incrementFailed(payload.emailId, failed, lastError);
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    await repo.updateStatus(payload.emailId, "FAILED", message);
  }
}

export function startWorker() {
  const worker = new Worker(
    EMAIL_QUEUE,
    async (job) => {
      const payload = job.data as EmailJobPayload;
      await processEmailJob(payload, job);
    },
    {
      connection: getConnection() as never,
      concurrency: config.workerConcurrency,
    },
  );

  worker.on("failed", (job, err) => {
    console.error(`Job ${job?.id} failed with error: ${err.message}`);
  });
}
