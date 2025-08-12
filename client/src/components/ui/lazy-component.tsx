import React, { Suspense, lazy, ComponentType } from 'react';
import { useLazyComponent } from '@/hooks/useLazyLoad';

interface LazyComponentProps {
  importFunction: () => Promise<{ default: ComponentType<any> }>;
  fallback?: React.ReactNode;
  errorFallback?: React.ReactNode;
  className?: string;
  threshold?: number;
  rootMargin?: string;
  [key: string]: any;
}

// Higher-order component for lazy loading with intersection observer
export function LazyComponent({
  importFunction,
  fallback = <LazyComponentSkeleton />,
  errorFallback = <LazyComponentError />,
  className,
  threshold = 0.1,
  rootMargin = '50px',
  ...props
}: LazyComponentProps) {
  const { elementRef, Component, loading, error } = useLazyComponent(
    importFunction,
    { threshold, rootMargin }
  );

  if (error) {
    return (
      <div ref={elementRef as React.RefObject<HTMLDivElement>} className={className}>
        {errorFallback}
      </div>
    );
  }

  if (loading || !Component) {
    return (
      <div ref={elementRef as React.RefObject<HTMLDivElement>} className={className}>
        {fallback}
      </div>
    );
  }

  return (
    <div ref={elementRef as React.RefObject<HTMLDivElement>} className={className}>
      <Component {...props} />
    </div>
  );
}

// Default skeleton component
function LazyComponentSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-32 bg-gray-200 dark:bg-gray-800 rounded-lg"></div>
    </div>
  );
}

// Default error component
function LazyComponentError() {
  return (
    <div className="flex items-center justify-center h-32 bg-gray-100 dark:bg-gray-900 rounded-lg">
      <div className="text-center text-gray-500">
        <svg 
          className="w-8 h-8 mx-auto mb-2" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" 
          />
        </svg>
        <span className="text-sm">Failed to load component</span>
      </div>
    </div>
  );
}

// Utility function to create lazy routes
export function createLazyRoute(importFunction: () => Promise<{ default: ComponentType<any> }>) {
  return lazy(importFunction);
}

// Route-level lazy loading with better error boundaries
export function LazyRoute({
  importFunction,
  fallback,
  ...props
}: {
  importFunction: () => Promise<{ default: ComponentType<any> }>;
  fallback?: React.ReactNode;
  [key: string]: any;
}) {
  const LazyRouteComponent = lazy(importFunction);

  return (
    <Suspense fallback={fallback || <RouteLoadingSkeleton />}>
      <LazyRouteComponent {...props} />
    </Suspense>
  );
}

// Route loading skeleton
function RouteLoadingSkeleton() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      {/* Header skeleton */}
      <div className="animate-pulse">
        <div className="h-16 bg-gray-200 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="container mx-auto px-4 h-full flex items-center justify-between">
            <div className="h-8 w-32 bg-gray-300 dark:bg-gray-700 rounded"></div>
            <div className="flex space-x-4">
              <div className="h-8 w-20 bg-gray-300 dark:bg-gray-700 rounded"></div>
              <div className="h-8 w-20 bg-gray-300 dark:bg-gray-700 rounded"></div>
            </div>
          </div>
        </div>
        
        {/* Content skeleton */}
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="h-8 w-3/4 bg-gray-200 dark:bg-gray-800 rounded"></div>
            <div className="h-4 w-1/2 bg-gray-200 dark:bg-gray-800 rounded"></div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="space-y-4">
                  <div className="h-40 bg-gray-200 dark:bg-gray-800 rounded-lg"></div>
                  <div className="h-4 w-3/4 bg-gray-200 dark:bg-gray-800 rounded"></div>
                  <div className="h-4 w-1/2 bg-gray-200 dark:bg-gray-800 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Preload utility for lazy components
export function preloadComponent(importFunction: () => Promise<{ default: ComponentType<any> }>) {
  return importFunction();
}

// Bundle of lazy-loaded common components
export const LazyComponents = {
  // Dashboard components
  Dashboard: () => LazyRoute({
    importFunction: () => import('@/pages/dashboard'),
    fallback: <RouteLoadingSkeleton />,
  }),
  
  // Calculator placeholder
  Calculator: () => LazyRoute({
    importFunction: () => import('@/pages/landing'), // Use existing component as placeholder
    fallback: <div className="h-96 bg-gray-100 dark:bg-gray-900 rounded-lg animate-pulse" />,
  }),
  
  // Forms
  IntakeForm: () => LazyRoute({
    importFunction: () => import('@/pages/IntakeFormPage'),
    fallback: <div className="min-h-screen bg-gray-50 dark:bg-gray-950 animate-pulse" />,
  }),
};

// Hook for preloading components on user interaction
export function useComponentPreloader() {
  const preload = (componentName: keyof typeof LazyComponents) => {
    // This would be implemented based on your routing system
    if (import.meta.env.DEV) console.debug(`Preloading component: ${componentName}`);
  };

  const preloadOnHover = (componentName: keyof typeof LazyComponents) => {
    return {
      onMouseEnter: () => preload(componentName),
      onFocus: () => preload(componentName),
    };
  };

  return {
    preload,
    preloadOnHover,
  };
}