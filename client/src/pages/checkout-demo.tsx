import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import StripeCheckout from '@/components/checkout/StripeCheckout';
import { assignPricingTier } from '../../../shared/config/pricing';

const CheckoutDemo: React.FC = () => {
  const [estimatedCredit, setEstimatedCredit] = useState(15000);
  const [customerEmail, setCustomerEmail] = useState('test@example.com');
  const [customerName, setCustomerName] = useState('Test Customer');
  const [showCheckout, setShowCheckout] = useState(false);
  
  // Generate a mock lead ID for demo
  const mockLeadId = 'demo-lead-' + Math.random().toString(36).substr(2, 9);
  
  const pricingTier = assignPricingTier(estimatedCredit);

  const handleSuccess = (sessionId: string) => {
    console.log('Checkout successful:', sessionId);
    alert(`Checkout successful! Session ID: ${sessionId}`);
  };

  const handleError = (error: string) => {
    console.error('Checkout error:', error);
    alert(`Checkout error: ${error}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Stripe Checkout Demo
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Test the Stripe checkout integration with live configuration
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Configuration Panel */}
          <Card>
            <CardHeader>
              <CardTitle>Demo Configuration</CardTitle>
              <CardDescription>
                Adjust these values to test different pricing tiers
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="credit">Estimated R&D Credit ($)</Label>
                <Input
                  id="credit"
                  type="number"
                  value={estimatedCredit}
                  onChange={(e) => setEstimatedCredit(Number(e.target.value))}
                  min={0}
                  max={500000}
                  step={1000}
                />
              </div>
              
              <div>
                <Label htmlFor="email">Customer Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                />
              </div>
              
              <div>
                <Label htmlFor="name">Customer Name</Label>
                <Input
                  id="name"
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                />
              </div>

              <div className="pt-4 border-t">
                <h4 className="font-semibold mb-2">Calculated Tier:</h4>
                <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                  <p className="font-medium">{pricingTier.name} Tier</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {pricingTier.description}
                  </p>
                  <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                    {pricingTier.displayPrice}
                  </p>
                </div>
              </div>

              <Button
                onClick={() => setShowCheckout(!showCheckout)}
                className="w-full"
              >
                {showCheckout ? 'Hide Checkout' : 'Show Checkout'}
              </Button>
            </CardContent>
          </Card>

          {/* Checkout Component */}
          <div>
            {showCheckout ? (
              <StripeCheckout
                estimatedCredit={estimatedCredit}
                leadId={mockLeadId}
                customerEmail={customerEmail}
                customerName={customerName}
                onSuccess={handleSuccess}
                onError={handleError}
              />
            ) : (
              <Card>
                <CardContent className="flex items-center justify-center h-96">
                  <div className="text-center text-gray-500 dark:text-gray-400">
                    <p className="text-lg mb-2">Checkout Hidden</p>
                    <p className="text-sm">Click "Show Checkout" to test</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Debug Information */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Debug Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold mb-2">Configuration:</h4>
                <pre className="bg-gray-100 dark:bg-gray-800 p-3 rounded text-xs">
{JSON.stringify({
  estimatedCredit,
  customerEmail,
  customerName,
  leadId: mockLeadId,
}, null, 2)}
                </pre>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Pricing Tier:</h4>
                <pre className="bg-gray-100 dark:bg-gray-800 p-3 rounded text-xs">
{JSON.stringify({
  tier: pricingTier.tier,
  name: pricingTier.name,
  price: pricingTier.price,
  displayPrice: pricingTier.displayPrice,
  minCredit: pricingTier.minCredit,
  maxCredit: pricingTier.maxCredit,
}, null, 2)}
                </pre>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CheckoutDemo;