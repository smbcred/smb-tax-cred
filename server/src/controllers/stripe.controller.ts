import { Request, Response } from "express";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, { 
  apiVersion: "2024-06-20" 
});

export async function postCheckout(req: Request, res: Response) {
  try {
    const { priceId, metadata } = req.body || {};
    
    if (!priceId) {
      return res.status(400).json({ error: "MISSING_PRICE_ID" });
    }
    
    // Extract pricing info from metadata to calculate dynamic price
    const { credit, tier, email } = metadata || {};
    const creditAmount = parseInt(credit) || 0;
    
    // Import pricing utility
    const { tierFor } = await import("@shared/config/pricing");
    const pricingTier = tierFor(creditAmount);
    
    const base = process.env.CLIENT_URL || "http://localhost:5000";
    
    // Use dynamic pricing instead of predefined price IDs
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: {
            name: `R&D Tax Credit Documentation - Tier ${pricingTier.tier}`,
            description: `Complete IRS-compliant documentation package for estimated credit of $${creditAmount.toLocaleString()}`,
          },
          unit_amount: pricingTier.price * 100, // Convert to cents
        },
        quantity: 1,
      }],
      success_url: `${base}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${base}/calculator`,
      customer_email: email,
      metadata: Object.fromEntries(
        Object.entries(metadata || {}).map(([k, v]) => [k, String(v)])
      ),
      billing_address_collection: 'required',
    });
    
    res.json({ url: session.url });
  } catch (e: any) {
    console.error("Stripe checkout error", e);
    res.status(500).json({ error: "CHECKOUT_ERROR" });
  }
}