// Performance utilities for frontend optimization

// Web Vitals tracking
interface WebVitalsMetric {
  name: string;
  value: number;
  delta: number;
  id: string;
  entries: PerformanceEntry[];
}

class PerformanceMonitor {
  private metrics: Map<string, number> = new Map();
  private observers: PerformanceObserver[] = [];

  constructor() {
    this.initWebVitals();
    this.initResourceObserver();
  }

  private initWebVitals() {
    // Core Web Vitals monitoring
    if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
      // Largest Contentful Paint (LCP)
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1] as PerformanceEntry & {
          renderTime?: number;
          loadTime?: number;
        };
        
        if (lastEntry) {
          const value = lastEntry.renderTime || lastEntry.loadTime || lastEntry.startTime;
          this.metrics.set('LCP', value);
          this.reportMetric('LCP', value);
        }
      });

      try {
        lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
        this.observers.push(lcpObserver);
      } catch (e) {
        console.warn('LCP observer not supported');
      }

      // First Input Delay (FID)
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: PerformanceEntry & { processingStart?: number }) => {
          const value = entry.processingStart ? entry.processingStart - entry.startTime : 0;
          this.metrics.set('FID', value);
          this.reportMetric('FID', value);
        });
      });

      try {
        fidObserver.observe({ type: 'first-input', buffered: true });
        this.observers.push(fidObserver);
      } catch (e) {
        console.warn('FID observer not supported');
      }

      // Cumulative Layout Shift (CLS)
      let clsValue = 0;
      const clsObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: PerformanceEntry & { value?: number; hadRecentInput?: boolean }) => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value || 0;
          }
        });
        this.metrics.set('CLS', clsValue);
        this.reportMetric('CLS', clsValue);
      });

      try {
        clsObserver.observe({ type: 'layout-shift', buffered: true });
        this.observers.push(clsObserver);
      } catch (e) {
        console.warn('CLS observer not supported');
      }
    }
  }

  private initResourceObserver() {
    if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
      const resourceObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          if (entry.entryType === 'resource') {
            const resourceEntry = entry as PerformanceResourceTiming;
            this.trackResourceTiming(resourceEntry);
          }
        });
      });

      try {
        resourceObserver.observe({ type: 'resource', buffered: true });
        this.observers.push(resourceObserver);
      } catch (e) {
        console.warn('Resource observer not supported');
      }
    }
  }

  private trackResourceTiming(entry: PerformanceResourceTiming) {
    const resourceType = this.getResourceType(entry.name);
    const duration = entry.responseEnd - entry.requestStart;
    
    // Track slow resources
    if (duration > 1000) { // Slower than 1 second
      console.warn(`Slow ${resourceType} resource:`, {
        name: entry.name,
        duration: Math.round(duration),
        size: entry.transferSize,
      });
    }

    // Track resource cache performance
    if (entry.transferSize === 0 && entry.decodedBodySize > 0) {
      // Resource was served from cache
      this.reportMetric(`${resourceType}_cache_hit`, 1);
    }
  }

  private getResourceType(url: string): string {
    if (url.includes('.js')) return 'script';
    if (url.includes('.css')) return 'stylesheet';
    if (url.match(/\.(jpg|jpeg|png|gif|webp|svg)$/)) return 'image';
    if (url.includes('/api/')) return 'api';
    return 'other';
  }

  private reportMetric = (name: string, value: number) => {
    // In a real app, send to analytics service
    if (process.env.NODE_ENV === 'development') {
      console.log(`Performance metric: ${name} = ${Math.round(value * 100) / 100}`);
    }
  }

  getMetrics(): Record<string, number> {
    return Object.fromEntries(this.metrics);
  }

  disconnect() {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
  }
}

// Singleton instance
export const performanceMonitor = new PerformanceMonitor();

// Resource preloading utilities
export class ResourcePreloader {
  private preloadedResources = new Set<string>();

  preloadImage(src: string): Promise<void> {
    if (this.preloadedResources.has(src)) {
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        this.preloadedResources.add(src);
        resolve();
      };
      img.onerror = reject;
      img.src = src;
    });
  }

  preloadScript(src: string): Promise<void> {
    if (this.preloadedResources.has(src)) {
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'script';
      link.href = src;
      link.onload = () => {
        this.preloadedResources.add(src);
        resolve();
      };
      link.onerror = reject;
      document.head.appendChild(link);
    });
  }

  preloadStylesheet(href: string): Promise<void> {
    if (this.preloadedResources.has(href)) {
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'style';
      link.href = href;
      link.onload = () => {
        this.preloadedResources.add(href);
        resolve();
      };
      link.onerror = reject;
      document.head.appendChild(link);
    });
  }

  prefetchResource(href: string): void {
    if (this.preloadedResources.has(href)) {
      return;
    }

    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = href;
    document.head.appendChild(link);
    this.preloadedResources.add(href);
  }
}

export const resourcePreloader = new ResourcePreloader();

// Debouncing and throttling utilities
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
  immediate = false
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | undefined;
  
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = undefined;
      if (!immediate) func(...args);
    };
    
    const callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    
    if (callNow) func(...args);
  };
}

export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  
  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

// Memory usage monitoring
export function getMemoryUsage(): {
  used: number;
  total: number;
  percentage: number;
} | null {
  if (typeof window !== 'undefined' && 'memory' in performance) {
    const memory = (performance as any).memory;
    return {
      used: memory.usedJSHeapSize,
      total: memory.totalJSHeapSize,
      percentage: Math.round((memory.usedJSHeapSize / memory.totalJSHeapSize) * 100),
    };
  }
  return null;
}

// Bundle size tracking
export function trackBundleSize() {
  if (typeof window !== 'undefined') {
    // Track the initial bundle size
    const navigationEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    if (navigationEntry) {
      const bundleSize = navigationEntry.transferSize;
      performanceMonitor['reportMetric']('bundle_size', bundleSize);
    }
  }
}

// Critical resource hints
export function addResourceHints() {
  if (typeof document === 'undefined') return;

  // DNS prefetch for external domains
  const domains = [
    'fonts.googleapis.com',
    'fonts.gstatic.com',
    'api.stripe.com',
  ];

  domains.forEach(domain => {
    const link = document.createElement('link');
    link.rel = 'dns-prefetch';
    link.href = `//${domain}`;
    document.head.appendChild(link);
  });

  // Preconnect to critical domains
  const criticalDomains = [
    'fonts.googleapis.com',
    'api.stripe.com',
  ];

  criticalDomains.forEach(domain => {
    const link = document.createElement('link');
    link.rel = 'preconnect';
    link.href = `https://${domain}`;
    link.crossOrigin = 'anonymous';
    document.head.appendChild(link);
  });
}

// Initialize performance optimizations
export function initPerformanceOptimizations() {
  if (typeof window !== 'undefined') {
    // Add resource hints
    addResourceHints();
    
    // Track bundle size
    trackBundleSize();
    
    // Report initial metrics after page load
    window.addEventListener('load', () => {
      setTimeout(() => {
        const metrics = performanceMonitor.getMetrics();
        console.log('Performance metrics:', metrics);
      }, 1000);
    });
  }
}

// Cleanup function
export function cleanupPerformanceMonitoring() {
  performanceMonitor.disconnect();
}