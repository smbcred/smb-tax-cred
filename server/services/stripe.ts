import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing STRIPE_SECRET_KEY environment variable');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-07-30.basil',
  typescript: true,
});

export interface CreateCheckoutSessionParams {
  priceInCents: number;
  tierName: string;
  estimatedCredit: number;
  leadId: string;
  customerEmail: string;
  customerName?: string;
  successUrl: string;
  cancelUrl: string;
}

export async function createCheckoutSession(params: CreateCheckoutSessionParams): Promise<Stripe.Checkout.Session> {
  const {
    priceInCents,
    tierName,
    estimatedCredit,
    leadId,
    customerEmail,
    customerName,
    successUrl,
    cancelUrl
  } = params;

  return await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: `R&D Tax Credit Documentation - ${tierName} Tier`,
            description: `Complete IRS-compliant documentation package for estimated credit of $${estimatedCredit.toLocaleString()}`,
            images: [], // Add product images if available
          },
          unit_amount: priceInCents,
        },
        quantity: 1,
      },
    ],
    mode: 'payment',
    success_url: successUrl,
    cancel_url: cancelUrl,
    customer_email: customerEmail,
    metadata: {
      leadId,
      tierName,
      estimatedCredit: estimatedCredit.toString(),
      customerName: customerName || '',
    },
    billing_address_collection: 'required',
    shipping_address_collection: {
      allowed_countries: ['US'], // R&D tax credits are US-specific
    },
    payment_intent_data: {
      metadata: {
        leadId,
        tierName,
        estimatedCredit: estimatedCredit.toString(),
      },
    },
  });
}