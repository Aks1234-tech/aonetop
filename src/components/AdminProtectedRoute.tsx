import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface AdminProtectedRouteProps {
    children: React.ReactNode;
    redirectPath?: string;
}

/**
 * Component to protect routes that should NOT be accessible to admin users.
 * Redirects admins to a different page (default: /admin)
 */
const AdminProtectedRoute = ({ children, redirectPath = '/admin' }: AdminProtectedRouteProps) => {
    const { isAdmin, isLoading } = useAuth();

    // Show nothing while loading to prevent flash
    if (isLoading) {
        return null;
    }

    // If user is admin, redirect them away from this route
    if (isAdmin) {
        return <Navigate to={redirectPath} replace />;
    }

    return <>{children}</>;
};

export default AdminProtectedRoute;
