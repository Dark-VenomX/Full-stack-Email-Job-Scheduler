import { BackgroundWrapper } from './components/BackgroundWrapper';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { ThemeProvider } from './hooks/useTheme';
import { ToastProvider } from './components/ui/Toast';
import { LoginScreen } from './components/LoginScreen';
import { Dashboard } from './components/Dashboard';

function Gate() {
  const { user } = useAuth();
  return user ? <Dashboard /> : <LoginScreen />;
}

export default function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <BackgroundWrapper>
            <Gate />
          </BackgroundWrapper>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}
