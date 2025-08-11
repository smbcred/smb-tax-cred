// Advanced caching strategies for frontend performance
import React from 'react';

// Memory cache with TTL and size limits
class MemoryCache<T = any> {
  private cache = new Map<string, { data: T; expires: number; accessed: number }>();
  private maxSize: number;
  private defaultTTL: number;

  constructor(maxSize = 100, defaultTTL = 5 * 60 * 1000) { // 5 minutes default
    this.maxSize = maxSize;
    this.defaultTTL = defaultTTL;
  }

  set(key: string, data: T, ttl = this.defaultTTL): void {
    // Remove expired entries and enforce size limit
    this.cleanup();
    
    if (this.cache.size >= this.maxSize) {
      // Remove least recently used item
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

  get(key: string): T | undefined {
    const item = this.cache.get(key);
    
    if (!item) {
      return undefined;
    }

    if (Date.now() > item.expires) {
      this.cache.delete(key);
      return undefined;
    }

    // Update access time for LRU
    item.accessed = Date.now();
    return item.data;
  }

  has(key: string): boolean {
    const item = this.cache.get(key);
    
    if (!item) {
      return false;
    }

    if (Date.now() > item.expires) {
      this.cache.delete(key);
      return false;
    }

    return true;
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

  getStats(): {
    size: number;
    maxSize: number;
    hitRate: number;
  } {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      hitRate: 0, // Would need to track hits/misses for real implementation
    };
  }
}

// Persistent cache using IndexedDB
class IndexedDBCache {
  private dbName = 'app-cache';
  private dbVersion = 1;
  private storeName = 'cache-store';
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        if (!db.objectStoreNames.contains(this.storeName)) {
          const store = db.createObjectStore(this.storeName, { keyPath: 'key' });
          store.createIndex('expires', 'expires', { unique: false });
        }
      };
    });
  }

  async set(key: string, data: any, ttl = 24 * 60 * 60 * 1000): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      
      const item = {
        key,
        data,
        expires: Date.now() + ttl,
        created: Date.now(),
      };

      const request = store.put(item);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async get(key: string): Promise<any> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const request = store.get(key);

      request.onsuccess = () => {
        const item = request.result;
        
        if (!item) {
          resolve(undefined);
          return;
        }

        if (Date.now() > item.expires) {
          // Item expired, remove it
          this.delete(key);
          resolve(undefined);
          return;
        }

        resolve(item.data);
      };

      request.onerror = () => reject(request.error);
    });
  }

  async delete(key: string): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.delete(key);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async clear(): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.clear();

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async cleanup(): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const index = store.index('expires');
      
      const range = IDBKeyRange.upperBound(Date.now());
      const request = index.openCursor(range);

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        if (cursor) {
          cursor.delete();
          cursor.continue();
        } else {
          resolve();
        }
      };

      request.onerror = () => reject(request.error);
    });
  }
}

// Service Worker cache management
class ServiceWorkerCache {
  private cacheName = 'app-cache-v1';

  async set(key: string, response: Response): Promise<void> {
    if ('caches' in window) {
      const cache = await caches.open(this.cacheName);
      await cache.put(key, response);
    }
  }

  async get(key: string): Promise<Response | undefined> {
    if ('caches' in window) {
      const cache = await caches.open(this.cacheName);
      return cache.match(key);
    }
    return undefined;
  }

  async delete(key: string): Promise<boolean> {
    if ('caches' in window) {
      const cache = await caches.open(this.cacheName);
      return cache.delete(key);
    }
    return false;
  }

  async clear(): Promise<void> {
    if ('caches' in window) {
      await caches.delete(this.cacheName);
    }
  }

  async preCache(urls: string[]): Promise<void> {
    if ('caches' in window) {
      const cache = await caches.open(this.cacheName);
      await cache.addAll(urls);
    }
  }
}

// Multi-level cache strategy
export class CacheManager {
  private memoryCache = new MemoryCache();
  private indexedDBCache = new IndexedDBCache();
  private serviceWorkerCache = new ServiceWorkerCache();
  
  constructor() {
    // Initialize IndexedDB cache
    this.indexedDBCache.init().catch(console.error);
    
    // Cleanup expired entries periodically
    setInterval(() => {
      this.indexedDBCache.cleanup().catch(console.error);
    }, 10 * 60 * 1000); // Every 10 minutes
  }

  async get(key: string): Promise<any> {
    // Try memory cache first (fastest)
    let data = this.memoryCache.get(key);
    if (data !== undefined) {
      return data;
    }

    // Try IndexedDB cache
    data = await this.indexedDBCache.get(key);
    if (data !== undefined) {
      // Promote to memory cache
      this.memoryCache.set(key, data);
      return data;
    }

    return undefined;
  }

  async set(key: string, data: any, options: {
    memoryTTL?: number;
    persistentTTL?: number;
    skipMemory?: boolean;
    skipPersistent?: boolean;
  } = {}): Promise<void> {
    const {
      memoryTTL = 5 * 60 * 1000, // 5 minutes
      persistentTTL = 24 * 60 * 60 * 1000, // 24 hours
      skipMemory = false,
      skipPersistent = false,
    } = options;

    // Store in memory cache
    if (!skipMemory) {
      this.memoryCache.set(key, data, memoryTTL);
    }

    // Store in persistent cache
    if (!skipPersistent) {
      await this.indexedDBCache.set(key, data, persistentTTL);
    }
  }

  async delete(key: string): Promise<void> {
    this.memoryCache.delete(key);
    await this.indexedDBCache.delete(key);
  }

  async clear(): Promise<void> {
    this.memoryCache.clear();
    await this.indexedDBCache.clear();
    await this.serviceWorkerCache.clear();
  }

  // Cache API responses
  async cacheResponse(url: string, response: Response): Promise<void> {
    const clonedResponse = response.clone();
    await this.serviceWorkerCache.set(url, clonedResponse);
  }

  async getCachedResponse(url: string): Promise<Response | undefined> {
    return this.serviceWorkerCache.get(url);
  }

  // Preload critical resources
  async preloadResources(urls: string[]): Promise<void> {
    await this.serviceWorkerCache.preCache(urls);
  }

  getStats(): {
    memoryCache: any;
  } {
    return {
      memoryCache: this.memoryCache.getStats(),
    };
  }
}

// Singleton instance
export const cacheManager = new CacheManager();

// React hook for cached data
export function useCachedData<T>(
  key: string,
  fetcher: () => Promise<T>,
  options: {
    memoryTTL?: number;
    persistentTTL?: number;
    staleWhileRevalidate?: boolean;
  } = {}
) {
  const [data, setData] = React.useState<T | undefined>();
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<Error | null>(null);

  React.useEffect(() => {
    const loadData = async () => {
      try {
        setError(null);
        
        // Try to get from cache first
        const cachedData = await cacheManager.get(key);
        if (cachedData !== undefined) {
          setData(cachedData);
          
          // If stale-while-revalidate, fetch fresh data in background
          if (options.staleWhileRevalidate) {
            fetcher()
              .then(freshData => {
                setData(freshData);
                return cacheManager.set(key, freshData, options);
              })
              .catch(console.error);
          }
          return;
        }

        // No cached data, fetch fresh
        setLoading(true);
        const freshData = await fetcher();
        setData(freshData);
        await cacheManager.set(key, freshData, options);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [key]);

  const refetch = async () => {
    try {
      setLoading(true);
      setError(null);
      const freshData = await fetcher();
      setData(freshData);
      await cacheManager.set(key, freshData, options);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  const invalidate = async () => {
    await cacheManager.delete(key);
    setData(undefined);
  };

  return {
    data,
    loading,
    error,
    refetch,
    invalidate,
  };
}

// Cache keys utility
export const CacheKeys = {
  user: (id: string) => `user:${id}`,
  calculation: (id: string) => `calculation:${id}`,
  company: (id: string) => `company:${id}`,
  intakeForm: (id: string) => `intake-form:${id}`,
  dashboard: (userId: string) => `dashboard:${userId}`,
  pricing: () => 'pricing',
  settings: (userId: string) => `settings:${userId}`,
} as const;