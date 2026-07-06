import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Layout from "./components/Layout";
import Homepage from "./pages/Homepage";
import EmailView from "./pages/EmailView";
import Compose from "./pages/Compose";
import { useAuth } from "./hooks/useAuth";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Homepage tab="scheduled" />} />
        <Route path="sent" element={<Homepage tab="sent" />} />
        <Route path="email/:id" element={<EmailView />} />
      </Route>
      <Route
        path="/compose"
        element={
          <ProtectedRoute>
            <Compose />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
