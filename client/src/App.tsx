import React, { Suspense, lazy, useEffect } from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { initPerformanceOptimizations } from "@/utils/performance";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { useAuth } from "@/hooks/useAuth";

// Lazy load components for better performance
const NotFound = lazy(() => import("@/pages/not-found"));
const Landing = lazy(() => import("@/pages/landing"));
const Calculator = lazy(() => import("@/pages/Calculator"));
const Dashboard = lazy(() => import("@/pages/dashboard"));
const Checkout = lazy(() => import("@/pages/checkout"));
const CheckoutSuccess = lazy(() => import("@/pages/checkout/success"));
const CheckoutCancel = lazy(() => import("@/pages/checkout/cancel"));
const CheckoutDemo = lazy(() => import("@/pages/checkout-demo"));
const HowItWorks = lazy(() => import("@/pages/how-it-works"));
const PricingPage = lazy(() => import("@/pages/pricing"));
const FAQPage = lazy(() => import("@/pages/faq"));
const SampleDocuments = lazy(() => import("@/pages/sample-documents"));
const RDCreditGuide = lazy(() => import("@/pages/rd-credit-guide"));
const QualifyingActivities = lazy(() => import("@/pages/qualifying-activities"));
const Blog = lazy(() => import("@/pages/blog"));
const MarketingAgencies = lazy(() => import("@/pages/industries/marketing"));
const Ecommerce = lazy(() => import("@/pages/industries/ecommerce"));
const ProfessionalServices = lazy(() => import("@/pages/industries/services"));
const Healthcare = lazy(() => import("@/pages/industries/healthcare"));
const Login = lazy(() => import("@/pages/auth/Login"));
const Register = lazy(() => import("@/pages/auth/Register"));
const IntakeFormPage = lazy(() => import("@/pages/IntakeFormPage"));
const DocumentsPage = lazy(() => import("@/pages/DocumentsPage"));
const LoadingStatesDemo = lazy(() => import("@/pages/LoadingStatesDemo"));
const MobileDemo = lazy(() => import("@/pages/MobileDemo"));
const Help = lazy(() => import("@/pages/Help"));
const Support = lazy(() => import("@/pages/Support"));
const Admin = lazy(() => import("@/pages/Admin"));

// Performance-optimized loading skeleton
function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <div className="animate-pulse">
        {/* Header skeleton */}
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

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  // Initialize performance optimizations
  useEffect(() => {
    initPerformanceOptimizations();
    
    // Initialize mobile optimizations
    import("@/utils/mobileOptimizations").then(({ initMobileOptimizations }) => {
      initMobileOptimizations({
        enableVirtualKeyboardFix: true,
        enableTouchOptimizations: true,
        enablePerformanceOptimizations: true,
        enableA11yEnhancements: true
      });
    });
  }, []);

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <Switch>
        {!isAuthenticated ? (
          <>
            <Route path="/" component={Landing} />
            <Route path="/calculator" component={Calculator} />
            <Route path="/login" component={Login} />
            <Route path="/register" component={Register} />
            <Route path="/checkout" component={Checkout} />
            <Route path="/checkout/success" component={CheckoutSuccess} />
            <Route path="/checkout/cancel" component={CheckoutCancel} />
            <Route path="/checkout/demo" component={CheckoutDemo} />
            <Route path="/how-it-works" component={HowItWorks} />
            <Route path="/pricing" component={PricingPage} />
            <Route path="/faq" component={FAQPage} />
            <Route path="/sample-documents" component={SampleDocuments} />
            <Route path="/rd-credit-guide" component={RDCreditGuide} />
            <Route path="/qualifying-activities" component={QualifyingActivities} />
            <Route path="/blog" component={Blog} />
            <Route path="/industries/marketing" component={MarketingAgencies} />
            <Route path="/industries/ecommerce" component={Ecommerce} />
            <Route path="/industries/services" component={ProfessionalServices} />
            <Route path="/industries/healthcare" component={Healthcare} />
            <Route path="/intake-form" component={IntakeFormPage} />
            <Route path="/support" component={Support} />
          </>
        ) : (
          <>
            <Route path="/">
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            </Route>
            <Route path="/dashboard">
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            </Route>
            <Route path="/checkout">
              <ProtectedRoute>
                <Checkout />
              </ProtectedRoute>
            </Route>
            <Route path="/intake-form/:id">
              <ProtectedRoute>
                <IntakeFormPage />
              </ProtectedRoute>
            </Route>
            <Route path="/intake-form">
              <ProtectedRoute>
                <IntakeFormPage />
              </ProtectedRoute>
            </Route>
            <Route path="/documents">
              <ProtectedRoute>
                <DocumentsPage />
              </ProtectedRoute>
            </Route>
            <Route path="/admin">
              <ProtectedRoute>
                <Admin />
              </ProtectedRoute>
            </Route>
            <Route path="/how-it-works" component={HowItWorks} />
            <Route path="/pricing" component={PricingPage} />
            <Route path="/faq" component={FAQPage} />
            <Route path="/sample-documents" component={SampleDocuments} />
            <Route path="/rd-credit-guide" component={RDCreditGuide} />
            <Route path="/qualifying-activities" component={QualifyingActivities} />
            <Route path="/blog" component={Blog} />
            <Route path="/industries/marketing" component={MarketingAgencies} />
            <Route path="/industries/ecommerce" component={Ecommerce} />
            <Route path="/industries/services" component={ProfessionalServices} />
            <Route path="/industries/healthcare" component={Healthcare} />
            <Route path="/support" component={Support} />
          </>
        )}
        <Route path="/demo/loading-states" component={LoadingStatesDemo} />
        <Route path="/demo/mobile" component={MobileDemo} />
        <Route path="/demo/analytics" component={lazy(() => import("@/pages/AnalyticsDemo"))} />
        <Route path="/demo/monitoring" component={lazy(() => import("@/pages/MonitoringDemo"))} />
        <Route path="/help" component={Help} />
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;