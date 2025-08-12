import { Router } from 'express';
import { postCheckout } from '../controllers/stripe.controller';

const router = Router();

// Checkout endpoint that the calculator calls
router.post('/checkout', postCheckout);

export default router;