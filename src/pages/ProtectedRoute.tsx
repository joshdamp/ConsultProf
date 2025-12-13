import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/app/Auth/AuthContext';
import { LoadingSpinner } from '@/app/components/ui/loading';
import { UserRole } from '@/app/types/database';

interface ProtectedRouteProps {
  allowedRoles?: UserRole[];
}

export default function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const { user, profile, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size={48} />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && profile && !allowedRoles.includes(profile.role)) {
    // Redirect to appropriate dashboard
    const redirectPath = profile.role === 'student' ? '/student/dashboard' : '/professor/dashboard';
    return <Navigate to={redirectPath} replace />;
  }

  return <Outlet />;
}
