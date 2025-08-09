/**
 * @file checkout.tsx
 * @description Stripe checkout page for R&D tax credit service payment
 * @author R&D Tax Credit SAAS Team
 * @date 2024-01-15
 * @modified 2024-01-15
 * @dependencies Stripe Elements, React Query
 * @knowledgeBase Payment processing with dynamic pricing based on credit amounts
 */

import { useStripe, Elements, PaymentElement, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { paymentService } from "@/services/api.service";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from '@/hooks/useAuth';
import { formatCurrency } from '@/services/calculator.service';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import DashboardLayout from '@/components/dashboard/DashboardLayout';

// Make sure to call `loadStripe` outside of a component's render to avoid
// recreating the `Stripe` object on every render.
if (!import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
  throw new Error('Missing required Stripe key: VITE_STRIPE_PUBLIC_KEY');
}
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

const CheckoutForm = ({ calculationData }: { calculationData: any }) => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/dashboard`,
        },
      });

      if (error) {
        toast({
          title: "Payment Failed",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Payment Successful",
          description: "Thank you for your purchase! Redirecting to dashboard...",
        });
      }
    } catch (err: any) {
      toast({
        title: "Payment Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-center">Complete Your Payment</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <PaymentElement />
          <Button 
            type="submit"
            disabled={!stripe || !elements || isProcessing}
            className="w-full btn-primary"
          >
            {isProcessing ? (
              <>
                <i className="fas fa-spinner fa-spin mr-2"></i>
                Processing...
              </>
            ) : (
              <>
                <i className="fas fa-lock mr-2"></i>
                Pay {formatCurrency(calculationData?.pricingAmount || 0)}
              </>
            )}
          </Button>
          <div className="text-center">
            <div className="flex items-center justify-center space-x-4 text-xs text-slate-500">
              <div className="flex items-center">
                <i className="fas fa-shield-alt mr-1"></i>
                <span>Secure Payment</span>
              </div>
              <div className="flex items-center">
                <i className="fas fa-lock mr-1"></i>
                <span>256-bit SSL</span>
              </div>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

const PaymentSummary = ({ calculationData }: { calculationData: any }) => {
  if (!calculationData) return null;

  const tierNames = ['Starter', 'Growth', 'Scale', 'Enterprise'];
  const tierName = tierNames[calculationData.pricingTier - 1] || 'Custom';

  return (
    <Card className="max-w-md mx-auto mb-8">
      <CardHeader>
        <CardTitle className="text-center">Payment Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-slate-600">Service Package</span>
            <span className="font-semibold">{tierName}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-600">Estimated Credit</span>
            <span className="font-semibold text-rd-secondary-600">
              {formatCurrency(calculationData.federalCredit)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-600">Total QREs</span>
            <span className="font-semibold">
              {formatCurrency(calculationData.totalQRE)}
            </span>
          </div>
          <div className="border-t border-slate-200 pt-4">
            <div className="flex items-center justify-between">
              <span className="text-lg font-semibold text-slate-900">Total Amount</span>
              <span className="text-2xl font-bold text-rd-primary-500">
                {formatCurrency(calculationData.pricingAmount)}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-semibold text-blue-900 mb-2">What's Included:</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Complete IRS Form 6765 preparation</li>
            <li>• AI-generated technical narratives</li>
            <li>• Detailed expense documentation</li>
            <li>• Professional support and guidance</li>
            <li>• 30-day delivery guarantee</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default function Checkout() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [clientSecret, setClientSecret] = useState("");
  const [calculationData, setCalculationData] = useState<any>(null);

  // Get dashboard data to find latest calculation
  const { data: dashboardData } = useQuery<any>({
    queryKey: ["/api/dashboard"],
    enabled: !!user,
  });

  useEffect(() => {
    if (dashboardData?.calculations && Array.isArray(dashboardData.calculations) && dashboardData.calculations.length > 0) {
      const latestCalculation = dashboardData.calculations[0];
      setCalculationData(latestCalculation);

      // Create PaymentIntent
      paymentService.createPaymentIntent(
        parseFloat(latestCalculation.pricingAmount), 
        latestCalculation.id
      )
        .then((data) => {
          setClientSecret(data.clientSecret);
        })
        .catch((error) => {
          toast({
            title: "Payment Setup Failed",
            description: "Unable to initialize payment. Please try again.",
            variant: "destructive",
          });
          console.error('Payment intent creation failed:', error);
        });
    }
  }, [dashboardData, toast]);

  if (!user) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <i className="fas fa-exclamation-triangle text-4xl text-red-500 mb-4"></i>
          <h3 className="text-xl font-semibold text-slate-900 mb-2">Authentication Required</h3>
          <p className="text-slate-600">Please log in to access the checkout page.</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!calculationData) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <i className="fas fa-calculator text-4xl text-slate-300 mb-4"></i>
          <h3 className="text-xl font-semibold text-slate-900 mb-2">No Calculation Found</h3>
          <p className="text-slate-600">Please complete the calculator first before proceeding to payment.</p>
          <Button className="mt-4 btn-primary" onClick={() => window.location.href = '/'}>
            Go to Calculator
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  if (!clientSecret) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-slate-600">Setting up secure payment...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Secure Checkout</h1>
          <p className="text-slate-600">Complete your R&D tax credit documentation service</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <div>
            <PaymentSummary calculationData={calculationData} />
          </div>
          
          <div>
            <Elements stripe={stripePromise} options={{ clientSecret }}>
              <CheckoutForm calculationData={calculationData} />
            </Elements>
          </div>
        </div>

        <div className="text-center mt-12 p-6 bg-slate-50 rounded-lg">
          <h3 className="font-semibold text-slate-900 mb-4">Questions about payment?</h3>
          <p className="text-slate-600 mb-4">
            Our team is here to help with any questions about pricing or the checkout process.
          </p>
          <div className="flex items-center justify-center space-x-6 text-sm text-slate-500">
            <div className="flex items-center">
              <i className="fas fa-phone mr-2"></i>
              <span>(555) 123-4567</span>
            </div>
            <div className="flex items-center">
              <i className="fas fa-envelope mr-2"></i>
              <span>support@rdtaxcreditpro.com</span>
            </div>
            <div className="flex items-center">
              <i className="fas fa-chat mr-2"></i>
              <span>Live Chat</span>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
