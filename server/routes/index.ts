import { Router } from "express";

const router = Router();

// Import all route modules directly
import adminRoutes from "./admin.js";
import analyticsRoutes from "./analytics.js"; 
import authRoutes from "./auth.js";
import checkoutRoutes from "./checkout.js";
import feedbackRoutes from "./feedback.js";
import healthRoutes from "./health.js";
import helpRoutes from "./help.js";
import monitoringRoutes from "./monitoring.js";
import supportRoutes from "./support.js";

// Mount routes with their respective paths
router.use("/admin", adminRoutes);
router.use("/analytics", analyticsRoutes);
router.use("/auth", authRoutes);
router.use("/checkout", checkoutRoutes);
router.use("/feedback", feedbackRoutes);
router.use("/health", healthRoutes);
router.use("/help", helpRoutes);
router.use("/monitoring", monitoringRoutes);
router.use("/support", supportRoutes);

console.log("[Routes] Auto-mounted 9 route modules");

export default router;