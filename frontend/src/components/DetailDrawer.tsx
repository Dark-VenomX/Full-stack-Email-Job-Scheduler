import { useEffect } from 'react';
import { X, Clock, Users, Gauge, Calendar, Mail } from 'lucide-react';
import { StatusBadge } from './ui/StatusBadge';
import { ProgressBar } from './ui/ProgressBar';
import type { ScheduledEmail } from '../types';

interface Props {
  email: ScheduledEmail | null;
  onClose: () => void;
}

export function DetailDrawer({ email, onClose }: Props) {
  useEffect(() => {
    if (!email) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [email, onClose]);

  if (!email) return null;

  const details = [
    { icon: Calendar, label: 'Start Time', value: new Date(email.startTime).toLocaleString() },
    { icon: Clock, label: 'Delay', value: `${email.delaySeconds}s` },
    { icon: Users, label: 'Recipients', value: String(email.recipients.length) },
    { icon: Gauge, label: 'Hourly Limit', value: String(email.hourlyLimit) },
  ];

  return (
    <div className="fixed inset-0 z-50">
      <div
        className="absolute inset-0 bg-slate-200/60 backdrop-blur-sm animate-fade-in dark:bg-ink-900/60"
        onClick={onClose}
      />
      <aside className="glass-card absolute right-0 top-0 flex h-full w-full max-w-md flex-col animate-slide-up rounded-l-2xl rounded-r-none p-6">
        <div className="mb-6 flex items-start justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-600/20 text-primary-300 ring-1 ring-primary-500/30">
              <Mail size={18} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-50">
                Campaign Details
              </h2>
              <p className="text-xs text-slate-400 dark:text-slate-500">
                Created {new Date(email.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-black/5 hover:text-slate-600 dark:hover:bg-white/10 dark:hover:text-slate-200 transition"
          >
            <X size={18} />
          </button>
        </div>

        <div className="mb-5 flex items-center gap-3">
          <StatusBadge status={email.status} />
          {email.errorMessage && (
            <span className="text-xs text-error-500 dark:text-error-400">{email.errorMessage}</span>
          )}
        </div>

        <div className="mb-6">
          <h3 className="mb-1 text-sm font-semibold text-slate-700 dark:text-slate-200">
            {email.subject}
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-4">{email.body}</p>
        </div>

        <div className="mb-6 grid grid-cols-2 gap-3">
          {details.map((d) => (
            <div key={d.label} className="rounded-xl bg-black/5 p-3 dark:bg-white/5">
              <div className="mb-1.5 flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500">
                <d.icon size={13} />
                {d.label}
              </div>
              <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{d.value}</p>
            </div>
          ))}
        </div>

        <div className="mb-6">
          <div className="mb-2 flex items-center justify-between text-xs">
            <span className="text-slate-500 dark:text-slate-400">Delivery Progress</span>
            <span className="text-slate-400 dark:text-slate-500">
              {email.sentCount} sent · {email.failCount} failed
            </span>
          </div>
          <ProgressBar
            sent={email.sentCount}
            total={email.recipients.length}
            failed={email.failCount}
          />
        </div>

        <div className="flex-1 overflow-y-auto">
          <h4 className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-400 dark:text-slate-500">
            Recipients ({email.recipients.length})
          </h4>
          <div className="space-y-1">
            {email.recipients.map((r: string, i: number) => (
              <div
                key={i}
                className="flex items-center gap-2 rounded-lg bg-black/5 px-3 py-2 text-sm text-slate-600 dark:bg-white/5 dark:text-slate-300"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-primary-400" />
                {r}
              </div>
            ))}
          </div>
        </div>
      </aside>
    </div>
  );
}
