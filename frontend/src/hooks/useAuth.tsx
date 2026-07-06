import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import type { AuthUser } from '../types';
import { client } from '../lib/client';

interface AuthState {
  user: AuthUser | null;
  accounts: AuthUser[];
  loading: boolean;
  signIn: () => void;
  addAccount: () => void;
  switchAccount: (id: string) => void;
  signOut: () => void;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

const ACCOUNTS_KEY = 'reachinbox.accounts';
const ACTIVE_ID_KEY = 'reachinbox.activeId';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [accounts, setAccounts] = useState<AuthUser[]>(() => {
    try {
      const raw = localStorage.getItem(ACCOUNTS_KEY);
      return raw ? (JSON.parse(raw) as AuthUser[]) : [];
    } catch {
      return [];
    }
  });

  const [activeId, setActiveId] = useState<string | null>(() => {
    return localStorage.getItem(ACTIVE_ID_KEY) || null;
  });

  const [loading, setLoading] = useState(false);

  const user = accounts.find((a) => a.id === activeId) || null;

  const handleSuccess = async (tokenResponse: any) => {
    setLoading(true);
    try {
      const { user: u, token } = await client.login(tokenResponse.access_token);
      
      setAccounts((prev) => {
        const filtered = prev.filter(a => a.id !== u.id);
        const next = [...filtered, u];
        localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(next));
        return next;
      });
      setActiveId(u.id);
      localStorage.setItem(ACTIVE_ID_KEY, u.id);
      localStorage.setItem(`reachinbox.token.${u.id}`, token);
    } catch (err) {
      console.error('Failed to fetch user info:', err);
    } finally {
      setLoading(false);
    }
  };

  const signIn = useGoogleLogin({
    prompt: 'select_account',
    onSuccess: handleSuccess,
    onError: (error) => console.error('Login Failed:', error),
  });

  const addAccount = useGoogleLogin({
    prompt: 'select_account',
    onSuccess: handleSuccess,
    onError: (error) => console.error('Login Failed:', error),
  });

  const switchAccount = useCallback((id: string) => {
    setActiveId(id);
    localStorage.setItem(ACTIVE_ID_KEY, id);
  }, []);

  const signOut = useCallback(() => {
    setAccounts((prev) => {
      const next = prev.filter(a => a.id !== activeId);
      localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(next));
      if (next.length > 0) {
        setActiveId(next[0].id);
        localStorage.setItem(ACTIVE_ID_KEY, next[0].id);
      } else {
        setActiveId(null);
        localStorage.removeItem(ACTIVE_ID_KEY);
      }
      return next;
    });
  }, [activeId]);

  return (
    <AuthContext.Provider value={{ user, accounts, loading, signIn, addAccount, switchAccount, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
