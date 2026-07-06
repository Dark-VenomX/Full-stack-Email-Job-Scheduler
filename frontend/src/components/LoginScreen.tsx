import { useAuth } from '../hooks/useAuth';
import { Spinner } from './ui/Spinner';
import { ThemeToggle } from './ui/ThemeToggle';
import { Clock, Gauge, ShieldCheck } from 'lucide-react';
import logo from '../assets/logo.png';

const features = [
  { icon: Clock, label: 'Precision Scheduling' },
  { icon: Gauge, label: 'Rate Limiting' },
  { icon: ShieldCheck, label: 'Reliable Delivery' },
];

export function LoginScreen() {
  const { signIn, loading } = useAuth();

  return (
    <div className="relative flex min-h-screen items-center justify-center px-4">
      <div className="absolute right-6 top-6">
        <ThemeToggle />
      </div>
      <div className="glass-card w-full max-w-md p-8 animate-slide-up">
        <div className="mb-8 flex flex-col items-center text-center">
          <img src={logo} alt="AuraInbox Logo" className="mb-4 h-16 w-16 rounded-2xl object-cover shadow-xl" />
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-50">AuraInbox</h1>
          <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">
            Schedule and throttle bulk email campaigns with precision.
          </p>
        </div>

        <div className="mb-7 flex items-center justify-center gap-5">
          {features.map((f, i) => (
            <div
              key={f.label}
              className="flex flex-col items-center gap-1.5 animate-stagger"
              style={{ animationDelay: `${200 + i * 100}ms` }}
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-black/5 text-slate-500 dark:bg-white/5 dark:text-slate-400">
                <f.icon size={18} />
              </div>
              <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500">
                {f.label}
              </span>
            </div>
          ))}
        </div>

        <button
          onClick={signIn}
          disabled={loading}
          className="flex w-full items-center justify-center gap-3 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-slate-800 shadow-lg ring-1 ring-black/5 hover:bg-slate-50 active:scale-[0.98] transition disabled:opacity-70 dark:bg-white dark:text-ink-900 dark:ring-white/10 dark:hover:bg-slate-100"
        >
          {loading ? <Spinner className="text-ink-900" /> : <GoogleIcon />}
          {loading ? 'Signing in…' : 'Continue with Google'}
        </button>

        <p className="mt-5 text-center text-xs text-slate-400 dark:text-slate-500">
          Secure, real Google OAuth authentication.
        </p>
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.17-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62z" />
      <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.8.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.32A9 9 0 0 0 9 18z" />
      <path fill="#FBBC05" d="M3.97 10.72A5.41 5.41 0 0 1 3.68 9c0-.6.1-1.18.29-1.72V4.96H.96A9 9 0 0 0 0 9c0 1.45.35 2.82.96 4.04l3.01-2.32z" />
      <path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58A9 9 0 0 0 .96 4.96l3.01 2.32C4.68 5.16 6.66 3.58 9 3.58z" />
    </svg>
  );
}
