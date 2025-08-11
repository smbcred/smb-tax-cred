import React from 'react';
import { ErrorBoundary } from './ErrorBoundary.tsx';
import { errorReporting } from '@/lib/errorReporting';

interface ErrorProviderProps {
  children: React.ReactNode;
}

export function ErrorProvider({ children }: ErrorProviderProps) {
  React.useEffect(() => {
    // Initialize error reporting
    errorReporting.setEnabled(true);

    // Listen for network status changes to retry stored errors
    const handleOnline = () => {
      errorReporting.retryStoredErrors();
    };

    window.addEventListener('online', handleOnline);

    return () => {
      window.removeEventListener('online', handleOnline);
    };
  }, []);

  const handleError = (error: Error, errorInfo: React.ErrorInfo, errorId: string) => {
    // Log to console for development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error boundary caught error:', {
        errorId,
        error: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
      });
    }

    // Report critical application errors immediately
    errorReporting.reportError(error, {
      componentStack: errorInfo.componentStack || undefined,
      errorBoundary: true,
      severity: 'high',
      category: 'application',
    });
  };

  return (
    <ErrorBoundary onError={handleError}>
      {children}
    </ErrorBoundary>
  );
}

// HOC for wrapping components with error boundaries
export function withErrorProvider<P extends object>(
  Component: React.ComponentType<P>
) {
  const WrappedComponent = (props: P) => (
    <ErrorProvider>
      <Component {...props} />
    </ErrorProvider>
  );

  WrappedComponent.displayName = `withErrorProvider(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
}