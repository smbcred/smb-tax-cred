import express, { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import rateLimit from 'express-rate-limit';
import { createCheckoutSession } from '../services/stripe.js';
import { assignPricingTier } from '../../shared/config/pricing.js';

const router = express.Router();

// Rate limiting for checkout endpoints
const checkoutRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 checkout attempts per windowMs
  message: {
    error: 'Too many checkout attempts, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Validation middleware for checkout session creation
const validateCheckoutSession = [
  body('estimatedCredit')
    .isNumeric()
    .withMessage('Estimated credit must be a number')
    .isFloat({ min: 0, max: 1000000 })
    .withMessage('Estimated credit must be between 0 and 1,000,000'),
  body('leadId')
    .isUUID()
    .withMessage('Lead ID must be a valid UUID'),
  body('customerEmail')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required'),
  body('customerName')
    .optional()
    .isLength({ min: 1, max: 100 })
    .trim()
    .withMessage('Customer name must be between 1-100 characters'),
  body('successUrl')
    .isURL()
    .withMessage('Success URL must be a valid URL'),
  body('cancelUrl')
    .isURL()
    .withMessage('Cancel URL must be a valid URL'),
];

// POST /api/checkout/session - Create Stripe checkout session
router.post('/session', checkoutRateLimit, validateCheckoutSession, async (req: Request, res: Response) => {
  try {
    // Check validation results
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array(),
      });
    }

    const {
      estimatedCredit,
      leadId,
      customerEmail,
      customerName,
      successUrl,
      cancelUrl,
    } = req.body;

    // Assign pricing tier based on estimated credit
    const pricingTier = assignPricingTier(estimatedCredit);

    // Create Stripe checkout session
    const session = await createCheckoutSession({
      priceInCents: pricingTier.price,
      tierName: pricingTier.name,
      estimatedCredit,
      leadId,
      customerEmail,
      customerName,
      successUrl,
      cancelUrl,
    });

    res.json({
      sessionId: session.id,
      url: session.url,
      tier: {
        name: pricingTier.name,
        price: pricingTier.displayPrice,
        description: pricingTier.description,
      },
    });
  } catch (error) {
    console.error('Checkout session creation failed:', error);
    res.status(500).json({
      error: 'Failed to create checkout session',
      message: 'Please try again or contact support if the problem persists.',
    });
  }
});

// GET /api/checkout/session/:sessionId - Retrieve session details
router.get('/session/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    if (!sessionId || typeof sessionId !== 'string') {
      return res.status(400).json({
        error: 'Valid session ID is required',
      });
    }

    // Note: In a real implementation, you might want to verify the session
    // belongs to the current user or add additional security checks
    
    res.json({
      sessionId,
      status: 'Session retrieval not fully implemented - use webhooks for status updates',
    });
  } catch (error) {
    console.error('Session retrieval failed:', error);
    res.status(500).json({
      error: 'Failed to retrieve session',
    });
  }
});

export default router;