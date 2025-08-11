// Client-side security utilities

// XSS prevention utilities
export function sanitizeHtml(input: string): string {
  const div = document.createElement('div');
  div.textContent = input;
  return div.innerHTML;
}

export function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Safe URL validation
export function isValidUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    return ['http:', 'https:'].includes(urlObj.protocol);
  } catch {
    return false;
  }
}

export function isSafeUrl(url: string): boolean {
  if (!isValidUrl(url)) return false;
  
  const urlObj = new URL(url);
  
  // Block dangerous protocols
  if (['javascript:', 'data:', 'vbscript:', 'file:'].includes(urlObj.protocol)) {
    return false;
  }
  
  // Allow only trusted domains in production
  if (process.env.NODE_ENV === 'production') {
    const trustedDomains = [
      'smbtaxcredits.com',
      'stripe.com',
      'js.stripe.com',
    ];
    
    return trustedDomains.some(domain => 
      urlObj.hostname === domain || urlObj.hostname.endsWith(`.${domain}`)
    );
  }
  
  return true;
}

// CSRF token management
export class CSRFManager {
  private static token: string | null = null;
  private static readonly CSRF_HEADER = 'X-CSRF-Token';
  private static readonly CSRF_COOKIE = 'XSRF-TOKEN';

  static async getToken(): Promise<string> {
    if (this.token) {
      return this.token;
    }

    // Try to get token from cookie first
    const cookieToken = this.getTokenFromCookie();
    if (cookieToken) {
      this.token = cookieToken;
      return cookieToken;
    }

    // Fetch new token from server
    try {
      const response = await fetch('/api/csrf-token', {
        credentials: 'include',
      });
      
      if (response.ok) {
        const data = await response.json();
        this.token = data.csrfToken;
        return this.token;
      }
    } catch (error) {
      console.error('Failed to fetch CSRF token:', error);
    }

    throw new Error('Unable to obtain CSRF token');
  }

  static getTokenFromCookie(): string | null {
    const cookies = document.cookie.split(';');
    for (const cookie of cookies) {
      const [name, value] = cookie.trim().split('=');
      if (name === this.CSRF_COOKIE) {
        return decodeURIComponent(value);
      }
    }
    return null;
  }

  static async getHeaders(): Promise<Record<string, string>> {
    const token = await this.getToken();
    return {
      [this.CSRF_HEADER]: token,
    };
  }

  static clearToken(): void {
    this.token = null;
  }

  static async refreshToken(): Promise<string> {
    try {
      const response = await fetch('/api/csrf-token/refresh', {
        method: 'POST',
        credentials: 'include',
      });
      
      if (response.ok) {
        const data = await response.json();
        this.token = data.csrfToken;
        return this.token;
      }
    } catch (error) {
      console.error('Failed to refresh CSRF token:', error);
    }

    // Fall back to getting new token
    this.clearToken();
    return this.getToken();
  }
}

// Secure API request wrapper
export async function secureApiRequest(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  try {
    // Add CSRF headers for state-changing requests
    if (options.method && !['GET', 'HEAD', 'OPTIONS'].includes(options.method.toUpperCase())) {
      const csrfHeaders = await CSRFManager.getHeaders();
      options.headers = {
        ...options.headers,
        ...csrfHeaders,
      };
    }

    // Ensure credentials are included for authentication
    options.credentials = 'include';

    const response = await fetch(url, options);

    // Handle CSRF token expiration
    if (response.status === 403) {
      const errorData = await response.clone().json().catch(() => ({}));
      if (errorData.error?.includes('CSRF')) {
        // Refresh token and retry once
        await CSRFManager.refreshToken();
        const retryHeaders = await CSRFManager.getHeaders();
        
        options.headers = {
          ...options.headers,
          ...retryHeaders,
        };

        return fetch(url, options);
      }
    }

    return response;
  } catch (error) {
    console.error('Secure API request failed:', error);
    throw error;
  }
}

// Password strength validation
export interface PasswordStrength {
  score: number; // 0-4
  feedback: string[];
  isStrong: boolean;
}

export function checkPasswordStrength(password: string): PasswordStrength {
  const feedback: string[] = [];
  let score = 0;

  // Length check
  if (password.length >= 8) {
    score++;
  } else {
    feedback.push('Use at least 8 characters');
  }

  // Character variety checks
  if (/[a-z]/.test(password)) score++;
  else feedback.push('Include lowercase letters');

  if (/[A-Z]/.test(password)) score++;
  else feedback.push('Include uppercase letters');

  if (/\d/.test(password)) score++;
  else feedback.push('Include numbers');

  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) score++;
  else feedback.push('Include special characters');

  // Length bonus
  if (password.length >= 12) score = Math.min(score + 1, 4);

  // Penalty for common patterns
  if (/(.)\1{2,}/.test(password)) {
    score = Math.max(score - 1, 0);
    feedback.push('Avoid repeated characters');
  }

  if (/123|abc|qwerty|password/i.test(password)) {
    score = Math.max(score - 1, 0);
    feedback.push('Avoid common patterns');
  }

  return {
    score,
    feedback,
    isStrong: score >= 3,
  };
}

// Content Security Policy helpers
export function isScriptAllowed(src: string): boolean {
  const allowedScriptSources = [
    self.location.origin,
    'https://js.stripe.com',
    'https://www.googletagmanager.com',
  ];

  try {
    const url = new URL(src, window.location.origin);
    return allowedScriptSources.some(allowed => {
      const allowedUrl = new URL(allowed);
      return url.origin === allowedUrl.origin;
    });
  } catch {
    return false;
  }
}

// Local storage security
export class SecureStorage {
  private static readonly PREFIX = 'sbc_';
  private static readonly ENCRYPTION_KEY = 'user-session-key';

  static setItem(key: string, value: any, encrypt = false): void {
    try {
      const data = JSON.stringify(value);
      const finalData = encrypt ? this.encrypt(data) : data;
      localStorage.setItem(this.PREFIX + key, finalData);
    } catch (error) {
      console.error('Failed to save to secure storage:', error);
    }
  }

  static getItem<T>(key: string, decrypt = false): T | null {
    try {
      const data = localStorage.getItem(this.PREFIX + key);
      if (!data) return null;

      const finalData = decrypt ? this.decrypt(data) : data;
      return JSON.parse(finalData);
    } catch (error) {
      console.error('Failed to read from secure storage:', error);
      return null;
    }
  }

  static removeItem(key: string): void {
    localStorage.removeItem(this.PREFIX + key);
  }

  static clear(): void {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith(this.PREFIX)) {
        localStorage.removeItem(key);
      }
    });
  }

  private static encrypt(data: string): string {
    // Simple XOR encryption for client-side obfuscation
    // Note: This is not cryptographically secure, just basic obfuscation
    const key = this.ENCRYPTION_KEY;
    let result = '';
    
    for (let i = 0; i < data.length; i++) {
      result += String.fromCharCode(
        data.charCodeAt(i) ^ key.charCodeAt(i % key.length)
      );
    }
    
    return btoa(result);
  }

  private static decrypt(encryptedData: string): string {
    try {
      const data = atob(encryptedData);
      const key = this.ENCRYPTION_KEY;
      let result = '';
      
      for (let i = 0; i < data.length; i++) {
        result += String.fromCharCode(
          data.charCodeAt(i) ^ key.charCodeAt(i % key.length)
        );
      }
      
      return result;
    } catch {
      throw new Error('Failed to decrypt data');
    }
  }
}

// Input validation helpers
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 255;
}

export function validatePhoneNumber(phone: string): boolean {
  const phoneRegex = /^\+?[1-9]\d{1,14}$/;
  return phoneRegex.test(phone.replace(/\D/g, ''));
}

export function validateUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

// Rate limiting for client-side requests
export class ClientRateLimit {
  private static requests = new Map<string, number[]>();
  private static readonly WINDOW_MS = 60000; // 1 minute
  private static readonly MAX_REQUESTS = 60; // 60 requests per minute

  static canMakeRequest(endpoint: string): boolean {
    const now = Date.now();
    const windowStart = now - this.WINDOW_MS;
    
    const requests = this.requests.get(endpoint) || [];
    const recentRequests = requests.filter(time => time > windowStart);
    
    if (recentRequests.length >= this.MAX_REQUESTS) {
      return false;
    }

    recentRequests.push(now);
    this.requests.set(endpoint, recentRequests);
    
    return true;
  }

  static getRemainingRequests(endpoint: string): number {
    const now = Date.now();
    const windowStart = now - this.WINDOW_MS;
    
    const requests = this.requests.get(endpoint) || [];
    const recentRequests = requests.filter(time => time > windowStart);
    
    return Math.max(0, this.MAX_REQUESTS - recentRequests.length);
  }
}

// Security event reporting
export function reportSecurityEvent(event: string, details?: Record<string, any>): void {
  if (process.env.NODE_ENV === 'development') {
    console.warn('Security Event:', { event, details, timestamp: new Date().toISOString() });
  }

  // In production, send to monitoring service
  if (process.env.NODE_ENV === 'production') {
    secureApiRequest('/api/security/events', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        event,
        details,
        userAgent: navigator.userAgent,
        url: window.location.href,
      }),
    }).catch(error => {
      console.error('Failed to report security event:', error);
    });
  }
}