import React, { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Download, ArrowLeft, Mail, Clock, FileText, CreditCard, CheckCircle2 } from 'lucide-react';

const CheckoutSuccess: React.FC = () => {
  const [location, setLocation] = useLocation();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const sessionIdParam = urlParams.get('session_id');
    const tokenParam = urlParams.get('token');
    
    setSessionId(sessionIdParam);
    setToken(tokenParam);

    // Store token for automatic login if provided
    if (tokenParam) {
      localStorage.setItem('token', tokenParam);
    }

    // Track successful conversion
    if (typeof window !== 'undefined' && (window as any).gtag && sessionIdParam) {
      (window as any).gtag('event', 'purchase', {
        transaction_id: sessionIdParam,
        currency: 'USD',
      });
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-2xl mx-auto px-4">
        <Card className="text-center">
          <CardHeader>
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl text-gray-900 dark:text-gray-100">
              Payment Successful!
            </CardTitle>
            <CardDescription>
              Thank you for your purchase. Your R&D tax credit documentation is being prepared.
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {sessionId && (
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Order ID: {sessionId.slice(-8).toUpperCase()}
                </p>
              </div>
            )}

            <div className="space-y-6">
              <div className="flex items-center justify-center space-x-4">
                <Badge variant="secondary" className="px-3 py-1">
                  <CreditCard className="h-3 w-3 mr-1" />
                  Payment Complete
                </Badge>
                <Badge variant="outline" className="px-3 py-1">
                  <Clock className="h-3 w-3 mr-1" />
                  Processing Started
                </Badge>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100">
                  What happens next?
                </h3>
                
                <div className="space-y-4 text-left">
                  <div className="flex items-start space-x-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium text-green-800 dark:text-green-200">Welcome Email Sent</p>
                      <p className="text-sm text-green-700 dark:text-green-300">
                        Check your inbox for login credentials and next steps (arrives within 5 minutes).
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-blue-600 text-sm font-semibold">2</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-gray-100">Tax Specialist Review</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Our certified specialists review your calculation and business information.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-blue-600 text-sm font-semibold">3</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-gray-100">IRS-Compliant Documentation</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Complete documentation package prepared within 48 hours.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-blue-600 text-sm font-semibold">4</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-gray-100">Download & File</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Access your forms through the dashboard and file your amended return.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-6">
              <Button
                onClick={() => setLocation('/dashboard')}
                className="flex-1"
                size="lg"
              >
                <FileText className="h-4 w-4 mr-2" />
                Access Dashboard
              </Button>
              
              <Button
                variant="outline"
                onClick={() => setLocation('/')}
                className="flex-1"
                size="lg"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
            </div>

            {token && (
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div className="text-left">
                    <p className="font-medium text-blue-800 dark:text-blue-200">
                      Account Ready
                    </p>
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      You're automatically logged in and ready to access your dashboard.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <Mail className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div className="text-left">
                  <p className="font-medium text-yellow-800 dark:text-yellow-200">
                    Check your email
                  </p>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300">
                    We've sent detailed next steps and timeline to your email address.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CheckoutSuccess;