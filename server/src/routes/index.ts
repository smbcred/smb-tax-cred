import { Router } from "express";

const router = Router();

// Import all route modules directly
import stripeRoutes from "./stripe.routes.js";

// Mount routes with their respective paths  
router.use("/stripe", stripeRoutes);

console.log("[Src/Routes] Auto-mounted 1 route module");

export default router;