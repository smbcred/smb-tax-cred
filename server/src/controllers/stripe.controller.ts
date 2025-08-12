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
    
    const base = process.env.CLIENT_URL || "http://localhost:5173";
    
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${base}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${base}/calculator`,
      metadata: Object.fromEntries(
        Object.entries(metadata || {}).map(([k, v]) => [k, String(v)])
      ),
    });
    
    res.json({ url: session.url });
  } catch (e: any) {
    console.error("Stripe checkout error", e);
    res.status(500).json({ error: "CHECKOUT_ERROR" });
  }
}