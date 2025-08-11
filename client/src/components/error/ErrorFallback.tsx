import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { AlertTriangle, RefreshCw, Home, Mail, Copy, ChevronDown, ChevronUp } from 'lucide-react';

interface ErrorFallbackProps {
  error: Error;
  errorInfo: React.ErrorInfo;
  errorId: string;
  onRetry?: () => void;
  onReset?: () => void;
  canRetry?: boolean;
  retryCount?: number;
  maxRetries?: number;
}

export function ErrorFallback({
  error,
  errorInfo,
  errorId,
  onRetry,
  onReset,
  canRetry = true,
  retryCount = 0,
  maxRetries = 3,
}: ErrorFallbackProps) {
  const [showDetails, setShowDetails] = React.useState(false);
  const [copiedErrorId, setCopiedErrorId] = React.useState(false);

  const handleCopyErrorId = async () => {
    try {
      await navigator.clipboard.writeText(errorId);
      setCopiedErrorId(true);
      setTimeout(() => setCopiedErrorId(false), 2000);
    } catch (err) {
      console.error('Failed to copy error ID:', err);
    }
  };

  const handleGoHome = () => {
    window.location.href = '/dashboard';
  };

  const handleContactSupport = () => {
    const subject = encodeURIComponent(`Error Report - ${errorId}`);
    const body = encodeURIComponent(`Error ID: ${errorId}
Error Message: ${error.message}
Page: ${window.location.href}
Time: ${new Date().toISOString()}

Please describe what you were doing when this error occurred:

`);
    window.location.href = `mailto:support@smbtaxcredits.com?subject=${subject}&body=${body}`;
  };

  const getErrorSeverity = (): 'low' | 'medium' | 'high' => {
    const message = error.message.toLowerCase();
    
    if (message.includes('payment') || message.includes('security') || message.includes('auth')) {
      return 'high';
    }
    
    if (message.includes('network') || message.includes('timeout') || message.includes('server')) {
      return 'medium';
    }
    
    return 'low';
  };

  const getErrorCategory = (): string => {
    const message = error.message.toLowerCase();
    const stack = error.stack?.toLowerCase() || '';
    
    if (message.includes('chunk') || stack.includes('chunk')) {
      return 'Code Loading';
    }
    
    if (message.includes('network') || message.includes('fetch')) {
      return 'Network';
    }
    
    if (message.includes('render') || stack.includes('render')) {
      return 'Rendering';
    }
    
    if (message.includes('permission') || message.includes('auth')) {
      return 'Authentication';
    }
    
    return 'Application';
  };

  const severity = getErrorSeverity();
  const category = getErrorCategory();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center mb-4">
            <div className="rounded-full bg-red-100 dark:bg-red-900/20 p-3">
              <AlertTriangle className="h-8 w-8 text-red-600 dark:text-red-400" />
            </div>
          </div>
          
          <CardTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Oops! Something went wrong
          </CardTitle>
          
          <CardDescription className="text-lg text-gray-600 dark:text-gray-400">
            We encountered an unexpected error. Don't worry, we're here to help you get back on track.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Error Info */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant={severity === 'high' ? 'destructive' : severity === 'medium' ? 'default' : 'secondary'}>
                {severity.toUpperCase()} SEVERITY
              </Badge>
              <Badge variant="outline">
                {category}
              </Badge>
            </div>
            
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <span>Error ID:</span>
              <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-xs">
                {errorId}
              </code>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopyErrorId}
                className="h-6 w-6 p-0"
              >
                <Copy className="h-3 w-3" />
              </Button>
              {copiedErrorId && (
                <span className="text-green-600 dark:text-green-400 text-xs">Copied!</span>
              )}
            </div>
          </div>

          {/* User-friendly error message */}
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="text-base">
              {category === 'Code Loading' && (
                <>
                  We're having trouble loading part of the application. This usually happens when we've just updated the site.
                </>
              )}
              {category === 'Network' && (
                <>
                  We're having trouble connecting to our servers. Please check your internet connection and try again.
                </>
              )}
              {category === 'Rendering' && (
                <>
                  There was a problem displaying this page. This might be a temporary issue with the interface.
                </>
              )}
              {category === 'Authentication' && (
                <>
                  There was a problem with your session. You may need to sign in again to continue.
                </>
              )}
              {category === 'Application' && (
                <>
                  The application encountered an unexpected problem. Our team has been notified and is working on a fix.
                </>
              )}
            </AlertDescription>
          </Alert>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            {canRetry && onRetry && retryCount < maxRetries && (
              <Button onClick={onRetry} className="flex-1">
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again {retryCount > 0 && `(${retryCount}/${maxRetries})`}
              </Button>
            )}
            
            <Button variant="outline" onClick={handleGoHome} className="flex-1">
              <Home className="h-4 w-4 mr-2" />
              Go to Dashboard
            </Button>
            
            {severity === 'high' && (
              <Button variant="destructive" onClick={handleContactSupport} className="flex-1">
                <Mail className="h-4 w-4 mr-2" />
                Contact Support
              </Button>
            )}
          </div>

          {/* Recovery suggestions */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
              What you can try:
            </h4>
            <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
              {category === 'Code Loading' && (
                <>
                  <li>• Refresh the page (Ctrl+F5 or Cmd+Shift+R)</li>
                  <li>• Clear your browser cache</li>
                  <li>• Try using an incognito/private window</li>
                </>
              )}
              {category === 'Network' && (
                <>
                  <li>• Check your internet connection</li>
                  <li>• Try refreshing the page in a few seconds</li>
                  <li>• Disable any VPN or proxy temporarily</li>
                </>
              )}
              {category === 'Authentication' && (
                <>
                  <li>• Sign out and sign back in</li>
                  <li>• Clear your browser cookies for this site</li>
                  <li>• Try using an incognito/private window</li>
                </>
              )}
              <li>• If the problem persists, contact our support team</li>
            </ul>
          </div>

          <Separator />

          {/* Technical details toggle */}
          <div>
            <Button
              variant="ghost"
              onClick={() => setShowDetails(!showDetails)}
              className="w-full justify-between"
            >
              <span>Technical Details</span>
              {showDetails ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
            
            {showDetails && (
              <div className="mt-4 space-y-4">
                <div>
                  <h5 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Error Message</h5>
                  <code className="block bg-gray-100 dark:bg-gray-800 p-3 rounded text-sm text-red-600 dark:text-red-400 overflow-x-auto">
                    {error.message}
                  </code>
                </div>
                
                <div>
                  <h5 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Stack Trace</h5>
                  <code className="block bg-gray-100 dark:bg-gray-800 p-3 rounded text-xs text-gray-600 dark:text-gray-400 overflow-x-auto whitespace-pre-wrap max-h-48 overflow-y-auto">
                    {error.stack}
                  </code>
                </div>
                
                <div>
                  <h5 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Component Stack</h5>
                  <code className="block bg-gray-100 dark:bg-gray-800 p-3 rounded text-xs text-gray-600 dark:text-gray-400 overflow-x-auto whitespace-pre-wrap max-h-32 overflow-y-auto">
                    {errorInfo.componentStack}
                  </code>
                </div>
                
                <div>
                  <h5 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Environment</h5>
                  <code className="block bg-gray-100 dark:bg-gray-800 p-3 rounded text-xs text-gray-600 dark:text-gray-400 overflow-x-auto">
                    {JSON.stringify({
                      url: window.location.href,
                      userAgent: navigator.userAgent,
                      timestamp: new Date().toISOString(),
                      viewport: `${window.innerWidth}x${window.innerHeight}`,
                    }, null, 2)}
                  </code>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="text-center text-sm text-gray-500 dark:text-gray-400">
            <p>
              If you continue to experience issues, please contact our support team at{' '}
              <a 
                href="mailto:support@smbtaxcredits.com" 
                className="text-blue-600 dark:text-blue-400 hover:underline"
              >
                support@smbtaxcredits.com
              </a>
              {' '}with error ID: {errorId}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}