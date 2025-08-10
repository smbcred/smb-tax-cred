import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/providers/ThemeProvider";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import Dashboard from "@/pages/dashboard";
import Checkout from "@/pages/checkout";
import CheckoutSuccess from "@/pages/checkout/success";
import CheckoutCancel from "@/pages/checkout/cancel";
import CheckoutDemo from "@/pages/checkout-demo";
import HowItWorks from "@/pages/how-it-works";
import PricingPage from "@/pages/pricing";
import FAQPage from "@/pages/faq";
import SampleDocuments from "@/pages/sample-documents";
import RDCreditGuide from "@/pages/rd-credit-guide";
import QualifyingActivities from "@/pages/qualifying-activities";
import Blog from "@/pages/blog";
import MarketingAgencies from "@/pages/industries/marketing";
import Ecommerce from "@/pages/industries/ecommerce";
import ProfessionalServices from "@/pages/industries/services";
import Healthcare from "@/pages/industries/healthcare";
import Login from "@/pages/auth/Login";
import Register from "@/pages/auth/Register";
import IntakeFormPage from "@/pages/IntakeFormPage";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { useAuth } from "@/hooks/useAuth";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cloud">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <Switch>
      {!isAuthenticated ? (
        <>
          <Route path="/" component={Landing} />
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
        </>
      )}
      <Route component={NotFound} />
    </Switch>
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
