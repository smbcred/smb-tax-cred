import { Request, Response, NextFunction } from 'express';
import { createHash } from 'crypto';

// Rate limiter store interface
interface RateLimitStore {
  get(key: string): Promise<{ count: number; resetTime: number } | null>;
  set(key: string, count: number, resetTime: number): Promise<void>;
  increment(key: string): Promise<{ count: number; resetTime: number }>;
}

// In-memory rate limit store
class MemoryStore implements RateLimitStore {
  private store = new Map<string, { count: number; resetTime: number }>();

  async get(key: string): Promise<{ count: number; resetTime: number } | null> {
    const entry = this.store.get(key);
    
    if (!entry) {
      return null;
    }

    // Clean up expired entries
    if (Date.now() > entry.resetTime) {
      this.store.delete(key);
      return null;
    }

    return entry;
  }

  async set(key: string, count: number, resetTime: number): Promise<void> {
    this.store.set(key, { count, resetTime });
  }

  async increment(key: string): Promise<{ count: number; resetTime: number }> {
    const existing = await this.get(key);
    
    if (!existing) {
      const resetTime = Date.now() + 60 * 1000; // 1 minute window
      await this.set(key, 1, resetTime);
      return { count: 1, resetTime };
    }

    const newCount = existing.count + 1;
    await this.set(key, newCount, existing.resetTime);
    return { count: newCount, resetTime: existing.resetTime };
  }
}

// Rate limiter configuration
interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  max: number; // Maximum requests per window
  message?: string; // Error message when limit exceeded
  standardHeaders?: boolean; // Include rate limit headers
  keyGenerator?: (req: Request) => string; // Custom key generator
  skip?: (req: Request) => boolean; // Skip rate limiting for certain requests
  onLimitReached?: (req: Request, res: Response) => void; // Callback when limit is reached
  store?: RateLimitStore; // Custom store implementation
}

// Default configuration
const defaultConfig: RateLimitConfig = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  message: 'Too many requests, please try again later.',
  standardHeaders: true,
  keyGenerator: (req: Request) => {
    // Use IP address and user agent for key generation
    const ip = req.ip || req.connection.remoteAddress || '';
    const userAgent = req.get('user-agent') || '';
    return createHash('sha256').update(`${ip}:${userAgent}`).digest('hex');
  },
  skip: () => false,
  store: new MemoryStore(),
};

// Rate limiting middleware
export function rateLimit(config: Partial<RateLimitConfig> = {}) {
  const options = { ...defaultConfig, ...config };
  
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Skip rate limiting if specified
      if (options.skip && options.skip(req)) {
        return next();
      }

      const key = options.keyGenerator!(req);
      const { count, resetTime } = await options.store!.increment(key);

      // Set rate limit headers
      if (options.standardHeaders) {
        res.set({
          'X-RateLimit-Limit': options.max.toString(),
          'X-RateLimit-Remaining': Math.max(0, options.max - count).toString(),
          'X-RateLimit-Reset': Math.ceil(resetTime / 1000).toString(),
        });
      }

      // Check if limit exceeded
      if (count > options.max) {
        if (options.onLimitReached) {
          options.onLimitReached(req, res);
        }

        return res.status(429).json({
          error: 'Rate limit exceeded',
          message: options.message,
          retryAfter: Math.ceil((resetTime - Date.now()) / 1000),
        });
      }

      next();
    } catch (error) {
      console.error('Rate limiting error:', error);
      // Continue processing if rate limiter fails
      next();
    }
  };
}

// Strict rate limiter for sensitive endpoints
export function strictRateLimit(max = 10, windowMs = 60 * 1000) {
  return rateLimit({
    max,
    windowMs,
    message: 'Too many attempts. Please wait before trying again.',
    keyGenerator: (req: Request) => {
      // Include user ID if available for authenticated requests
      const userId = (req as any).user?.id || '';
      const ip = req.ip || req.connection.remoteAddress || '';
      return createHash('sha256').update(`${ip}:${userId}`).digest('hex');
    },
  });
}

// API rate limiter for general endpoints
export function apiRateLimit(max = 1000, windowMs = 15 * 60 * 1000) {
  return rateLimit({
    max,
    windowMs,
    message: 'API rate limit exceeded. Please slow down your requests.',
  });
}

// Authentication rate limiter
export function authRateLimit() {
  return rateLimit({
    max: 5, // 5 attempts per 15 minutes
    windowMs: 15 * 60 * 1000,
    message: 'Too many authentication attempts. Please try again later.',
    keyGenerator: (req: Request) => {
      // Rate limit by IP and email/username if provided
      const ip = req.ip || req.connection.remoteAddress || '';
      const identifier = req.body?.email || req.body?.username || '';
      return createHash('sha256').update(`auth:${ip}:${identifier}`).digest('hex');
    },
  });
}

// Sliding window rate limiter (more accurate)
export function slidingWindowRateLimit(config: Partial<RateLimitConfig> = {}) {
  const options = { ...defaultConfig, ...config };
  const requests = new Map<string, number[]>();

  return (req: Request, res: Response, next: NextFunction) => {
    try {
      if (options.skip && options.skip(req)) {
        return next();
      }

      const key = options.keyGenerator!(req);
      const now = Date.now();
      const windowStart = now - options.windowMs;

      // Get existing requests for this key
      const keyRequests = requests.get(key) || [];
      
      // Filter out requests outside the window
      const validRequests = keyRequests.filter(timestamp => timestamp > windowStart);
      
      // Add current request
      validRequests.push(now);
      requests.set(key, validRequests);

      // Set rate limit headers
      if (options.standardHeaders) {
        const remaining = Math.max(0, options.max - validRequests.length);
        const resetTime = Math.ceil((windowStart + options.windowMs) / 1000);
        
        res.set({
          'X-RateLimit-Limit': options.max.toString(),
          'X-RateLimit-Remaining': remaining.toString(),
          'X-RateLimit-Reset': resetTime.toString(),
        });
      }

      // Check if limit exceeded
      if (validRequests.length > options.max) {
        if (options.onLimitReached) {
          options.onLimitReached(req, res);
        }

        return res.status(429).json({
          error: 'Rate limit exceeded',
          message: options.message,
          retryAfter: Math.ceil(options.windowMs / 1000),
        });
      }

      next();
    } catch (error) {
      console.error('Sliding window rate limiting error:', error);
      next();
    }
  };
}

// Distributed rate limiter (for use with Redis in production)
export class DistributedRateLimit {
  // Placeholder for Redis-based implementation
  // In production, this would use Redis for shared state across servers
  
  static create(config: Partial<RateLimitConfig> = {}) {
    // For now, fall back to memory-based rate limiting
    return rateLimit(config);
  }
}

// Rate limit by user ID (for authenticated endpoints)
export function userRateLimit(max = 100, windowMs = 60 * 1000) {
  return rateLimit({
    max,
    windowMs,
    message: 'User rate limit exceeded. Please slow down your requests.',
    keyGenerator: (req: Request) => {
      const userId = (req as any).user?.id;
      if (!userId) {
        // Fall back to IP if no user ID
        return req.ip || req.connection.remoteAddress || 'anonymous';
      }
      return `user:${userId}`;
    },
    skip: (req: Request) => {
      // Skip if user is not authenticated
      return !(req as any).user?.id;
    },
  });
}

// Export store for testing and monitoring
export { MemoryStore };