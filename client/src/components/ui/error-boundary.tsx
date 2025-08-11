import React, { Component, ReactNode } from "react";
import { AlertTriangle, RefreshCw, Home, ArrowLeft } from "lucide-react";
import { Button } from "./button";
import { Card } from "./card";

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: (error: Error, retry: () => void) => ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  isolate?: boolean; // Whether to isolate the error to this component only
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({ error, errorInfo });
    this.props.onError?.(error, errorInfo);
    
    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('ErrorBoundary caught an error:', error, errorInfo);
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.handleRetry);
      }

      return (
        <ErrorFallback
          error={this.state.error}
          onRetry={this.handleRetry}
          isolate={this.props.isolate}
        />
      );
    }

    return this.props.children;
  }
}

interface ErrorFallbackProps {
  error: Error;
  onRetry?: () => void;
  isolate?: boolean;
}

export function ErrorFallback({ error, onRetry, isolate = false }: ErrorFallbackProps) {
  const handleGoHome = () => {
    window.location.href = '/';
  };

  const handleGoBack = () => {
    window.history.back();
  };

  return (
    <div className={cn(
      "flex items-center justify-center p-6",
      isolate ? "min-h-[200px]" : "min-h-[400px]"
    )}>
      <Card className="max-w-md w-full p-6 text-center">
        <div className="space-y-4">
          {/* Error Icon */}
          <div className="flex justify-center">
            <div className="h-16 w-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </div>

          {/* Error Content */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-foreground">
              {isolate ? "Component Error" : "Something went wrong"}
            </h3>
            <p className="text-sm text-muted-foreground">
              {isolate 
                ? "This component encountered an error and couldn't load properly."
                : "We're sorry, but something unexpected happened. Please try again."
              }
            </p>
            {process.env.NODE_ENV === 'development' && (
              <details className="text-left mt-4">
                <summary className="text-xs text-muted-foreground cursor-pointer">
                  Error Details (Development)
                </summary>
                <pre className="text-xs text-red-600 dark:text-red-400 mt-2 p-2 bg-red-50 dark:bg-red-900/10 rounded border overflow-auto max-h-32">
                  {error.message}
                  {error.stack && `\n\n${error.stack}`}
                </pre>
              </details>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-2">
            {onRetry && (
              <Button onClick={onRetry} className="w-full">
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
            )}
            
            {!isolate && (
              <div className="flex gap-2">
                <Button onClick={handleGoBack} variant="outline" size="sm" className="flex-1">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Go Back
                </Button>
                <Button onClick={handleGoHome} variant="outline" size="sm" className="flex-1">
                  <Home className="h-4 w-4 mr-2" />
                  Home
                </Button>
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}

// Specific error recovery components
export function CalculatorErrorBoundary({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary
      isolate
      fallback={(error, retry) => (
        <div className="border border-red-200 dark:border-red-800 rounded-lg p-6 text-center bg-red-50 dark:bg-red-900/10">
          <AlertTriangle className="h-8 w-8 text-red-500 mx-auto mb-3" />
          <h4 className="font-medium text-red-800 dark:text-red-200 mb-2">
            Calculator Error
          </h4>
          <p className="text-sm text-red-600 dark:text-red-300 mb-4">
            The tax credit calculator encountered an error. Please try refreshing or contact support if the problem persists.
          </p>
          <Button onClick={retry} size="sm" variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Reload Calculator
          </Button>
        </div>
      )}
    >
      {children}
    </ErrorBoundary>
  );
}

export function FormErrorBoundary({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary
      isolate
      fallback={(error, retry) => (
        <div className="border border-red-200 dark:border-red-800 rounded-lg p-6 text-center bg-red-50 dark:bg-red-900/10">
          <AlertTriangle className="h-6 w-6 text-red-500 mx-auto mb-3" />
          <h4 className="font-medium text-red-800 dark:text-red-200 mb-2">
            Form Error
          </h4>
          <p className="text-sm text-red-600 dark:text-red-300 mb-4">
            The form couldn't load properly. Your data is safe.
          </p>
          <Button onClick={retry} size="sm" variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Reload Form
          </Button>
        </div>
      )}
    >
      {children}
    </ErrorBoundary>
  );
}

export function PaymentErrorBoundary({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary
      isolate
      fallback={(error, retry) => (
        <div className="border border-red-200 dark:border-red-800 rounded-lg p-6 text-center bg-red-50 dark:bg-red-900/10">
          <AlertTriangle className="h-8 w-8 text-red-500 mx-auto mb-3" />
          <h4 className="font-medium text-red-800 dark:text-red-200 mb-2">
            Payment System Error
          </h4>
          <p className="text-sm text-red-600 dark:text-red-300 mb-4">
            The payment system is temporarily unavailable. Please try again in a moment.
          </p>
          <div className="flex gap-2 justify-center">
            <Button onClick={retry} size="sm" variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
            <Button onClick={() => window.location.href = '/contact'} size="sm" variant="ghost">
              Contact Support
            </Button>
          </div>
        </div>
      )}
    >
      {children}
    </ErrorBoundary>
  );
}

// Hook for handling async errors in functional components
export function useErrorHandler() {
  return (error: Error) => {
    // This will be caught by the nearest ErrorBoundary
    throw error;
  };
}

// Utility function to wrap async operations with error handling
export function withErrorRecovery<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  options?: {
    retries?: number;
    delay?: number;
    onError?: (error: Error, attempt: number) => void;
  }
): T {
  const { retries = 2, delay = 1000, onError } = options || {};

  return (async (...args: Parameters<T>) => {
    let lastError: Error;
    
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        return await fn(...args);
      } catch (error) {
        lastError = error as Error;
        onError?.(lastError, attempt + 1);
        
        if (attempt < retries) {
          await new Promise(resolve => setTimeout(resolve, delay * (attempt + 1)));
        }
      }
    }
    
    throw lastError!;
  }) as T;
}

function cn(...classes: (string | undefined)[]): string {
  return classes.filter(Boolean).join(' ');
}