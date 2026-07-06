import type {
  ScheduledEmail,
  ScheduleEmailInput,
  SentRecord,
  AuthUser,
} from "../types";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const activeId = localStorage.getItem("reachinbox.activeId");
  const token = activeId
    ? localStorage.getItem(`reachinbox.token.${activeId}`)
    : null;

  const res = await fetch(`${API_BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...options,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed: ${res.status}`);
  }
  return res.json();
}

export const api = {
  login: (credential: string) =>
    request<{ user: AuthUser; token: string }>("/auth/google", {
      method: "POST",
      body: JSON.stringify({ credential }),
    }),
  me: () => request<{ user: AuthUser }>("/auth/me"),
  scheduleEmail: (input: ScheduleEmailInput) =>
    request<ScheduledEmail>("/schedule-email", {
      method: "POST",
      body: JSON.stringify(input),
    }),
  listEmails: () => request<ScheduledEmail[]>("/emails"),
  getEmail: (id: string) => request<ScheduledEmail>(`/emails/${id}`),
  deleteEmail: (id: string) =>
    request<{ success: boolean }>(`/emails/${id}`, { method: "DELETE" }),
  listHistory: () => request<SentRecord[]>("/history"),
  clearHistory: () =>
    request<{ success: boolean }>("/history", { method: "DELETE" }),
};
