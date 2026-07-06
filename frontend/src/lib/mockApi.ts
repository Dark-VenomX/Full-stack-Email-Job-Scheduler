import type { ScheduledEmail, ScheduleEmailInput, SentRecord, AuthUser } from '../types';

// Frontend-only mock used when the backend is unreachable in the sandbox.
// It mirrors the API surface so the UI previews end-to-end without a server.

const mockUser: AuthUser = {
  id: 'u_mock_001',
  name: 'Alex Morgan',
  email: 'alex.morgan@reachinbox.app',
  avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=128&h=128&fit=crop&crop=faces',
  provider: 'google',
};

const emails = new Map<string, ScheduledEmail>();
const sentLog: SentRecord[] = [];

function uid() {
  return `mock_${Math.random().toString(36).slice(2, 10)}`;
}

function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

export const mockApi = {
  login: async (_credential: string) => {
    await delay(500);
    return {
      user: mockUser,
      token: 'mock-jwt-' + mockUser.id,
    };
  },

  async me() {
    await delay(150);
    return { user: mockUser };
  },

  async scheduleEmail(input: ScheduleEmailInput): Promise<ScheduledEmail> {
    await delay(500);
    const now = new Date().toISOString();
    const email: ScheduledEmail = {
      id: uid(),
      subject: input.subject,
      body: input.body,
      recipients: input.recipients,
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
    emails.set(email.id, email);

    // Simulate the worker lifecycle.
    setTimeout(() => {
      email.status = 'PROCESSING';
      email.updatedAt = new Date().toISOString();
    }, input.delaySeconds * 1000 || 1500);

    setTimeout(() => {
      email.status = 'SENT';
      email.sentCount = input.recipients.length;
      email.updatedAt = new Date().toISOString();
      input.recipients.forEach((recipient) => {
        sentLog.push({
          id: uid(),
          emailId: email.id,
          recipient,
          subject: email.subject,
          sentAt: new Date().toISOString(),
          status: 'SENT',
        });
      });
    }, (input.delaySeconds * 1000 || 1500) + 2000);

    return email;
  },

  async listEmails(): Promise<ScheduledEmail[]> {
    await delay(200);
    return Array.from(emails.values()).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },

  async listHistory(): Promise<SentRecord[]> {
    await delay(200);
    return [...sentLog].sort((a, b) => b.sentAt.localeCompare(a.sentAt));
  },

  deleteEmail: (id: string) => {
    return delay(100).then(() => {
      emails.delete(id);
      return { success: true };
    });
  },

  clearHistory: () => {
    return delay(100).then(() => {
      sentLog.length = 0;
      return { success: true };
    });
  },
};
