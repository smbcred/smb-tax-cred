import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface User {
  id: string;
  email: string;
  accountStatus: string;
}

export function useAuth() {
  const queryClient = useQueryClient();
  
  const { data: user, isLoading, error } = useQuery<User | null>({
    queryKey: ["/api/auth/user"],
    queryFn: async () => {
      const token = localStorage.getItem("auth_token");
      if (!token) return null;

      const response = await fetch("/api/auth/user", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 401) {
        localStorage.removeItem("auth_token");
        return null;
      }

      if (!response.ok) {
        throw new Error(`${response.status}: ${response.statusText}`);
      }

      return response.json();
    },
    retry: false,
  });

  const logout = async () => {
    const token = localStorage.getItem("auth_token");
    if (token) {
      try {
        await apiRequest("POST", "/api/auth/logout", {});
      } catch (error) {
        // Continue with logout even if API call fails
        console.warn("Logout API call failed:", error);
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
