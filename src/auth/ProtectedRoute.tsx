import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { session, loading } = useAuth();

  // Initial session check in progress — show branded loading screen
  if (loading) {
    return (
      <div className="min-h-screen bg-primary flex items-center justify-center">
        <div className="text-center">
          <p className="font-serif text-xl text-text-primary mb-2">
            L'Femme <span className="italic text-accent">Admin</span>
          </p>
          <p className="text-text-secondary animate-pulse text-sm font-sans">
            Cargando...
          </p>
        </div>
      </div>
    );
  }

  // Not authenticated — redirect to login
  if (!session) {
    return <Navigate to="/admin/login" replace />;
  }

  // Authenticated — render protected content
  return <>{children}</>;
}
