import { useState, useRef, useCallback, type FormEvent } from 'react';
import { Modal } from './ui/Modal';
import { Spinner } from './ui/Spinner';
import { parseEmailsFromCsv } from '../lib/csv';
import { client } from '../lib/client';
import { useToast } from './ui/Toast';
import { UploadCloud, FileText, X } from 'lucide-react';
import type { ScheduleEmailInput, ScheduledEmail } from '../types';

interface Props {
  open: boolean;
  onClose: () => void;
  onScheduled: (email: ScheduledEmail) => void;
}

export function ComposeModal({ open, onClose, onScheduled }: Props) {
  const { notify } = useToast();
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [startTime, setStartTime] = useState('');
  const [delaySeconds, setDelaySeconds] = useState(0);
  const [hourlyLimit, setHourlyLimit] = useState(30);
  const [recipients, setRecipients] = useState<string[]>([]);
  const [fileName, setFileName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const reset = useCallback(() => {
    setSubject('');
    setBody('');
    setStartTime('');
    setDelaySeconds(0);
    setHourlyLimit(30);
    setRecipients([]);
    setFileName('');
    setError('');
  }, []);

  const handleFile = useCallback(async (file: File) => {
    setFileName(file.name);
    const text = await file.text();
    setRecipients(parseEmailsFromCsv(text));
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const file = e.dataTransfer.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile],
  );

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    if (!subject || !body || !startTime) {
      setError('Subject, body, and start time are required.');
      return;
    }
    if (recipients.length === 0) {
      setError('Upload a CSV with at least one email address.');
      return;
    }
    setSubmitting(true);
    try {
      const input: ScheduleEmailInput = {
        subject,
        body,
        recipients,
        startTime: new Date(startTime).toISOString(),
        delaySeconds,
        hourlyLimit,
      };
      const email = await client.scheduleEmail(input);
      onScheduled(email);
      reset();
      onClose();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to schedule email';
      setError(msg);
      notify('error', msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Compose Email"
      description="Schedule a throttled campaign to your recipients."
      footer={
        <>
          <button type="button" className="btn-ghost" onClick={handleClose} disabled={submitting}>
            Cancel
          </button>
          <button type="submit" form="compose-form" className="btn-primary" disabled={submitting}>
            {submitting ? <Spinner /> : null}
            Schedule Campaign
          </button>
        </>
      }
    >
      <form id="compose-form" onSubmit={handleSubmit} className="space-y-4">
        <Field label="Subject">
          <input
            className="glass-input"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Q3 Product Launch"
          />
        </Field>

        <Field label="Body">
          <textarea
            className="glass-input min-h-[100px] resize-y"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Write your email content…"
          />
        </Field>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Field label="Start Time">
            <input
              type="datetime-local"
              className="glass-input"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
            />
          </Field>
          <Field label="Delay (sec)">
            <input
              type="number"
              min={0}
              className="glass-input"
              value={delaySeconds}
              onChange={(e) => setDelaySeconds(Number(e.target.value))}
            />
          </Field>
          <Field label="Hourly Limit">
            <input
              type="number"
              min={1}
              className="glass-input"
              value={hourlyLimit}
              onChange={(e) => setHourlyLimit(Number(e.target.value))}
            />
          </Field>
        </div>

        <Field label="Recipients CSV">
          <div
            onClick={() => fileInputRef.current?.click()}
            onDrop={onDrop}
            onDragOver={(e) => e.preventDefault()}
            className="cursor-pointer rounded-xl border border-dashed border-black/15 bg-black/5 px-4 py-5 text-center transition hover:border-primary-500/50 hover:bg-black/10 dark:border-white/15 dark:bg-white/5 dark:hover:bg-white/10"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,text/csv,text/plain"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleFile(f);
                // Reset value to allow selecting the same file again
                e.target.value = '';
              }}
            />
            {recipients.length > 0 ? (
              <div className="flex items-center justify-center gap-2 text-sm text-slate-700 dark:text-slate-200">
                <FileText size={16} className="text-success-500 dark:text-success-400" />
                <span className="font-medium">{fileName}</span>
                <span className="text-slate-400">·</span>
                <span className="text-success-500 dark:text-success-400">{recipients.length} emails detected</span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setRecipients([]);
                    setFileName('');
                  }}
                  className="ml-1 rounded p-0.5 text-slate-400 hover:bg-black/10 hover:text-slate-600 dark:hover:bg-white/10 dark:hover:text-slate-200"
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400">
                <UploadCloud size={20} />
                <span>Click or drag a CSV file here</span>
              </div>
            )}
          </div>
        </Field>

        {error && (
          <p className="rounded-lg bg-error-500/10 px-3 py-2 text-sm text-error-500 dark:text-error-400">{error}</p>
        )}
      </form>
    </Modal>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
        {label}
      </span>
      {children}
    </label>
  );
}
