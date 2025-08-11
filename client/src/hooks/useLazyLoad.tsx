import { useEffect, useRef, useState } from 'react';

interface UseLazyLoadOptions {
  rootMargin?: string;
  threshold?: number;
  once?: boolean;
}

export function useLazyLoad(options: UseLazyLoadOptions = {}) {
  const {
    rootMargin = '50px',
    threshold = 0.1,
    once = true,
  } = options;

  const [isVisible, setIsVisible] = useState(false);
  const [hasBeenVisible, setHasBeenVisible] = useState(false);
  const elementRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const isIntersecting = entry.isIntersecting;
        
        setIsVisible(isIntersecting);
        
        if (isIntersecting && !hasBeenVisible) {
          setHasBeenVisible(true);
          
          if (once) {
            observer.disconnect();
          }
        }
      },
      {
        rootMargin,
        threshold,
      }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [rootMargin, threshold, once, hasBeenVisible]);

  return {
    elementRef,
    isVisible,
    hasBeenVisible,
  };
}

// Hook for lazy loading with loading state
export function useLazyLoadWithState<T>(
  loadFunction: () => Promise<T>,
  options: UseLazyLoadOptions = {}
) {
  const { isVisible, hasBeenVisible, elementRef } = useLazyLoad(options);
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (hasBeenVisible && !data && !loading) {
      setLoading(true);
      setError(null);
      
      loadFunction()
        .then(setData)
        .catch(setError)
        .finally(() => setLoading(false));
    }
  }, [hasBeenVisible, data, loading, loadFunction]);

  return {
    elementRef,
    isVisible,
    hasBeenVisible,
    data,
    loading,
    error,
    reload: () => {
      setData(null);
      setError(null);
      if (hasBeenVisible) {
        setLoading(true);
        loadFunction()
          .then(setData)
          .catch(setError)
          .finally(() => setLoading(false));
      }
    },
  };
}

// Hook for lazy loading components
export function useLazyComponent<T extends React.ComponentType<any>>(
  importFunction: () => Promise<{ default: T }>,
  options: UseLazyLoadOptions = {}
) {
  const { elementRef, hasBeenVisible } = useLazyLoad(options);
  const [Component, setComponent] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (hasBeenVisible && !Component && !loading) {
      setLoading(true);
      setError(null);
      
      importFunction()
        .then(module => setComponent(() => module.default))
        .catch(setError)
        .finally(() => setLoading(false));
    }
  }, [hasBeenVisible, Component, loading, importFunction]);

  return {
    elementRef,
    Component,
    loading,
    error,
  };
}

// Hook for infinite scrolling
export function useInfiniteScroll(
  loadMore: () => Promise<void>,
  options: {
    threshold?: number;
    rootMargin?: string;
    hasMore?: boolean;
    disabled?: boolean;
  } = {}
) {
  const {
    threshold = 0.1,
    rootMargin = '100px',
    hasMore = true,
    disabled = false,
  } = options;

  const [loading, setLoading] = useState(false);
  const elementRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element || disabled || !hasMore) return;

    const observer = new IntersectionObserver(
      async ([entry]) => {
        if (entry.isIntersecting && !loading) {
          setLoading(true);
          try {
            await loadMore();
          } finally {
            setLoading(false);
          }
        }
      },
      {
        threshold,
        rootMargin,
      }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [loadMore, threshold, rootMargin, disabled, hasMore, loading]);

  return {
    elementRef,
    loading,
  };
}

// Utility for preloading resources when they come into view
export function useResourcePreloader(
  resources: string[],
  options: UseLazyLoadOptions = {}
) {
  const { hasBeenVisible, elementRef } = useLazyLoad(options);
  const [preloaded, setPreloaded] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!hasBeenVisible) return;

    const preloadPromises = resources
      .filter(resource => !preloaded.has(resource))
      .map(resource => {
        // Determine resource type and preload accordingly
        if (resource.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i)) {
          // Image preloading
          return new Promise<void>((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve();
            img.onerror = reject;
            img.src = resource;
          });
        } else if (resource.match(/\.(js|ts)$/i)) {
          // JavaScript module preloading
          return import(/* @vite-ignore */ resource).catch(() => {});
        } else if (resource.match(/\.(css)$/i)) {
          // CSS preloading
          return new Promise<void>((resolve) => {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.as = 'style';
            link.href = resource;
            link.onload = () => resolve();
            link.onerror = () => resolve(); // Don't fail on CSS errors
            document.head.appendChild(link);
          });
        }
        return Promise.resolve();
      });

    Promise.allSettled(preloadPromises).then(() => {
      setPreloaded(prev => new Set([...Array.from(prev), ...resources]));
    });
  }, [hasBeenVisible, resources, preloaded]);

  return {
    elementRef,
    preloaded: preloaded.size,
    total: resources.length,
    isComplete: preloaded.size === resources.length,
  };
}