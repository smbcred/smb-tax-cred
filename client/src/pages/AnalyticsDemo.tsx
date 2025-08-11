// Analytics demo page showcasing tracking capabilities

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
// import { Textarea } from "@/components/ui/textarea"; // Not needed for this demo
import { AnalyticsDashboard } from "@/components/ui/analytics-dashboard";
import { useAnalytics, useFormAnalytics, useConversionFunnel, useABTest, usePerformanceTracking, useErrorTracking } from "@/hooks/useAnalytics";
import { CalculatorEvents, FormEvents, NavigationEvents, EngagementEvents, ErrorEvents } from "@/utils/analyticsEvents";
import { analytics } from "@/services/analytics";

export default function AnalyticsDemo() {
  const { 
    track, 
    trackConversion, 
    trackClick, 
    setUserConsent, 
    startABTest, 
    getABTestVariant,
    trackABTestConversion 
  } = useAnalytics();
  
  const { trackFormStart, trackFormComplete, trackFieldFocus, trackFieldComplete } = useFormAnalytics('demo-form');
  const { trackFunnelStep, trackFunnelComplete } = useConversionFunnel('demo-funnel', ['start', 'engage', 'convert']);
  const { trackCustomMetric, trackApiResponseTime } = usePerformanceTracking();
  const { trackError } = useErrorTracking();

  const [consentGiven, setConsentGiven] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [sessionInfo, setSessionInfo] = useState<any>(null);
  const [abTestVariant, setAbTestVariant] = useState<string>('');

  // A/B Test variants for button color
  const buttonVariants = [
    { id: 'blue', weight: 0.5, component: () => <Button className="bg-blue-600 hover:bg-blue-700">Blue Button</Button> },
    { id: 'green', weight: 0.5, component: () => <Button className="bg-green-600 hover:bg-green-700">Green Button</Button> }
  ];

  const { variantId, Component: ABTestButton } = useABTest('button-color-test', buttonVariants);

  useEffect(() => {
    // Initialize analytics consent check
    const consent = localStorage.getItem('analytics_consent');
    setConsentGiven(consent === 'granted');

    // Get session info
    setSessionInfo(analytics.getSessionInfo());

    // Track page view
    NavigationEvents.pageView('/demo/analytics', 'Analytics Demo');

    // Start A/B test
    const variant = startABTest('button-color-test', [
      { id: 'blue', weight: 0.5 },
      { id: 'green', weight: 0.5 }
    ]);
    setAbTestVariant(variant);

    // Track first funnel step
    trackFunnelStep(0, { source: 'demo_page' });
  }, [startABTest, trackFunnelStep]);

  const handleConsentChange = (granted: boolean) => {
    setConsentGiven(granted);
    setUserConsent(granted);
    
    if (granted) {
      track('analytics_consent_granted', 'engagement', { timestamp: Date.now() });
    }
  };

  const simulateCalculatorFlow = () => {
    trackClick('simulate-calculator', 'button', { test: 'calculator_simulation' });
    
    // Simulate calculator events
    CalculatorEvents.start('demo_page');
    
    setTimeout(() => {
      CalculatorEvents.stepCompleted(1, 'Company Info', { industry: 'technology' });
      trackFunnelStep(1, { step: 'calculator_started' });
    }, 1000);

    setTimeout(() => {
      CalculatorEvents.stepCompleted(2, 'R&D Activities', { activities: 3 });
    }, 2000);

    setTimeout(() => {
      CalculatorEvents.completed({ 
        estimatedCredit: 75000, 
        rdExpenses: 500000 
      }, 3000);
      trackFunnelStep(2, { step: 'calculator_completed' });
    }, 3000);
  };

  const simulateFormFlow = () => {
    trackClick('simulate-form', 'button', { test: 'form_simulation' });
    trackFormStart();
    
    // Simulate form interactions
    setTimeout(() => {
      trackFieldFocus('name');
      trackFieldComplete('name', 'Demo User');
    }, 500);

    setTimeout(() => {
      trackFieldFocus('email');
      trackFieldComplete('email', 'demo@example.com');
    }, 1500);

    setTimeout(() => {
      trackFormComplete();
      trackFunnelComplete(100);
    }, 2500);
  };

  const simulatePaymentFlow = () => {
    trackClick('simulate-payment', 'button', { test: 'payment_simulation' });
    
    // Track conversion
    trackConversion('demo_purchase', 99, 'USD');
    trackABTestConversion('button-color-test', 'payment_completed');
    
    // Track performance metric
    trackCustomMetric('payment_processing_time', 1250, 'ms');
  };

  const simulateError = () => {
    trackClick('simulate-error', 'button', { test: 'error_simulation' });
    
    try {
      // Intentionally cause an error
      throw new Error('Demo error for analytics testing');
    } catch (error) {
      ErrorEvents.occurred(error as Error, 'demo_simulation', 'low');
    }
  };

  const simulateAPICall = async () => {
    trackClick('simulate-api', 'button', { test: 'api_simulation' });
    
    const startTime = Date.now();
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, Math.random() * 2000 + 500));
      const duration = Date.now() - startTime;
      trackApiResponseTime('/api/demo', duration);
    } catch (error) {
      trackError(error as Error, 'api');
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    FormEvents.submitted('demo-form', formData, 5000);
    trackClick('form-submit', 'button', { form_data: formData });
    
    alert('Form submitted! Check analytics dashboard for tracking data.');
  };

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold">Analytics Implementation Demo</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Interactive demonstration of comprehensive analytics tracking including events, conversions, A/B testing, and performance monitoring.
        </p>
      </div>

      <Tabs defaultValue="tracking" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="tracking">Event Tracking</TabsTrigger>
          <TabsTrigger value="conversion">Conversion Funnel</TabsTrigger>
          <TabsTrigger value="abtesting">A/B Testing</TabsTrigger>
          <TabsTrigger value="dashboard">Analytics Dashboard</TabsTrigger>
        </TabsList>

        <TabsContent value="tracking" className="space-y-6">
          {/* Analytics Consent */}
          <Card>
            <CardHeader>
              <CardTitle>Analytics Consent</CardTitle>
              <CardDescription>
                GDPR/CCPA compliant analytics consent management
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span>Analytics tracking enabled:</span>
                <Badge variant={consentGiven ? "default" : "secondary"}>
                  {consentGiven ? "Granted" : "Not granted"}
                </Badge>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant={consentGiven ? "outline" : "default"}
                  onClick={() => handleConsentChange(true)}
                >
                  Grant Consent
                </Button>
                <Button 
                  variant={!consentGiven ? "outline" : "default"}
                  onClick={() => handleConsentChange(false)}
                >
                  Revoke Consent
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Session Information */}
          {sessionInfo && (
            <Card>
              <CardHeader>
                <CardTitle>Session Information</CardTitle>
                <CardDescription>Current analytics session details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Session ID:</span>
                    <code className="ml-2 text-xs">{sessionInfo.sessionId}</code>
                  </div>
                  <div>
                    <span className="font-medium">User ID:</span>
                    <code className="ml-2 text-xs">{sessionInfo.userId || 'Anonymous'}</code>
                  </div>
                  <div>
                    <span className="font-medium">Events Queued:</span>
                    <span className="ml-2">{sessionInfo.eventCount}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Event Simulation */}
          <Card>
            <CardHeader>
              <CardTitle>Event Tracking Simulation</CardTitle>
              <CardDescription>
                Test different types of analytics events and tracking patterns
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <Button onClick={simulateCalculatorFlow} variant="outline">
                  Simulate Calculator Flow
                </Button>
                <Button onClick={simulateFormFlow} variant="outline">
                  Simulate Form Flow
                </Button>
                <Button onClick={simulatePaymentFlow} variant="outline">
                  Simulate Payment
                </Button>
                <Button onClick={simulateError} variant="outline">
                  Simulate Error
                </Button>
                <Button onClick={simulateAPICall} variant="outline">
                  Simulate API Call
                </Button>
                <Button 
                  onClick={() => {
                    EngagementEvents.modalOpened('demo-modal', 'button_click', 'analytics_demo');
                    trackClick('engagement-test', 'button');
                  }}
                  variant="outline"
                >
                  Track Engagement
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Demo Form with Tracking */}
          <Card>
            <CardHeader>
              <CardTitle>Form with Analytics Tracking</CardTitle>
              <CardDescription>
                This form demonstrates field-level tracking and form completion analytics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleFormSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    onFocus={() => trackFieldFocus('name')}
                    onBlur={() => trackFieldComplete('name', formData.name)}
                    placeholder="Enter your name"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    onFocus={() => trackFieldFocus('email')}
                    onBlur={() => trackFieldComplete('email', formData.email)}
                    placeholder="Enter your email"
                  />
                </div>
                <div>
                  <Label htmlFor="message">Message</Label>
                  <Input
                    id="message"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    onFocus={() => trackFieldFocus('message')}
                    onBlur={() => trackFieldComplete('message', formData.message)}
                    placeholder="Enter your message"
                  />
                </div>
                <Button type="submit">Submit Form</Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="conversion" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Conversion Funnel Tracking</CardTitle>
              <CardDescription>
                Track user progression through key conversion steps
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Step 1: Demo Page Visit</span>
                  <Badge variant="default">Completed</Badge>
                </div>
                <Progress value={100} className="h-2" />
                
                <div className="flex items-center justify-between">
                  <span>Step 2: User Engagement</span>
                  <Badge variant="secondary">In Progress</Badge>
                </div>
                <Progress value={60} className="h-2" />
                
                <div className="flex items-center justify-between">
                  <span>Step 3: Conversion Action</span>
                  <Badge variant="outline">Pending</Badge>
                </div>
                <Progress value={0} className="h-2" />
              </div>

              <div className="pt-4 border-t">
                <Button 
                  onClick={() => {
                    trackFunnelStep(1, { action: 'manual_trigger' });
                    alert('Funnel step 2 completed!');
                  }}
                  className="mr-2"
                >
                  Complete Step 2
                </Button>
                <Button 
                  onClick={() => {
                    trackFunnelComplete(250);
                    alert('Conversion funnel completed!');
                  }}
                  variant="outline"
                >
                  Complete Funnel
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="abtesting" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>A/B Testing Framework</CardTitle>
              <CardDescription>
                Test different variants and track conversion performance
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Current A/B Test: Button Color</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    You are assigned to variant: <Badge>{abTestVariant}</Badge>
                  </p>
                  
                  <div className="flex items-center gap-4">
                    <ABTestButton />
                    <Button 
                      onClick={() => {
                        trackABTestConversion('button-color-test', 'demo_conversion');
                        alert(`Conversion tracked for variant: ${abTestVariant}`);
                      }}
                      variant="outline"
                    >
                      Track Conversion
                    </Button>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <h4 className="font-medium mb-2">Test Information</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Test ID:</span>
                      <span className="ml-2">button-color-test</span>
                    </div>
                    <div>
                      <span className="font-medium">Your Variant:</span>
                      <span className="ml-2">{abTestVariant}</span>
                    </div>
                    <div>
                      <span className="font-medium">Variants:</span>
                      <span className="ml-2">Blue (50%), Green (50%)</span>
                    </div>
                    <div>
                      <span className="font-medium">Goal:</span>
                      <span className="ml-2">Increase conversion rate</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="dashboard">
          <AnalyticsDashboard />
        </TabsContent>
      </Tabs>
    </div>
  );
}