import rateLimit from "express-rate-limit";

// Rate limiting for lead capture (5 requests per IP per hour)
export const leadCaptureRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  message: "Too many lead capture attempts from this IP, please try again later",
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiting for auth endpoints (5 attempts per IP per 15 minutes)
export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  message: "Too many authentication attempts from this IP, please try again later",
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiting for auto-save endpoints (100 requests per user per 5 minutes)
export const autoSaveRateLimit = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 100,
  message: "Too many auto-save attempts, please try again later",
  standardHeaders: true,
  legacyHeaders: false,
});