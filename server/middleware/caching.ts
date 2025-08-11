import { Request, Response, NextFunction } from 'express';
import { createHash } from 'crypto';

// In-memory cache with TTL and size limits
class MemoryCache {
  private cache = new Map<string, { data: any; expires: number; accessed: number }>();
  private maxSize: number;
  private defaultTTL: number;

  constructor(maxSize = 1000, defaultTTL = 5 * 60 * 1000) { // 5 minutes default
    this.maxSize = maxSize;
    this.defaultTTL = defaultTTL;
  }

  set(key: string, data: any, ttl = this.defaultTTL): void {
    this.cleanup();
    
    if (this.cache.size >= this.maxSize) {
      const lruKey = this.getLRUKey();
      if (lruKey) {
        this.cache.delete(lruKey);
      }
    }

    this.cache.set(key, {
      data,
      expires: Date.now() + ttl,
      accessed: Date.now(),
    });
  }

  get(key: string): any | undefined {
    const item = this.cache.get(key);
    
    if (!item || Date.now() > item.expires) {
      if (item) this.cache.delete(key);
      return undefined;
    }

    item.accessed = Date.now();
    return item.data;
  }

  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  private getLRUKey(): string | undefined {
    let lruKey: string | undefined;
    let oldestAccess = Date.now();

    this.cache.forEach((item, key) => {
      if (item.accessed < oldestAccess) {
        oldestAccess = item.accessed;
        lruKey = key;
      }
    });

    return lruKey;
  }

  private cleanup(): void {
    const now = Date.now();
    this.cache.forEach((item, key) => {
      if (now > item.expires) {
        this.cache.delete(key);
      }
    });
  }

  getStats(): { size: number; maxSize: number; hitRate: number } {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      hitRate: 0, // Would need hit/miss tracking for real implementation
    };
  }
}

// Singleton cache instance
const memoryCache = new MemoryCache();

// Generate cache key from request
function generateCacheKey(req: Request): string {
  const key = `${req.method}:${req.path}:${JSON.stringify(req.query)}:${req.get('user-agent') || ''}`;
  return createHash('sha256').update(key).digest('hex');
}

// Cache middleware for GET requests
export function cacheMiddleware(ttl = 5 * 60 * 1000) { // 5 minutes default
  return (req: Request, res: Response, next: NextFunction) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next();
    }

    // Skip caching for authenticated requests (unless specifically allowed)
    if (req.headers.authorization && !req.query.allowCache) {
      return next();
    }

    const cacheKey = generateCacheKey(req);
    const cachedData = memoryCache.get(cacheKey);

    if (cachedData) {
      // Set cache headers
      res.set({
        'X-Cache': 'HIT',
        'Cache-Control': `public, max-age=${Math.floor(ttl / 1000)}`,
      });
      
      return res.json(cachedData);
    }

    // Override res.json to cache the response
    const originalJson = res.json.bind(res);
    res.json = function(data: any) {
      // Only cache successful responses
      if (res.statusCode >= 200 && res.statusCode < 300) {
        memoryCache.set(cacheKey, data, ttl);
        res.set({
          'X-Cache': 'MISS',
          'Cache-Control': `public, max-age=${Math.floor(ttl / 1000)}`,
        });
      }
      
      return originalJson(data);
    };

    next();
  };
}

// Cache invalidation middleware
export function invalidateCache(patterns: string[] = []) {
  return (req: Request, res: Response, next: NextFunction) => {
    // Invalidate cache after successful POST/PUT/DELETE operations
    res.on('finish', () => {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        if (patterns.length > 0) {
          // Invalidate specific patterns
          patterns.forEach(pattern => {
            // Simple pattern matching - in production, use more sophisticated approach
            memoryCache.delete(pattern);
          });
        } else {
          // Clear all cache if no patterns specified
          memoryCache.clear();
        }
      }
    });

    next();
  };
}

// Cache statistics endpoint
export function getCacheStats() {
  return memoryCache.getStats();
}

// Response compression middleware
export function compressionMiddleware() {
  return (req: Request, res: Response, next: NextFunction) => {
    const acceptEncoding = req.headers['accept-encoding'] || '';
    
    // Only compress JSON responses
    const originalJson = res.json.bind(res);
    res.json = function(data: any) {
      if (acceptEncoding.includes('gzip')) {
        res.set('Content-Encoding', 'gzip');
      }
      
      return originalJson(data);
    };

    next();
  };
}

// ETag middleware for client-side caching
export function etagMiddleware() {
  return (req: Request, res: Response, next: NextFunction) => {
    const originalJson = res.json.bind(res);
    
    res.json = function(data: any) {
      // Generate ETag from response data
      const etag = createHash('md5').update(JSON.stringify(data)).digest('hex');
      res.set('ETag', `"${etag}"`);
      
      // Check if client has cached version
      const clientETag = req.headers['if-none-match'];
      if (clientETag === `"${etag}"`) {
        return res.status(304).end();
      }
      
      return originalJson(data);
    };

    next();
  };
}

// Database query result caching
export class QueryCache {
  private cache: MemoryCache;

  constructor(maxSize = 500, defaultTTL = 10 * 60 * 1000) { // 10 minutes default
    this.cache = new MemoryCache(maxSize, defaultTTL);
  }

  async get<T>(
    key: string,
    queryFn: () => Promise<T>,
    ttl?: number
  ): Promise<T> {
    const cachedResult = this.cache.get(key);
    
    if (cachedResult !== undefined) {
      return cachedResult;
    }

    const result = await queryFn();
    this.cache.set(key, result, ttl);
    
    return result;
  }

  invalidate(key: string): boolean {
    return this.cache.delete(key);
  }

  invalidatePattern(pattern: RegExp): void {
    // In a real implementation, you'd store keys and match against pattern
    this.cache.clear(); // Simplified for now
  }

  clear(): void {
    this.cache.clear();
  }

  getStats() {
    return this.cache.getStats();
  }
}

// Singleton query cache
export const queryCache = new QueryCache();

// Memoization utility for expensive operations
export function memoize<T extends (...args: any[]) => any>(
  fn: T,
  keyGenerator?: (...args: Parameters<T>) => string,
  ttl = 5 * 60 * 1000
): T {
  const cache = new Map<string, { result: ReturnType<T>; expires: number }>();

  return ((...args: Parameters<T>): ReturnType<T> => {
    const key = keyGenerator ? keyGenerator(...args) : JSON.stringify(args);
    const cached = cache.get(key);
    
    if (cached && Date.now() < cached.expires) {
      return cached.result;
    }

    const result = fn(...args);
    cache.set(key, { result, expires: Date.now() + ttl });
    
    return result;
  }) as T;
}

// Export cache instance for external use
export { memoryCache };