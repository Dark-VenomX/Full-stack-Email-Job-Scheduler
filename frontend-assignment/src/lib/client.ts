import { api } from "./api";

export const client = {
  login: api.login,
  me: api.me,
  scheduleEmail: api.scheduleEmail,
  listEmails: api.listEmails,
  getEmail: api.getEmail,
  deleteEmail: api.deleteEmail,
  listHistory: api.listHistory,
  clearHistory: api.clearHistory,
};
