import { useMocks } from '../config/env';
import { prismaRepo } from './prismaRepo';
import { memoryRepo } from './memoryRepo';
import type { ScheduledEmail, ScheduleEmailInput, EmailStatus } from '../types';

interface Repo {
  create(input: ScheduleEmailInput, userId: string): Promise<ScheduledEmail>;
  findAll(userId: string): Promise<ScheduledEmail[]>;
  findAllPending(): Promise<ScheduledEmail[]>;
  findById(id: string): Promise<ScheduledEmail | null>;
  updateStatus(id: string, status: EmailStatus, errorMessage?: string): Promise<void>;
  incrementSent(id: string, count: number): Promise<void>;
  incrementFailed(id: string, count: number, error: string): Promise<void>;
  logSentRecord(emailId: string, userId: string, recipient: string, subject: string, status: 'SENT' | 'FAILED', error?: string): Promise<void>;
  findSentHistory(userId: string): Promise<any[]>;
  deleteEmail(id: string, userId: string): Promise<boolean>;
  clearSentHistory(userId: string): Promise<void>;
}

export const repo: Repo = useMocks ? memoryRepo : prismaRepo;

export type SentLog = {
  id: string;
  emailId: string;
  recipient: string;
  subject: string;
  sentAt: string;
  status: 'SENT' | 'FAILED';
  error: string | null;
};


