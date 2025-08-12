import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { apiRequest } from "@/lib/queryClient";

interface User {
  id: string;
  email: string;
  accountStatus: string;
}

export function useAuth() {
  const queryClient = useQueryClient();
  const [token, setToken] = useState<string | null>(null);

  // Track token changes reactively
  useEffect(() => {
    const checkToken = () => {
      const currentToken = localStorage.getItem("auth_token");
      setToken(currentToken);
    };
    
    checkToken();
    
    // Listen for storage changes
    window.addEventListener('storage', checkToken);
    return () => window.removeEventListener('storage', checkToken);
  }, []);
  
  const { data: user, isLoading, error } = useQuery<User | null>({
    queryKey: ["/api/auth/user"],
    queryFn: async () => {
      const currentToken = localStorage.getItem("auth_token");
      if (!currentToken) return null;

      const response = await fetch("/api/auth/user", {
        headers: {
          Authorization: `Bearer ${currentToken}`,
        },
      });

      if (response.status === 401) {
        localStorage.removeItem("auth_token");
        setToken(null);
        return null;
      }

      if (!response.ok) {
        throw new Error(`${response.status}: ${response.statusText}`);
      }

      return response.json();
    },
    enabled: !!token, // Only fetch if token exists
    retry: false,
  });

  const logout = async () => {
    const token = localStorage.getItem("auth_token");
    if (token) {
      try {
        await apiRequest("POST", "/api/auth/logout", {});
      } catch (error) {
        // Continue with logout even if API call fails
        if (import.meta.env.DEV) console.debug("Logout API call failed:", error);
      }
    }
    
    localStorage.removeItem("auth_token");
    queryClient.setQueryData(["/api/auth/user"], null);
    queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
    
    // Redirect to home
    window.location.href = "/";
  };

  return {
    user,
    isLoading,
    isAuthenticated: !!user && !error,
    logout,
  };
}
