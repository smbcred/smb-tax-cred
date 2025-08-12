import { Request, Response, NextFunction } from 'express';
import { randomBytes, createHash , timingSafeEqual } from 'crypto';

// CSRF token store (in production, use Redis or database)
class CSRFTokenStore {
  private tokens = new Map<string, { token: string; expires: number; used: boolean }>();
  private readonly tokenTTL = 2 * 60 * 60 * 1000; // 2 hours

  generateToken(sessionId: string): string {
    const token = randomBytes(32).toString('hex');
    const expires = Date.now() + this.tokenTTL;
    
    this.tokens.set(sessionId, {
      token,
      expires,
      used: false,
    });

    // Cleanup expired tokens
    this.cleanup();
    
    return token;
  }

  validateToken(sessionId: string, token: string, consumeToken = true): boolean {
    const storedData = this.tokens.get(sessionId);
    
    if (!storedData) {
      return false;
    }

    // Check if token is expired
    if (Date.now() > storedData.expires) {
      this.tokens.delete(sessionId);
      return false;
    }

    // Check if token was already used (for one-time tokens)
    if (consumeToken && storedData.used) {
      return false;
    }

    // Timing-safe comparison to prevent timing attacks
    const isValid = timingSafeEqual(storedData.token, token);
    
    if (isValid && consumeToken) {
      storedData.used = true;
    }

    return isValid;
  }

  refreshToken(sessionId: string): string | null {
    const storedData = this.tokens.get(sessionId);
    
    if (!storedData || Date.now() > storedData.expires) {
      return null;
    }

    return this.generateToken(sessionId);
  }

  deleteToken(sessionId: string): boolean {
    return this.tokens.delete(sessionId);
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [sessionId, data] of this.tokens.entries()) {
      if (now > data.expires) {
        this.tokens.delete(sessionId);
      }
    }
  }

  getStats(): { total: number; expired: number; used: number } {
    const now = Date.now();
    let expired = 0;
    let used = 0;

    for (const data of this.tokens.values()) {
      if (now > data.expires) expired++;
      if (data.used) used++;
    }

    return {
      total: this.tokens.size,
      expired,
      used,
    };
  }
}

const csrfStore = new CSRFTokenStore();

// Generate session ID from request
function getSessionId(req: Request): string {
  // Use user ID if authenticated, otherwise use IP + User-Agent
  const userId = (req as any).user?.id;
  if (userId) {
    return `user:${userId}`;
  }

  const ip = req.ip || req.connection.remoteAddress || '';
  const userAgent = req.get('user-agent') || '';
  return createHash('sha256').update(`${ip}:${userAgent}`).digest('hex');
}

// Middleware to generate and provide CSRF token
export function csrfTokenProvider() {
  return (req: Request, res: Response, next: NextFunction) => {
    const sessionId = getSessionId(req);
    
    // Generate new token for this session
    const token = csrfStore.generateToken(sessionId);
    
    // Attach token to response locals for use in views/API
    res.locals.csrfToken = token;
    
    // Set token in cookie for SPA access
    res.cookie('XSRF-TOKEN', token, {
      httpOnly: false, // Allow JavaScript access for AJAX requests
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 2 * 60 * 60 * 1000, // 2 hours
    });

    next();
  };
}

// Middleware to validate CSRF token
export function csrfProtection(options: {
  skipMethods?: string[];
  skipPaths?: string[];
  consumeToken?: boolean;
} = {}) {
  const {
    skipMethods = ['GET', 'HEAD', 'OPTIONS'],
    skipPaths = [],
    consumeToken = false,
  } = options;

  return (req: Request, res: Response, next: NextFunction) => {
    // Skip CSRF protection for safe methods
    if (skipMethods.includes(req.method)) {
      return next();
    }

    // Skip CSRF protection for specified paths
    if (skipPaths.some(path => req.path.startsWith(path))) {
      return next();
    }

    const sessionId = getSessionId(req);
    
    // Get token from various sources
    const token = req.headers['x-csrf-token'] as string ||
               req.headers['x-xsrf-token'] as string ||
               req.body?._csrf ||
               req.query._csrf as string;

    if (!token) {
      console.warn('CSRF token missing:', {
        ip: req.ip,
        method: req.method,
        url: req.url,
        userAgent: req.get('user-agent'),
      });

      return res.status(403).json({
        error: 'CSRF token missing',
        message: 'Request must include a valid CSRF token',
      });
    }

    // Validate token
    const isValid = csrfStore.validateToken(sessionId, token, consumeToken);
    
    if (!isValid) {
      console.warn('CSRF token validation failed:', {
        ip: req.ip,
        method: req.method,
        url: req.url,
        sessionId,
        userAgent: req.get('user-agent'),
      });

      return res.status(403).json({
        error: 'CSRF token invalid',
        message: 'Invalid or expired CSRF token',
      });
    }

    next();
  };
}

// API endpoint to get CSRF token
export function csrfTokenEndpoint() {
  return (req: Request, res: Response) => {
    const sessionId = getSessionId(req);
    const token = csrfStore.generateToken(sessionId);
    
    res.json({
      csrfToken: token,
      expiresIn: 2 * 60 * 60, // 2 hours in seconds
    });
  };
}

// Refresh CSRF token endpoint
export function csrfTokenRefresh() {
  return (req: Request, res: Response) => {
    const sessionId = getSessionId(req);
    const newToken = csrfStore.refreshToken(sessionId);
    
    if (!newToken) {
      return res.status(404).json({
        error: 'No active session',
        message: 'Cannot refresh token for inactive session',
      });
    }

    // Update cookie with new token
    res.cookie('XSRF-TOKEN', newToken, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 2 * 60 * 60 * 1000,
    });

    res.json({
      csrfToken: newToken,
      expiresIn: 2 * 60 * 60,
    });
  };
}

// Middleware for form-based applications
export function csrfFormProtection() {
  return [
    csrfTokenProvider(),
    csrfProtection({
      skipMethods: ['GET', 'HEAD', 'OPTIONS'],
      consumeToken: true, // One-time use for forms
    }),
  ];
}

// Middleware for API applications
export function csrfApiProtection() {
  return [
    csrfTokenProvider(),
    csrfProtection({
      skipMethods: ['GET', 'HEAD', 'OPTIONS'],
      skipPaths: ['/api/auth/login', '/api/auth/register'], // Skip for initial auth
      consumeToken: false, // Reusable tokens for APIs
    }),
  ];
}

// Double Submit Cookie pattern
export function doubleSubmitCookieProtection() {
  return (req: Request, res: Response, next: NextFunction) => {
    if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
      return next();
    }

    const cookieToken = req.cookies?.['csrf-token'];
    const headerToken = req.headers['x-csrf-token'] as string;

    if (!cookieToken || !headerToken) {
      return res.status(403).json({
        error: 'CSRF protection failed',
        message: 'Missing CSRF tokens',
      });
    }

    if (!timingSafeEqual(cookieToken, headerToken)) {
      return res.status(403).json({
        error: 'CSRF protection failed',
        message: 'CSRF tokens do not match',
      });
    }

    next();
  };
}

// Stats endpoint for monitoring
export function csrfStats() {
  return (req: Request, res: Response) => {
    const stats = csrfStore.getStats();
    
    res.json({
      csrf: stats,
      timestamp: new Date().toISOString(),
    });
  };
}

// Export store for testing and monitoring
export { csrfStore };