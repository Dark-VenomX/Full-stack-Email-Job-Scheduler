import { useEffect, useState, useCallback } from 'react';
import { Sidebar } from './layout/Sidebar';
import { ThemeToggle } from './ui/ThemeToggle';
import { OverviewTab } from './views/OverviewTab';
import { QueueTab } from './views/QueueTab';
import { HistoryTab } from './views/HistoryTab';
import { ComposeModal } from './ComposeModal';
import { DetailDrawer } from './DetailDrawer';
import { HelpModal } from './HelpModal';
import { Modal } from './ui/Modal';
import { client } from '../lib/client';
import { useToast } from './ui/Toast';
import { Search, LogOut, UserCircle, UserPlus } from 'lucide-react';
import type { ScheduledEmail } from '../types';
import type { TabId } from '../types/nav';

import { useAuth } from '../hooks/useAuth';

const tabMeta: Record<TabId, { title: string; subtitle: string }> = {
  overview: { title: 'Dashboard Overview', subtitle: 'Monitor your email campaigns at a glance.' },
  queue: { title: 'Scheduled Queue', subtitle: 'All scheduled and in-flight email jobs.' },
  history: { title: 'Sent History', subtitle: 'Review successfully completed campaigns.' },
};

export function Dashboard() {
  const { user, accounts, addAccount, switchAccount, signOut } = useAuth();
  const [tab, setTab] = useState<TabId>('overview');
  const [emails, setEmails] = useState<ScheduledEmail[]>([]);
  const [loading, setLoading] = useState(true);
  const [composeOpen, setComposeOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [switchOpen, setSwitchOpen] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [selected, setSelected] = useState<ScheduledEmail | null>(null);
  const [query, setQuery] = useState('');
  const [clock, setClock] = useState(new Date());

  const { notify } = useToast();

  const fetchEmails = useCallback(async () => {
    try {
      setLoading(true);
      const data = await client.listEmails();
      setEmails(data);
    } catch (err) {
      notify('error', 'Failed to load campaigns');
    } finally {
      setLoading(false);
    }
  }, [notify]);

  useEffect(() => {
    fetchEmails();
    const interval = setInterval(fetchEmails, 5000); // Live time updates every 5s
    return () => clearInterval(interval);
  }, [fetchEmails]);

  useEffect(() => {
    const tick = setInterval(() => setClock(new Date()), 1000);
    return () => clearInterval(tick);
  }, []);

  const filtered = query
    ? emails.filter(
        (e) =>
          e.subject.toLowerCase().includes(query.toLowerCase()) ||
          e.recipients.some((r) => r.toLowerCase().includes(query.toLowerCase())),
      )
    : emails;

  const handleScheduled = (email: ScheduledEmail) => {
    fetchEmails();
    notify('success', `Campaign "${email.subject}" scheduled successfully.`);
  };

  const handleDelete = async (email: ScheduledEmail) => {
    if (!confirm(`Are you sure you want to delete "${email.subject}"?`)) return;
    try {
      await client.deleteEmail(email.id);
      notify('success', 'Campaign deleted successfully.');
      fetchEmails();
    } catch (err) {
      notify('error', 'Failed to delete campaign');
    }
  };

  const meta = tabMeta[tab];

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar 
        active={tab} 
        onChange={setTab} 
        onCompose={() => setComposeOpen(true)} 
        onHelp={() => setHelpOpen(true)}
      />

      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top bar */}
        <header className="flex h-20 items-center justify-between border-b border-black/5 bg-white/50 px-8 backdrop-blur-xl dark:border-white/10 dark:bg-ink-900/40">
          <div className="flex w-96 items-center gap-3 rounded-2xl bg-black/5 px-4 py-2.5 dark:bg-white/5 ring-1 ring-black/5 dark:ring-white/10 transition-shadow focus-within:ring-primary-500/50">
            <Search size={18} className="text-slate-400" />
            <input
              type="text"
              placeholder="Search campaigns..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="bg-transparent text-sm font-medium text-slate-800 placeholder-slate-400 outline-none dark:text-slate-100 dark:placeholder-slate-500 w-full"
            />
          </div>
          <div className="mx-4 h-6 w-px bg-black/10 dark:bg-white/10"></div>
          <div className="ml-auto flex items-center gap-5">
            <div className="hidden items-center gap-2 text-sm text-slate-400 dark:text-slate-500 sm:flex">
              <span className="h-2 w-2 rounded-full bg-success-500 animate-pulse-ring" />
              <span className="tabular-nums">{clock.toLocaleTimeString()}</span>
            </div>
            <ThemeToggle />
            <div className="h-6 w-px bg-black/10 dark:bg-white/10"></div>
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-3 rounded-full hover:bg-black/5 dark:hover:bg-white/5 p-1 pr-3 transition"
              >
                <img
                  src={user?.avatar}
                  alt={user?.name}
                  className="h-9 w-9 rounded-full object-cover ring-1 ring-black/10 dark:ring-white/10"
                />
                <div className="flex flex-col items-start text-left">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{user?.name}</span>
                  <span className="text-xs text-slate-400 dark:text-slate-500">{user?.email}</span>
                </div>
              </button>
              
              {showProfileMenu && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowProfileMenu(false)} />
                  <div className="absolute right-0 top-full z-50 mt-2 w-48 rounded-xl border border-black/5 bg-white p-1 shadow-lg dark:border-white/10 dark:bg-ink-800 animate-slide-up">
                    <button
                      onClick={() => {
                        setShowProfileMenu(false);
                        setSwitchOpen(true);
                      }}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-black/5 dark:text-slate-300 dark:hover:bg-white/5 transition-colors"
                    >
                      <UserCircle size={16} /> Switch Account
                    </button>
                    <div className="my-1 h-px bg-black/5 dark:bg-white/10" />
                    <button
                      onClick={signOut}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-error-600 hover:bg-error-50 dark:text-error-400 dark:hover:bg-error-500/10 transition-colors"
                    >
                      <LogOut size={16} /> Sign Out
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto px-8 py-8">
          <div className="mx-auto max-w-5xl">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-50">{meta.title}</h1>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{meta.subtitle}</p>
            </div>

            {tab === 'overview' && (
              <OverviewTab
                emails={filtered}
                loading={loading}
                onCompose={() => setComposeOpen(true)}
                onSelect={setSelected}
                onDelete={handleDelete}
              />
            )}
            {tab === 'queue' && (
              <QueueTab 
                emails={filtered} 
                loading={loading} 
                onSelect={setSelected} 
                onDelete={handleDelete}
              />
            )}
            {tab === 'history' && <HistoryTab />}
          </div>
        </main>
      </div>

      <ComposeModal
        open={composeOpen}
        onClose={() => setComposeOpen(false)}
        onScheduled={handleScheduled}
      />
      <DetailDrawer email={selected} onClose={() => setSelected(null)} />
      <HelpModal isOpen={helpOpen} onClose={() => setHelpOpen(false)} />

      <Modal open={switchOpen} onClose={() => setSwitchOpen(false)} title="Switch Account">
        <div className="flex flex-col space-y-2 py-4 px-2">
          {accounts.map(acc => (
            <button
              key={acc.id}
              onClick={() => {
                switchAccount(acc.id);
                setSwitchOpen(false);
                notify('success', `Switched to ${acc.name}`);
              }}
              className={`flex items-center gap-3 rounded-xl p-3 transition ${
                acc.id === user?.id 
                  ? 'bg-primary-50 dark:bg-primary-500/10 ring-1 ring-primary-500/30' 
                  : 'hover:bg-black/5 dark:hover:bg-white/5'
              }`}
            >
              <img src={acc.avatar} alt={acc.name} className="h-10 w-10 rounded-full object-cover" />
              <div className="flex flex-col items-start">
                <span className="text-sm font-medium text-slate-800 dark:text-slate-100">{acc.name}</span>
                <span className="text-xs text-slate-500 dark:text-slate-400">{acc.email}</span>
              </div>
              {acc.id === user?.id && (
                <div className="ml-auto flex items-center justify-center rounded-full bg-primary-500 px-2 py-0.5 text-[10px] font-bold text-white uppercase tracking-wider">
                  Active
                </div>
              )}
            </button>
          ))}
          
          <div className="my-2 h-px bg-black/5 dark:bg-white/10" />
          
          <button
            onClick={() => {
              setSwitchOpen(false);
              addAccount();
            }}
            className="flex items-center gap-3 rounded-xl p-3 text-slate-600 hover:bg-black/5 dark:text-slate-300 dark:hover:bg-white/5 transition"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-black/5 dark:bg-white/5">
              <UserPlus size={18} />
            </div>
            <span className="text-sm font-medium">Add another account</span>
          </button>
        </div>
      </Modal>
    </div>
  );
}
