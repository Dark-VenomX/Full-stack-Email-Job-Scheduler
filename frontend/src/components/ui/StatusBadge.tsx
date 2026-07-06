import type { EmailStatus } from '../../types';

const styles: Record<EmailStatus, { label: string; className: string }> = {
  PENDING: {
    label: 'Pending',
    className: 'bg-warning-500/15 text-warning-600 dark:text-warning-400 border-warning-500/30',
  },
  PROCESSING: {
    label: 'Processing',
    className: 'bg-primary-500/15 text-primary-600 dark:text-primary-300 border-primary-500/30',
  },
  SENT: {
    label: 'Sent',
    className: 'bg-success-500/15 text-success-600 dark:text-success-400 border-success-500/30',
  },
  FAILED: {
    label: 'Failed',
    className: 'bg-error-500/15 text-error-600 dark:text-error-400 border-error-500/30',
  },
};

export function StatusBadge({ status }: { status: EmailStatus }) {
  const s = styles[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${s.className}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {s.label}
    </span>
  );
}
