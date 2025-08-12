import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";

// Import all our new loading components
import { 
  Skeleton, 
  SkeletonCard, 
  SkeletonForm, 
  SkeletonCalculator 
} from "@/components/ui/skeleton";

import {
  LoadingSpinner,
  ButtonSpinner,
  CalculatorLoader,
  PaymentLoader,
  UploadLoader
} from "@/components/ui/loading-spinner";

import {
  SuccessAnimation,
  CalculatorSuccessAnimation,
  PaymentSuccessAnimation,
  DocumentSuccessAnimation,
  InlineSuccessCheck,
  SuccessBanner
} from "@/components/ui/success-animation";

import {
  ErrorBoundary,
  CalculatorErrorBoundary,
  FormErrorBoundary,
  PaymentErrorBoundary
} from "@/components/ui/error-boundary";

import {
  FieldHelpTooltip,
  InfoTooltip,
  WarningTooltip,
  TaxTermTooltip,
  CalculationTooltip,
  ComplianceTooltip
} from "@/components/ui/tooltip";

import { useLoadingStates } from "@/hooks/useLoadingStates";

export default function LoadingStatesDemo() {
  const [activeDemo, setActiveDemo] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const { execute, getState, isAnyLoading } = useLoadingStates();

  const simulateLoading = (demoType: string, duration: number = 2000) => {
    setActiveDemo(demoType);
    setTimeout(() => {
      setActiveDemo(null);
      if (demoType === 'success') {
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
      }
    }, duration);
  };

  const simulateUpload = () => {
    setActiveDemo('upload');
    setUploadProgress(0);
    
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setActiveDemo(null);
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  const simulateApiCall = async () => {
    try {
      await execute('demo-api', async () => {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 2000));
        return { success: true, data: "API call completed" };
      });
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      console.error('API call failed:', error);
    }
  };

  const triggerError = () => {
    setShowError(true);
    setTimeout(() => setShowError(false), 5000);
  };

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold">Loading States & Feedback Demo</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Comprehensive showcase of loading states, progress indicators, success animations, 
          error recovery flows, and helpful tooltips to improve perceived performance.
        </p>
      </div>

      {showSuccess && (
        <SuccessBanner 
          message="Demo completed successfully!"
          description="All loading states and feedback components are working properly."
          onDismiss={() => setShowSuccess(false)}
        />
      )}

      <Tabs defaultValue="skeletons" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="skeletons">Skeleton Screens</TabsTrigger>
          <TabsTrigger value="spinners">Loading Spinners</TabsTrigger>
          <TabsTrigger value="success">Success States</TabsTrigger>
          <TabsTrigger value="errors">Error Recovery</TabsTrigger>
          <TabsTrigger value="tooltips">Helpful Tooltips</TabsTrigger>
        </TabsList>

        <TabsContent value="skeletons" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Skeleton Screens</CardTitle>
              <CardDescription>
                Loading placeholders that match the actual content structure
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <h4 className="font-medium mb-3">Basic Skeleton</h4>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-3 w-full" />
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-3">Card Skeleton</h4>
                  <SkeletonCard />
                </div>
              </div>

              <div className="space-y-4">
                <Button 
                  onClick={() => simulateLoading('form')}
                  disabled={activeDemo === 'form'}
                >
                  {activeDemo === 'form' ? 'Loading Form...' : 'Show Form Skeleton'}
                </Button>
                
                {activeDemo === 'form' ? <SkeletonForm /> : (
                  <div className="border rounded-lg p-6 text-center text-muted-foreground">
                    Form content would appear here
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <Button 
                  onClick={() => simulateLoading('calculator')}
                  disabled={activeDemo === 'calculator'}
                >
                  {activeDemo === 'calculator' ? 'Loading Calculator...' : 'Show Calculator Skeleton'}
                </Button>
                
                {activeDemo === 'calculator' ? <SkeletonCalculator /> : (
                  <div className="border rounded-lg p-12 text-center text-muted-foreground">
                    R&D Tax Credit Calculator would appear here
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="spinners" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Loading Spinners & Progress Indicators</CardTitle>
              <CardDescription>
                Various loading indicators for different contexts
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <div className="text-center space-y-3">
                  <h4 className="font-medium">Basic Spinner</h4>
                  <LoadingSpinner size="lg" showText />
                </div>
                
                <div className="text-center space-y-3">
                  <h4 className="font-medium">Calculator Loading</h4>
                  <CalculatorLoader />
                </div>
                
                <div className="text-center space-y-3">
                  <h4 className="font-medium">Payment Processing</h4>
                  <PaymentLoader />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex gap-2">
                  <Button 
                    onClick={simulateApiCall}
                    disabled={isAnyLoading()}
                  >
                    {getState('demo-api').isLoading && <ButtonSpinner />}
                    {getState('demo-api').isLoading ? 'Processing...' : 'Test API Call'}
                  </Button>
                  
                  <Button 
                    onClick={simulateUpload}
                    disabled={activeDemo === 'upload'}
                  >
                    Test File Upload
                  </Button>
                </div>

                {activeDemo === 'upload' && (
                  <UploadLoader 
                    progress={uploadProgress}
                    fileName="tax-documents.pdf"
                  />
                )}
              </div>

              <div className="space-y-4">
                <h4 className="font-medium">Progress Example</h4>
                <Progress value={65} className="w-full" />
                <p className="text-sm text-muted-foreground">Processing R&D documentation... 65%</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="success" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Success Animations</CardTitle>
              <CardDescription>
                Delightful feedback for completed actions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <Button onClick={() => simulateLoading('success', 3000)}>
                  Show Success Animation
                </Button>
                <Button onClick={() => simulateLoading('calculator-success', 3000)}>
                  Calculator Success
                </Button>
                <Button onClick={() => simulateLoading('payment-success', 3000)}>
                  Payment Success
                </Button>
                <Button onClick={() => simulateLoading('document-success', 3000)}>
                  Document Success
                </Button>
              </div>

              {activeDemo === 'success' && (
                <SuccessAnimation 
                  message="Task Completed!"
                  description="Your action was completed successfully"
                />
              )}
              
              {activeDemo === 'calculator-success' && (
                <CalculatorSuccessAnimation creditAmount={25000} />
              )}
              
              {activeDemo === 'payment-success' && (
                <PaymentSuccessAnimation amount={297} />
              )}
              
              {activeDemo === 'document-success' && (
                <DocumentSuccessAnimation documentCount={3} />
              )}

              <div className="space-y-2">
                <h4 className="font-medium">Inline Success Check</h4>
                <div className="flex items-center gap-2">
                  <span>Email verified</span>
                  <InlineSuccessCheck />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="errors" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Error Recovery Flows</CardTitle>
              <CardDescription>
                Graceful error handling with recovery options
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <Button onClick={triggerError} variant="destructive">
                  Trigger Error State
                </Button>
                
                <ErrorBoundary>
                  <Button onClick={() => {
                    throw new Error("Demo error for testing");
                  }}>
                    Test Error Boundary
                  </Button>
                </ErrorBoundary>
              </div>

              {showError && (
                <div className="border border-red-200 dark:border-red-800 rounded-lg p-6 bg-red-50 dark:bg-red-900/10">
                  <h4 className="font-medium text-red-800 dark:text-red-200 mb-2">
                    Something went wrong
                  </h4>
                  <p className="text-sm text-red-600 dark:text-red-300 mb-4">
                    The operation failed. Please try again or contact support if the problem persists.
                  </p>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => setShowError(false)}>
                      Try Again
                    </Button>
                    <Button size="sm" variant="ghost">
                      Contact Support
                    </Button>
                  </div>
                </div>
              )}

              <div className="grid gap-4 md:grid-cols-3">
                <CalculatorErrorBoundary>
                  <div className="p-4 border rounded">Calculator Component</div>
                </CalculatorErrorBoundary>
                
                <FormErrorBoundary>
                  <div className="p-4 border rounded">Form Component</div>
                </FormErrorBoundary>
                
                <PaymentErrorBoundary>
                  <div className="p-4 border rounded">Payment Component</div>
                </PaymentErrorBoundary>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tooltips" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Helpful Tooltips & Micro-interactions</CardTitle>
              <CardDescription>
                Contextual help and interactive feedback
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <h4 className="font-medium">Basic Tooltips</h4>
                  <div className="flex gap-4 items-center">
                    <InfoTooltip content="This provides additional information about the feature">
                      <span className="underline">Hover for info</span>
                    </InfoTooltip>
                    
                    <WarningTooltip content="This action cannot be undone. Please proceed with caution.">
                      <span className="text-amber-600 underline">Warning tooltip</span>
                    </WarningTooltip>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-medium">Business Type</label>
                    <FieldHelpTooltip content="Select the category that best describes your primary business activities. This helps us provide more accurate R&D credit calculations." />
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">Tax-Specific Tooltips</h4>
                  <div className="space-y-3">
                    <TaxTermTooltip
                      term="Qualified Research Expenses (QRE)"
                      definition="Expenses that meet the IRS four-part test for research and development activities, including wages, supplies, and contract research."
                    >
                      <span className="border-b border-dotted border-blue-500 cursor-help">
                        QRE Amount
                      </span>
                    </TaxTermTooltip>
                    
                    <CalculationTooltip
                      formula="Credit = QRE × Credit Rate"
                      explanation="The R&D tax credit is calculated by multiplying your qualified research expenses by the applicable credit rate (6% for first-time filers, 14% for established filers)."
                    >
                      <span className="border-b border-dotted border-green-500 cursor-help">
                        Credit Calculation
                      </span>
                    </CalculationTooltip>
                    
                    <ComplianceTooltip
                      requirement="Section 174 Capitalization"
                      details="Starting in 2022, R&D expenses must be capitalized and amortized over 5 years (domestic) or 15 years (foreign) rather than deducted immediately."
                    >
                      <span className="border-b border-dotted border-amber-500 cursor-help">
                        2022+ Compliance
                      </span>
                    </ComplianceTooltip>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium">Interactive Elements</h4>
                <div className="flex gap-4">
                  <Button 
                    className="transition-all hover:scale-105 active:scale-95"
                    onClick={() => {
                      // Micro-interaction: button press
                      console.log('Button pressed with micro-interaction');
                    }}
                  >
                    Interactive Button
                  </Button>
                  
                  <Button variant="outline" className="group">
                    <span className="group-hover:scale-110 transition-transform">
                      Hover Effect
                    </span>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}