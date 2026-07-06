import { LayoutDashboard, ListChecks, History, Plus, LifeBuoy, MailQuestion } from 'lucide-react';
import type { TabId } from '../../types/nav';
import logo from '../../assets/logo.png';

interface Props {
  active: TabId;
  onChange: (tab: TabId) => void;
  onCompose: () => void;
  onHelp: () => void;
}

const navItems: { id: TabId; label: string; icon: typeof LayoutDashboard }[] = [
  { id: 'overview', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'queue', label: 'Scheduled Queue', icon: ListChecks },
  { id: 'history', label: 'Sent History', icon: History },
];

export function Sidebar({ active, onChange, onCompose, onHelp }: Props) {
  return (
    <aside className="flex h-full w-64 flex-col border-r border-black/5 bg-white/50 backdrop-blur-xl dark:border-white/10 dark:bg-ink-900/40">
      <div className="flex items-center gap-2.5 px-6 py-5">
        <img src={logo} alt="AuraInbox Logo" className="h-9 w-9 rounded-xl object-cover shadow-lg" />
        <span className="text-lg font-bold text-slate-800 dark:text-slate-50">AuraInbox</span>
      </div>

      <div className="px-4">
        <button onClick={onCompose} className="btn-primary w-full shadow-lg shadow-primary-500/20">
          <Plus size={16} /> Compose
        </button>
      </div>

      <nav className="mt-6 flex-1 space-y-1 px-3">
        {navItems.map((item) => {
          const isActive = active === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onChange(item.id)}
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                isActive
                  ? 'bg-primary-600/15 text-primary-700 ring-1 ring-primary-500/20 dark:bg-primary-600/20 dark:text-primary-200 dark:ring-primary-500/30'
                  : 'text-slate-500 hover:bg-black/5 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-white/5 dark:hover:text-slate-200'
              }`}
            >
              <item.icon size={18} />
              {item.label}
            </button>
          );
        })}
      </nav>

      <div className="mt-auto p-4 space-y-1">
        <button 
          onClick={onHelp}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-slate-500 hover:bg-black/5 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-white/5 dark:hover:text-slate-200 transition"
        >
          <LifeBuoy size={18} /> Help & Guide
        </button>
        <a 
          href="mailto:support@aurainbox.com"
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-slate-500 hover:bg-black/5 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-white/5 dark:hover:text-slate-200 transition"
        >
          <MailQuestion size={18} /> Contact Us
        </a>
      </div>
    </aside>
  );
}
