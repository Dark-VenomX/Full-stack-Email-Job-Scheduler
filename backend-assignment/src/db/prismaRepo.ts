import { PrismaClient } from "@prisma/client";
import type { ScheduledEmail, ScheduleEmailInput, EmailStatus } from "../types";

const prisma = new PrismaClient();

const toModel = (
  row: Awaited<ReturnType<typeof prisma.scheduledEmail.findMany>>[number],
): ScheduledEmail => ({
  id: row.id,
  userId: row.userId,
  subject: row.subject,
  body: row.body,
  recipients: row.recipients,
  attachments: (row.attachments as any) || [],
  startTime: row.startTime.toISOString(),
  delaySeconds: row.delaySeconds,
  hourlyLimit: row.hourlyLimit,
  status: row.status as EmailStatus,
  sentCount: row.sentCount,
  failCount: row.failCount,
  errorMessage: row.errorMessage,
  createdAt: row.createdAt.toISOString(),
  updatedAt: row.updatedAt.toISOString(),
});

export const prismaRepo = {
  async create(
    input: ScheduleEmailInput,
    userId: string,
  ): Promise<ScheduledEmail> {
    const row = await prisma.scheduledEmail.create({
      data: {
        userId,
        subject: input.subject,
        body: input.body,
        recipients: input.recipients,
        attachments: input.attachments || [],
        startTime: new Date(input.startTime),
        delaySeconds: input.delaySeconds,
        hourlyLimit: input.hourlyLimit,
        status: "PENDING",
      },
    });
    return toModel(row);
  },

  async findAll(userId: string): Promise<ScheduledEmail[]> {
    const rows = await prisma.scheduledEmail.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
    return rows.map(toModel);
  },

  async findAllPending(): Promise<ScheduledEmail[]> {
    const rows = await prisma.scheduledEmail.findMany({
      where: { status: "PENDING" },
      orderBy: { createdAt: "desc" },
    });
    return rows.map(toModel);
  },

  async findById(id: string): Promise<ScheduledEmail | null> {
    const row = await prisma.scheduledEmail.findUnique({ where: { id } });
    return row ? toModel(row) : null;
  },

  async updateStatus(
    id: string,
    status: EmailStatus,
    errorMessage?: string,
  ): Promise<void> {
    await prisma.scheduledEmail.update({
      where: { id },
      data: { status, errorMessage: errorMessage ?? null },
    });
  },

  async incrementSent(id: string, count: number): Promise<void> {
    await prisma.scheduledEmail.update({
      where: { id },
      data: { sentCount: { increment: count }, status: "SENT" },
    });
  },

  async incrementFailed(
    id: string,
    count: number,
    error: string,
  ): Promise<void> {
    await prisma.scheduledEmail.update({
      where: { id },
      data: {
        failCount: { increment: count },
        errorMessage: error,
        status: "FAILED",
      },
    });
  },

  async logSentRecord(
    emailId: string,
    userId: string,
    recipient: string,
    subject: string,
    status: "SENT" | "FAILED",
    error?: string,
  ): Promise<void> {
    await prisma.sentRecord.create({
      data: {
        emailId,
        userId,
        recipient,
        subject,
        status,
        error: error ?? null,
      },
    });
  },

  async hasBeenSent(emailId: string, recipient: string): Promise<boolean> {
    const record = await prisma.sentRecord.findFirst({
      where: { emailId, recipient, status: "SENT" },
    });
    return !!record;
  },

  async findSentHistory(userId: string): Promise<any[]> {
    const rows = await prisma.sentRecord.findMany({
      where: { userId },
      orderBy: { sentAt: "desc" },
      include: { scheduledEmail: true },
    });
    return rows.map((r) => ({
      id: r.id,
      emailId: r.emailId,
      recipient: r.recipient,
      subject: r.subject,
      body: r.scheduledEmail?.body,
      sentAt: r.sentAt.toISOString(),
      status: r.status as "SENT" | "FAILED",
      error: r.error,
    }));
  },

  async deleteEmail(id: string, userId: string): Promise<boolean> {
    const row = await prisma.scheduledEmail.findUnique({ where: { id } });
    if (!row || row.userId !== userId) return false;
    await prisma.scheduledEmail.delete({ where: { id } });
    return true;
  },

  async clearSentHistory(userId: string): Promise<void> {
    await prisma.sentRecord.deleteMany({ where: { userId } });
  },
};
