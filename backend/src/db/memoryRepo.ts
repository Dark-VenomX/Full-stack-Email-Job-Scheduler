import { randomUUID } from 'crypto';
import type { ScheduledEmail, ScheduleEmailInput, EmailStatus } from '../types';

type Row = ScheduledEmail;

const store = new Map<string, Row>();
const sentStore: { id: string; emailId: string; userId: string; recipient: string; subject: string; sentAt: string; status: 'SENT' | 'FAILED'; error: string | null }[] = [];

const clone = (r: Row): Row => ({ ...r, recipients: [...r.recipients] });

export const memoryRepo = {
  async create(input: ScheduleEmailInput, userId: string): Promise<ScheduledEmail> {
    const now = new Date().toISOString();
    const row: Row = {
      id: randomUUID(),
      userId,
      subject: input.subject,
      body: input.body,
      recipients: [...input.recipients],
      startTime: input.startTime,
      delaySeconds: input.delaySeconds,
      hourlyLimit: input.hourlyLimit,
      status: 'PENDING',
      sentCount: 0,
      failCount: 0,
      errorMessage: null,
      createdAt: now,
      updatedAt: now,
    };
    store.set(row.id, row);
    return clone(row);
  },

  async findAll(userId: string): Promise<ScheduledEmail[]> {
    return Array.from(store.values())
      .filter((r) => r.userId === userId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .map(clone);
  },

  async findAllPending(): Promise<ScheduledEmail[]> {
    return Array.from(store.values())
      .filter((r) => r.status === 'PENDING')
      .map(clone);
  },

  async findById(id: string): Promise<ScheduledEmail | null> {
    const row = store.get(id);
    return row ? clone(row) : null;
  },

  async updateStatus(id: string, status: EmailStatus, errorMessage?: string): Promise<void> {
    const row = store.get(id);
    if (!row) return;
    row.status = status;
    row.errorMessage = errorMessage ?? null;
    row.updatedAt = new Date().toISOString();
  },

  async incrementSent(id: string, count: number): Promise<void> {
    const row = store.get(id);
    if (!row) return;
    row.sentCount += count;
    row.status = 'SENT';
    row.updatedAt = new Date().toISOString();
  },

  async incrementFailed(id: string, count: number, error: string): Promise<void> {
    const row = store.get(id);
    if (!row) return;
    row.failCount += count;
    row.errorMessage = error;
    row.status = 'FAILED';
    row.updatedAt = new Date().toISOString();
  },

  async logSentRecord(emailId: string, userId: string, recipient: string, subject: string, status: 'SENT' | 'FAILED', error?: string): Promise<void> {
    sentStore.push({
      id: randomUUID(),
      emailId,
      userId,
      recipient,
      subject,
      sentAt: new Date().toISOString(),
      status,
      error: error ?? null,
    });
  },

  async findSentHistory(userId: string): Promise<typeof sentStore> {
    return sentStore
      .filter((r) => r.userId === userId)
      .sort((a, b) => b.sentAt.localeCompare(a.sentAt));
  },

  async deleteEmail(id: string, userId: string): Promise<boolean> {
    const row = store.get(id);
    if (!row || row.userId !== userId) return false;
    store.delete(id);
    return true;
  },

  async clearSentHistory(userId: string): Promise<void> {
    const indices = sentStore
      .map((r, index) => (r.userId === userId ? index : -1))
      .filter((index) => index !== -1)
      .reverse();
    indices.forEach((index) => sentStore.splice(index, 1));
  },
};
