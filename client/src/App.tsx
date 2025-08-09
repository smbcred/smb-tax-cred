import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import Dashboard from "@/pages/dashboard";
import Checkout from "@/pages/checkout";
import HowItWorks from "@/pages/how-it-works";
import PricingPage from "@/pages/pricing";
import FAQPage from "@/pages/faq";
import SampleDocuments from "@/pages/sample-documents";
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
          <Route path="/checkout" component={Checkout} />
          <Route path="/how-it-works" component={HowItWorks} />
          <Route path="/pricing" component={PricingPage} />
          <Route path="/faq" component={FAQPage} />
          <Route path="/sample-documents" component={SampleDocuments} />
        </>
      ) : (
        <>
          <Route path="/" component={Dashboard} />
          <Route path="/dashboard" component={Dashboard} />
          <Route path="/checkout" component={Checkout} />
          <Route path="/how-it-works" component={HowItWorks} />
          <Route path="/pricing" component={PricingPage} />
          <Route path="/faq" component={FAQPage} />
          <Route path="/sample-documents" component={SampleDocuments} />
        </>
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
