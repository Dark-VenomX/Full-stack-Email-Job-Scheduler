interface Props {
  sent: number;
  total: number;
  failed: number;
}

export function ProgressBar({ sent, total, failed }: Props) {
  const sentPct = total > 0 ? (sent / total) * 100 : 0;
  const failPct = total > 0 ? (failed / total) * 100 : 0;

  return (
    <div className="flex items-center gap-2">
      <div className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-black/10 dark:bg-white/10">
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-success-500 transition-all duration-700"
          style={{ width: `${sentPct}%` }}
        />
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-error-500/70 transition-all duration-700"
          style={{ width: `${failPct}%`, marginLeft: `${sentPct}%` }}
        />
      </div>
      <span className="shrink-0 text-xs font-medium tabular-nums text-slate-500 dark:text-slate-400">
        {sent + failed}/{total}
      </span>
    </div>
  );
}
