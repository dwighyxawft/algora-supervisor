import { Navigate, Outlet } from 'react-router-dom';
import { useMentorAuth } from '@/contexts/MentorAuthContext';

export function ProtectedMentorRoute() {
  const { isAuthenticated, isLoading } = useMentorAuth();
  if (isLoading) return (
    <div className="h-screen flex items-center justify-center bg-background">
      <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
    </div>
  );
  return isAuthenticated ? <Outlet /> : <Navigate to="/mentor/login" replace />;
}
