import { useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { AuthManager } from "@/lib/auth";

interface ProtectedRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
  requiredRole?: string; // Future role-based access
}

const ProtectedRoute = ({ 
  children, 
  redirectTo = "/login",
  requiredRole 
}: ProtectedRouteProps) => {
  const { user, isLoading, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    // Check for expired token and handle session timeout
    const checkTokenExpiration = () => {
      const token = AuthManager.getToken();
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          const now = Date.now() / 1000;
          
          // Check if token is expired
          if (payload.exp && payload.exp < now) {
            AuthManager.handleAuthError();
            return;
          }
          
          // Set up automatic logout 5 minutes before token expires
          const timeUntilExpiry = (payload.exp - now) * 1000;
          const warningTime = Math.max(0, timeUntilExpiry - (5 * 60 * 1000));
          
          if (warningTime > 0) {
            const timeoutId = setTimeout(() => {
              // Show warning or automatically refresh token
              console.log("Token expiring soon, consider implementing refresh");
            }, warningTime);
            
            return () => clearTimeout(timeoutId);
          }
        } catch (error) {
          console.error("Error parsing token:", error);
          AuthManager.handleAuthError();
        }
      }
    };

    const cleanup = checkTokenExpiration();
    return cleanup;
  }, [user]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      // Store intended destination for post-login redirect
      const currentPath = window.location.pathname;
      if (currentPath !== "/" && currentPath !== redirectTo) {
        localStorage.setItem("redirect_after_login", currentPath);
      }
      setLocation(redirectTo);
    }
  }, [isAuthenticated, isLoading, redirectTo, setLocation]);

  // Role-based access control (future implementation)
  useEffect(() => {
    if (!isLoading && isAuthenticated && requiredRole && user) {
      // Future: Check user.role against requiredRole
      // For now, all authenticated users have access
    }
  }, [user, requiredRole, isAuthenticated, isLoading]);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cloud">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Verifying access...</p>
        </div>
      </div>
    );
  }

  // Don't render children if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
};

export default ProtectedRoute;