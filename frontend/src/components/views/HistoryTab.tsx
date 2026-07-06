import { useEffect, useState } from 'react';
import { client } from '../../lib/client';
import { EmptyState } from '../ui/EmptyState';
import { TableSkeleton } from '../ui/Skeleton';
import { CheckCircle2, XCircle, Mail } from 'lucide-react';
import type { SentRecord } from '../../types';

export function HistoryTab() {
  const [records, setRecords] = useState<SentRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    client
      .listHistory()
      .then((r) => active && setRecords(r))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="glass-card">
        <TableSkeleton rows={5} cols={4} />
      </div>
    );
  }

  if (records.length === 0) {
    return (
      <EmptyState
        icon={<CheckCircle2 size={24} />}
        title="No sent emails yet"
        description="Successfully delivered emails will be logged here."
      />
    );
  }

  const handleClear = async () => {
    if (!confirm('Are you sure you want to clear all sent history?')) return;
    try {
      await client.clearHistory();
      setRecords([]);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="glass-card overflow-hidden flex flex-col">
      <div className="flex items-center justify-between p-4 border-b border-black/10 dark:border-white/10">
        <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200">Delivery Log</h2>
        <button
          onClick={handleClear}
          className="text-xs text-error-500 hover:text-error-600 dark:text-error-400 dark:hover:text-error-300 transition-colors"
        >
          Clear History
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-black/10 text-xs uppercase tracking-wide text-slate-500 dark:border-white/10 dark:text-slate-400">
            <tr>
              <th className="px-5 py-3 font-medium">Recipient</th>
              <th className="px-5 py-3 font-medium">Subject</th>
              <th className="px-5 py-3 font-medium">Sent At</th>
              <th className="px-5 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black/5 dark:divide-white/5">
            {records.map((r, i) => (
              <tr
                key={r.id}
                className="transition hover:bg-black/5 dark:hover:bg-white/5 animate-stagger"
                style={{ animationDelay: `${i * 30}ms` }}
              >
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary-500/10 text-primary-500 dark:text-primary-400">
                      <Mail size={13} />
                    </div>
                    <span className="text-slate-700 dark:text-slate-200">{r.recipient}</span>
                  </div>
                </td>
                <td className="px-5 py-3.5 text-slate-600 dark:text-slate-300">{r.subject}</td>
                <td className="px-5 py-3.5 text-slate-400 dark:text-slate-400">
                  {new Date(r.sentAt).toLocaleString()}
                </td>
                <td className="px-5 py-3.5">
                  {r.status === 'SENT' ? (
                    <span className="inline-flex items-center gap-1.5 text-success-500 dark:text-success-400">
                      <CheckCircle2 size={15} /> Sent
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 text-error-500 dark:text-error-400">
                      <XCircle size={15} /> Failed
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
