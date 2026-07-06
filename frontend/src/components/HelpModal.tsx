import { Modal } from './ui/Modal';
import { UploadCloud, Activity, Zap } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export function HelpModal({ isOpen, onClose }: Props) {
  return (
    <Modal open={isOpen} onClose={onClose} title="How AuraInbox Works">
      <div className="space-y-6 text-sm text-slate-600 dark:text-slate-300">
        
        <div className="flex gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
            <UploadCloud size={20} />
          </div>
          <div>
            <h3 className="font-semibold text-slate-800 dark:text-slate-100">1. Uploading your CSV</h3>
            <p className="mt-1">
              Click the <strong>Compose</strong> button to start a campaign. You can drag and drop a CSV file containing your recipients. Ensure your CSV has at least an <code>email</code> column, and optionally a <code>name</code> column for personalization.
            </p>
          </div>
        </div>

        <div className="flex gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
            <Activity size={20} />
          </div>
          <div>
            <h3 className="font-semibold text-slate-800 dark:text-slate-100">2. Rate Limiting & Scheduling</h3>
            <p className="mt-1">
              To protect your email reputation, AuraInbox uses advanced rate limiting. You can set the exact time you want the campaign to start, and AuraInbox will drip-feed the emails out automatically in the background using a secure Redis queue.
            </p>
          </div>
        </div>

        <div className="flex gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <Zap size={20} />
          </div>
          <div>
            <h3 className="font-semibold text-slate-800 dark:text-slate-100">3. Real-time Tracking</h3>
            <p className="mt-1">
              Once scheduled, your emails move to the <strong>Scheduled Queue</strong> tab. As our background workers process them, they will automatically move to the <strong>Sent History</strong> tab where you can monitor success rates in real-time.
            </p>
          </div>
        </div>

      </div>

      <div className="mt-8 flex justify-end">
        <button onClick={onClose} className="btn-primary">
          Got it!
        </button>
      </div>
    </Modal>
  );
}
