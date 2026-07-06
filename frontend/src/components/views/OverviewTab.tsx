import { useEffect, useState } from 'react';
import { client } from '../../lib/client';
import { StatusBadge } from '../ui/StatusBadge';
import { EmptyState } from '../ui/EmptyState';
import { ProgressBar } from '../ui/ProgressBar';
import { CardSkeleton, TableSkeleton } from '../ui/Skeleton';
import { Mail, Clock, CheckCircle2, AlertTriangle, Plus, ArrowUpRight, Send } from 'lucide-react';
import type { ScheduledEmail } from '../../types';

interface Props {
  emails: ScheduledEmail[];
  loading: boolean;
  onCompose: () => void;
  onSelect: (email: ScheduledEmail) => void;
  onDelete?: (email: ScheduledEmail) => void;
}

export function OverviewTab({ emails, loading, onCompose, onSelect, onDelete }: Props) {
  const [historyCount, setHistoryCount] = useState(0);

  useEffect(() => {
    client.listHistory().then((h) => setHistoryCount(h.length)).catch(() => {});
  }, [emails]);

  const stats = {
    total: emails.length,
    pending: emails.filter((e) => e.status === 'PENDING' || e.status === 'PROCESSING').length,
    sent: emails.filter((e) => e.status === 'SENT').length,
    failed: emails.filter((e) => e.status === 'FAILED').length,
  };

  const cards = [
    {
      label: 'Total Campaigns',
      value: stats.total,
      icon: Mail,
      color: 'text-primary-600 dark:text-primary-300',
      ring: 'ring-primary-500/20',
      glow: 'from-primary-500/10',
    },
    {
      label: 'In Queue',
      value: stats.pending,
      icon: Clock,
      color: 'text-warning-500 dark:text-warning-400',
      ring: 'ring-warning-500/20',
      glow: 'from-warning-500/10',
    },
    {
      label: 'Sent',
      value: stats.sent,
      icon: CheckCircle2,
      color: 'text-success-500 dark:text-success-400',
      ring: 'ring-success-500/20',
      glow: 'from-success-500/10',
    },
    {
      label: 'Failed',
      value: stats.failed,
      icon: AlertTriangle,
      color: 'text-error-500 dark:text-error-400',
      ring: 'ring-error-500/20',
      glow: 'from-error-500/10',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)
          : cards.map((c, i) => (
              <div
                key={c.label}
                className={`glass-card group relative overflow-hidden p-5 ring-1 ${c.ring} transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl animate-stagger`}
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <div
                  className={`pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-gradient-to-br ${c.glow} to-transparent opacity-60 transition-opacity duration-300 group-hover:opacity-100`}
                />
                <div className="relative flex items-center justify-between">
                  <span className="text-sm text-slate-500 dark:text-slate-400">{c.label}</span>
                  <div className={`flex h-9 w-9 items-center justify-center rounded-xl bg-black/5 dark:bg-white/5 ${c.color}`}>
                    <c.icon size={18} />
                  </div>
                </div>
                <p className="relative mt-3 text-3xl font-bold tabular-nums text-slate-800 dark:text-slate-50">
                  {c.value}
                </p>
              </div>
            ))}
      </div>

      <div className="glass-card p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold text-slate-700 dark:text-slate-100">
            Recent Campaigns
          </h2>
          <button onClick={onCompose} className="btn-primary text-xs">
            <Plus size={14} /> New
          </button>
        </div>

        {loading ? (
          <TableSkeleton rows={4} cols={3} />
        ) : emails.length === 0 ? (
          <EmptyState
            icon={<Mail size={24} />}
            title="No campaigns yet"
            description="Schedule your first email campaign to see it appear here."
            action={
              <button onClick={onCompose} className="btn-primary">
                <Plus size={16} /> Compose Email
              </button>
            }
          />
        ) : (
          <div className="space-y-2">
            {emails.slice(0, 5).map((e, i) => (
              <button
                key={e.id}
                onClick={() => onSelect(e)}
                className="group flex w-full items-center justify-between gap-4 rounded-xl bg-black/5 px-4 py-3.5 text-left transition hover:bg-black/10 hover:shadow-md dark:bg-white/5 dark:hover:bg-white/10 animate-stagger"
                style={{ animationDelay: `${i * 50}ms` }}
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-slate-700 dark:text-slate-100">
                    {e.subject}
                  </p>
                  <div className="mt-1.5 flex items-center gap-3">
                    <span className="text-xs text-slate-400 dark:text-slate-500">
                      {e.recipients.length} recipients
                    </span>
                    <span className="text-xs text-slate-300 dark:text-slate-600">·</span>
                    <span className="text-xs text-slate-400 dark:text-slate-500">
                      {new Date(e.startTime).toLocaleString()}
                    </span>
                  </div>
                  {(e.sentCount > 0 || e.failCount > 0) && (
                    <div className="mt-2 max-w-xs">
                      <ProgressBar
                        sent={e.sentCount}
                        total={e.recipients.length}
                        failed={e.failCount}
                      />
                    </div>
                  )}
                </div>
                  <div className="flex shrink-0 items-center gap-3">
                  <StatusBadge status={e.status} />
                  <button
                    onClick={(ev) => {
                      ev.stopPropagation();
                      onDelete?.(e);
                    }}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-error-50 hover:text-error-500 transition-colors dark:text-slate-500 dark:hover:bg-error-500/10 dark:hover:text-error-400"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                  </button>
                  <ArrowUpRight
                    size={16}
                    className="text-slate-300 transition group-hover:text-primary-500 dark:text-slate-600"
                  />
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="glass-card flex items-center gap-4 p-5">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-success-500/15 text-success-500 dark:text-success-400">
            <Send size={20} />
          </div>
          <div>
            <p className="text-2xl font-bold tabular-nums text-slate-800 dark:text-slate-50">
              {historyCount}
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400">Total emails delivered</p>
          </div>
        </div>
        <div className="glass-card flex items-center gap-4 p-5">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-500/15 text-primary-600 dark:text-primary-300">
            <Mail size={20} />
          </div>
          <div>
            <p className="text-2xl font-bold tabular-nums text-slate-800 dark:text-slate-50">
              {stats.total > 0 ? Math.round((stats.sent / stats.total) * 100) : 0}%
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400">Campaign success rate</p>
          </div>
        </div>
      </div>
    </div>
  );
}
