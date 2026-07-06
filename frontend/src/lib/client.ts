import { api } from './api';
import { mockApi } from './mockApi';
import type { ScheduleEmailInput } from '../types';

// In the sandbox the backend may not be running. We try the real API first
// and transparently fall back to the in-memory mock so the UI still works.
async function withFallback<T>(real: () => Promise<T>, mock: () => Promise<T>): Promise<T> {
  try {
    return await real();
  } catch (err) {
    if (err instanceof TypeError) {
      // network error — backend unreachable
      return mock();
    }
    throw err;
  }
}

export const client = {
  login: (credential: string) => withFallback(() => api.login(credential), () => mockApi.login(credential)),
  me: () => withFallback(() => api.me(), () => mockApi.me()),
  scheduleEmail: (input: ScheduleEmailInput) =>
    withFallback(() => api.scheduleEmail(input), () => mockApi.scheduleEmail(input)),
  listEmails: () => withFallback(() => api.listEmails(), () => mockApi.listEmails()),
  deleteEmail: (id: string) => withFallback(() => api.deleteEmail(id), () => mockApi.deleteEmail(id)),
  listHistory: () => withFallback(() => api.listHistory(), () => mockApi.listHistory()),
  clearHistory: () => withFallback(() => api.clearHistory(), () => mockApi.clearHistory()),
};
