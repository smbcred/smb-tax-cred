/**
 * Authentication utilities for token management and auth state
 */

const TOKEN_KEY = "auth_token";
const REFRESH_KEY = "refresh_token";

export class AuthManager {
  /**
   * Store JWT token in localStorage
   */
  static setToken(token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
  }

  /**
   * Get JWT token from localStorage
   */
  static getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  /**
   * Remove JWT token from localStorage
   */
  static removeToken(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_KEY);
  }

  /**
   * Check if user is authenticated (has valid token)
   */
  static isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) return false;
    
    try {
      // Basic JWT structure check (not cryptographic verification)
      const payload = JSON.parse(atob(token.split('.')[1]));
      const now = Date.now() / 1000;
      
      // Check if token is expired
      if (payload.exp && payload.exp < now) {
        this.removeToken();
        return false;
      }
      
      return true;
    } catch {
      this.removeToken();
      return false;
    }
  }

  /**
   * Get token expiration time in seconds
   */
  static getTokenExpiration(): number | null {
    const token = this.getToken();
    if (!token) return null;
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp || null;
    } catch {
      return null;
    }
  }

  /**
   * Check if token is expiring soon (within specified minutes)
   */
  static isTokenExpiringSoon(minutesBefore: number = 5): boolean {
    const expiration = this.getTokenExpiration();
    if (!expiration) return false;
    
    const now = Date.now() / 1000;
    const timeUntilExpiry = expiration - now;
    
    return timeUntilExpiry <= (minutesBefore * 60);
  }

  /**
   * Get remaining token lifetime in seconds
   */
  static getTokenTimeRemaining(): number {
    const expiration = this.getTokenExpiration();
    if (!expiration) return 0;
    
    const now = Date.now() / 1000;
    return Math.max(0, expiration - now);
  }

  /**
   * Get authorization header for API requests
   */
  static getAuthHeader(): Record<string, string> {
    const token = this.getToken();
    if (!token) return {};
    
    return {
      'Authorization': `Bearer ${token}`
    };
  }

  /**
   * Logout user and clear tokens
   */
  static logout(): void {
    this.removeToken();
    // Force page reload to clear any cached user state
    window.location.href = '/';
  }

  /**
   * Handle authentication errors (401, 403)
   */
  static handleAuthError(): void {
    this.removeToken();
    window.location.href = '/login';
  }

  /**
   * Parse user info from JWT token
   */
  static getUserFromToken(): { userId: string } | null {
    const token = this.getToken();
    if (!token) return null;
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return { userId: payload.userId };
    } catch {
      return null;
    }
  }
}

/**
 * Hook for accessing auth utilities
 */
export function useAuthManager() {
  return {
    setToken: AuthManager.setToken,
    getToken: AuthManager.getToken,
    removeToken: AuthManager.removeToken,
    isAuthenticated: AuthManager.isAuthenticated,
    getAuthHeader: AuthManager.getAuthHeader,
    logout: AuthManager.logout,
    handleAuthError: AuthManager.handleAuthError,
    getUserFromToken: AuthManager.getUserFromToken,
  };
}

/**
 * Enhanced fetch wrapper with automatic auth headers
 */
export async function authFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const headers = {
    'Content-Type': 'application/json',
    ...AuthManager.getAuthHeader(),
    ...options.headers,
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  // Handle auth errors
  if (response.status === 401 || response.status === 403) {
    AuthManager.handleAuthError();
    throw new Error('Authentication required');
  }

  return response;
}