export type EmailStatus = "PENDING" | "PROCESSING" | "SENT" | "FAILED";

export interface Attachment {
  name: string;
  type: string;
  size: number;
  content: string;
}

export interface ScheduledEmail {
  id: string;
  userId: string;
  subject: string;
  body: string;
  recipients: string[];
  attachments: Attachment[];
  startTime: string;
  delaySeconds: number;
  hourlyLimit: number;
  status: EmailStatus;
  sentCount: number;
  failCount: number;
  errorMessage: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ScheduleEmailInput {
  subject: string;
  body: string;
  recipients: string[];
  attachments?: Attachment[];
  startTime: string;
  delaySeconds: number;
  hourlyLimit: number;
}

export interface SentRecord {
  id: string;
  emailId: string;
  recipient: string;
  subject: string;
  sentAt: string;
  status: "SENT" | "FAILED";
  error?: string | null;
}
