import { AuthProvider, useAuth } from './contexts/AuthContext';
import { TransferProvider } from './contexts/TransferContext';
import Dashboard from './components/Dashboard';
import Login from './components/Login';

function AppContent() {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-kingdom-green border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!currentUser) return <Login />;

  return (
    <TransferProvider>
      <Dashboard />
    </TransferProvider>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
