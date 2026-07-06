import { StatusBadge } from '../ui/StatusBadge';
import { EmptyState } from '../ui/EmptyState';
import { ProgressBar } from '../ui/ProgressBar';
import { TableSkeleton } from '../ui/Skeleton';
import { ListChecks, ChevronRight } from 'lucide-react';
import type { ScheduledEmail } from '../../types';

interface Props {
  emails: ScheduledEmail[];
  loading: boolean;
  onSelect: (email: ScheduledEmail) => void;
  onDelete?: (email: ScheduledEmail) => void;
}

export function QueueTab({ emails, loading, onSelect, onDelete }: Props) {
  if (loading) {
    return (
      <div className="glass-card">
        <TableSkeleton rows={5} cols={6} />
      </div>
    );
  }

  if (emails.length === 0) {
    return (
      <EmptyState
        icon={<ListChecks size={24} />}
        title="Queue is empty"
        description="Scheduled campaigns will appear here with their delivery status."
      />
    );
  }

  return (
    <div className="glass-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-black/10 text-xs uppercase tracking-wide text-slate-500 dark:border-white/10 dark:text-slate-400">
            <tr>
              <th className="px-5 py-3 font-medium">Subject</th>
              <th className="px-5 py-3 font-medium">Recipients</th>
              <th className="px-5 py-3 font-medium">Start Time</th>
              <th className="px-5 py-3 font-medium">Delay</th>
              <th className="px-5 py-3 font-medium">Limit/hr</th>
              <th className="px-5 py-3 font-medium">Progress</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-black/5 dark:divide-white/5">
            {emails.map((e, i) => (
              <tr
                key={e.id}
                onClick={() => onSelect(e)}
                className="group cursor-pointer transition hover:bg-black/5 dark:hover:bg-white/5 animate-stagger"
                style={{ animationDelay: `${i * 40}ms` }}
              >
                <td className="px-5 py-3.5">
                  <p className="font-medium text-slate-700 dark:text-slate-100">{e.subject}</p>
                  <p className="mt-0.5 text-xs text-slate-400 dark:text-slate-500">
                    {e.sentCount} sent · {e.failCount} failed
                  </p>
                </td>
                <td className="px-5 py-3.5 text-slate-600 dark:text-slate-300">{e.recipients.length}</td>
                <td className="px-5 py-3.5 text-slate-600 dark:text-slate-300">
                  {new Date(e.startTime).toLocaleString()}
                </td>
                <td className="px-5 py-3.5 text-slate-600 dark:text-slate-300">{e.delaySeconds}s</td>
                <td className="px-5 py-3.5 text-slate-600 dark:text-slate-300">{e.hourlyLimit}</td>
                <td className="px-5 py-3.5 min-w-[120px]">
                  <ProgressBar
                    sent={e.sentCount}
                    total={e.recipients.length}
                    failed={e.failCount}
                  />
                </td>
                <td className="px-5 py-3.5">
                  <StatusBadge status={e.status} />
                </td>
                <td className="px-3 py-3.5 flex items-center justify-end gap-2">
                  <button
                    onClick={(ev) => {
                      ev.stopPropagation();
                      onDelete?.(e);
                    }}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-error-50 hover:text-error-500 transition-colors dark:text-slate-500 dark:hover:bg-error-500/10 dark:hover:text-error-400"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                  </button>
                  <ChevronRight
                    size={16}
                    className="text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-primary-500 dark:text-slate-600"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
