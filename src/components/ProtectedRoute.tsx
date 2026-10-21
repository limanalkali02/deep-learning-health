import { Navigate } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import type { Role } from '../lib/supabase';

interface ProtectedRouteProps {
  allowedRole: Role;
  children: React.ReactNode;
}

export function ProtectedRoute({ allowedRole, children }: ProtectedRouteProps) {
  const { session, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-teal-600 border-t-transparent" />
      </div>
    );
  }

  if (!session) return <Navigate to="/login" replace />;
  if (!profile) return <Navigate to="/select-role" replace />;
  if (profile.role !== allowedRole) return <Navigate to={`/${profile.role}`} replace />;

  return <>{children}</>;
}
