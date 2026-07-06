import { Router } from "express";
import { z } from "zod";
import { repo } from "../db/repo";
import { scheduleEmailJob } from "../queue/queueService";

const emailSchema = z.string().email();

const scheduleSchema = z.object({
  subject: z.string().min(1).max(200),
  body: z.string().min(1),
  recipients: z.array(z.string()).min(1),
  startTime: z.string().refine((v) => !Number.isNaN(Date.parse(v)), {
    message: "Invalid startTime",
  }),
  delaySeconds: z.number().int().min(0).max(86400),
  hourlyLimit: z.number().int().min(1).max(1000),
  attachments: z
    .array(
      z.object({
        name: z.string(),
        type: z.string(),
        size: z.number(),
        content: z.string(),
      }),
    )
    .optional(),
});

import { authMiddleware, type AuthRequest } from "../middleware/auth";

const router = Router();

router.post("/", authMiddleware, async (req: AuthRequest, res) => {
  const parsed = scheduleSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten().fieldErrors });
  }

  const invalid = parsed.data.recipients.filter(
    (r) => !emailSchema.safeParse(r).success,
  );
  if (invalid.length) {
    return res
      .status(400)
      .json({ error: "Invalid recipient addresses", invalid });
  }

  const userId = req.user!.id;
  const email = await repo.create(parsed.data, userId);

  await scheduleEmailJob({
    emailId: email.id,
    userId,
    subject: email.subject,
    body: email.body,
    recipients: email.recipients,
    delaySeconds: email.delaySeconds,
    hourlyLimit: email.hourlyLimit,
    attachments: email.attachments,
  });

  res.status(201).json(email);
});

export default router;
