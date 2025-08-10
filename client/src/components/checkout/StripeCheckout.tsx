import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, CreditCard, Shield, Clock } from 'lucide-react';
import { assignPricingTier } from '../../../../shared/config/pricing';
import { apiRequest } from '@/lib/queryClient';
import getStripe from '@/services/stripe';

interface StripeCheckoutProps {
  estimatedCredit: number;
  leadId: string;
  customerEmail: string;
  customerName?: string;
  onSuccess?: (sessionId: string) => void;
  onError?: (error: string) => void;
}

export const StripeCheckout: React.FC<StripeCheckoutProps> = ({
  estimatedCredit,
  leadId,
  customerEmail,
  customerName,
  onSuccess,
  onError,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const pricingTier = assignPricingTier(estimatedCredit);

  const handleCheckout = async () => {
    setIsLoading(true);

    try {
      // Get the current domain for success/cancel URLs
      const baseUrl = window.location.origin;
      const successUrl = `${baseUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`;
      const cancelUrl = `${baseUrl}/checkout/cancel`;

      // Create checkout session
      const response = await fetch('/api/checkout/session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          estimatedCredit,
          leadId,
          customerEmail,
          customerName,
          successUrl,
          cancelUrl,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create checkout session');
      }

      const { sessionId, url } = await response.json();

      // Initialize Stripe and redirect to checkout
      const stripe = await getStripe();
      if (!stripe) {
        throw new Error('Stripe failed to initialize');
      }

      // Track analytics event
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'begin_checkout', {
          currency: 'USD',
          value: pricingTier.price / 100,
          items: [{
            item_id: `tier_${pricingTier.tier}`,
            item_name: `${pricingTier.name} Tier`,
            category: 'R&D Tax Credit Documentation',
            quantity: 1,
            price: pricingTier.price / 100,
          }],
        });
      }

      // Redirect to Stripe checkout
      const { error } = await stripe.redirectToCheckout({ sessionId });

      if (error) {
        throw error;
      }

      onSuccess?.(sessionId);
    } catch (error) {
      console.error('Checkout error:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      onError?.(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{pricingTier.name} Tier</span>
          {pricingTier.popular && <Badge variant="secondary">Most Popular</Badge>}
        </CardTitle>
        <CardDescription>
          For estimated credits of ${estimatedCredit.toLocaleString()}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Pricing Display */}
        <div className="text-center">
          <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            {pricingTier.displayPrice}
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {pricingTier.description}
          </p>
        </div>

        {/* Features List */}
        <div className="space-y-2">
          <h4 className="font-semibold text-sm text-gray-900 dark:text-gray-100">What's included:</h4>
          <ul className="space-y-1">
            {pricingTier.features.slice(0, 4).map((feature: string, index: number) => (
              <li key={index} className="flex items-start text-sm text-gray-600 dark:text-gray-400">
                <span className="text-green-500 mr-2">✓</span>
                {feature}
              </li>
            ))}
          </ul>
        </div>

        {/* Trust Signals */}
        <div className="flex items-center justify-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
          <div className="flex items-center">
            <Shield className="h-3 w-3 mr-1" />
            Secure Payment
          </div>
          <div className="flex items-center">
            <Clock className="h-3 w-3 mr-1" />
            48h Delivery
          </div>
        </div>

        {/* Checkout Button */}
        <Button
          onClick={handleCheckout}
          disabled={isLoading}
          className="w-full"
          size="lg"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <CreditCard className="h-4 w-4 mr-2" />
              Secure Checkout
            </>
          )}
        </Button>

        {/* Payment Methods */}
        <div className="text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
            Powered by Stripe
          </p>
          <div className="flex justify-center items-center space-x-2 text-xs text-gray-400">
            <span>💳 Credit Card</span>
            <span>•</span>
            <span>🛡️ SSL Secured</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StripeCheckout;