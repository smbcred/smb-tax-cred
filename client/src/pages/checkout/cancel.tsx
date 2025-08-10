import React from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { XCircle, ArrowLeft, RefreshCw } from 'lucide-react';

const CheckoutCancel: React.FC = () => {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-2xl mx-auto px-4">
        <Card className="text-center">
          <CardHeader>
            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
            <CardTitle className="text-2xl text-gray-900 dark:text-gray-100">
              Checkout Cancelled
            </CardTitle>
            <CardDescription>
              No worries! Your calculation results are still saved and you can complete your purchase anytime.
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <p className="text-blue-800 dark:text-blue-200 font-medium">
                Your estimated R&D tax credit is still waiting for you
              </p>
              <p className="text-sm text-blue-600 dark:text-blue-300 mt-1">
                Complete your purchase to get your IRS-compliant documentation package.
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100">
                What would you like to do?
              </h3>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={() => setLocation('/')}
                  className="flex-1"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Try Checkout Again
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => setLocation('/')}
                  className="flex-1"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Calculator
                </Button>
              </div>
            </div>

            <div className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
              <p>
                <strong>Need help?</strong> Contact our support team at support@smbtaxcredits.com
              </p>
              <p>
                We're here to help you claim every dollar you deserve.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CheckoutCancel;