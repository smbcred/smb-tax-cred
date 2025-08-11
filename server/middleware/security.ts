/**
 * Security middleware configuration
 * Implements helmet headers and other security measures for admin routes
 */

import helmet from 'helmet';
import { Request, Response, NextFunction } from 'express';

/**
 * Helmet configuration for admin routes
 * Provides comprehensive security headers
 */
export const adminHelmetConfig = helmet({
  // Content Security Policy
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https://api.stripe.com"],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
      baseUri: ["'self'"],
      formAction: ["'self'"],
    },
  },
  
  // Cross-Origin Embedder Policy
  crossOriginEmbedderPolicy: true,
  
  // Cross-Origin Opener Policy
  crossOriginOpenerPolicy: { policy: "same-origin" },
  
  // Cross-Origin Resource Policy
  crossOriginResourcePolicy: { policy: "same-origin" },
  
  // DNS Prefetch Control
  dnsPrefetchControl: { allow: false },
  
  // Frame Options
  frameguard: { action: 'deny' },
  
  // Hide Powered By
  hidePoweredBy: true,
  
  // HTTP Strict Transport Security
  hsts: {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true
  },
  
  // IE No Open
  ieNoOpen: true,
  
  // No Sniff
  noSniff: true,
  
  // Origin Agent Cluster
  originAgentCluster: true,
  
  // Permitted Cross Domain Policies
  permittedCrossDomainPolicies: false,
  
  // Referrer Policy
  referrerPolicy: { policy: "no-referrer" },
  
  // X-XSS-Protection
  xssFilter: true
});

/**
 * IP allowlist middleware (optional)
 * Checks if request IP is in allowed list for admin access
 */
export const ipAllowlistMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const allowedIPs = process.env.ADMIN_IP_ALLOWLIST?.split(',').map(ip => ip.trim()) || [];
  
  // Skip if no allowlist configured
  if (allowedIPs.length === 0) {
    return next();
  }
  
  const clientIP = req.ip || 
    req.connection.remoteAddress || 
    req.socket.remoteAddress ||
    (req.headers['x-forwarded-for'] as string)?.split(',')[0];
  
  // Allow localhost for development
  const localhostIPs = ['127.0.0.1', '::1', 'localhost'];
  if (process.env.NODE_ENV === 'development' && localhostIPs.includes(clientIP)) {
    return next();
  }
  
  if (!allowedIPs.includes(clientIP)) {
    console.warn(`Admin access denied for IP: ${maskSecrets(clientIP)}`);
    return res.status(403).json({ 
      error: 'Access denied', 
      message: 'IP address not authorized for admin access' 
    });
  }
  
  next();
};

/**
 * Secret masking utility
 * Replaces sensitive values in objects/strings for logging
 */
export const maskSecrets = (obj: any): any => {
  if (typeof obj === 'string') {
    return maskStringSecrets(obj);
  }
  
  if (typeof obj !== 'object' || obj === null) {
    return obj;
  }
  
  if (Array.isArray(obj)) {
    return obj.map(maskSecrets);
  }
  
  const masked: any = {};
  for (const [key, value] of Object.entries(obj)) {
    if (isSensitiveKey(key)) {
      masked[key] = '***MASKED***';
    } else {
      masked[key] = maskSecrets(value);
    }
  }
  
  return masked;
};

/**
 * Check if a key name indicates sensitive data
 */
const isSensitiveKey = (key: string): boolean => {
  const sensitiveKeys = [
    'password', 'passwordHash', 'secret', 'token', 'key', 'auth', 'authorization',
    'stripe', 'api', 'jwt', 'refresh', 'access', 'private', 'credential',
    'STRIPE_SECRET_KEY', 'JWT_SECRET', 'DATABASE_URL', 'SENDGRID_API_KEY',
    'CLAUDE_API_KEY', 'DOCUMINT_API_KEY', 'AIRTABLE_API_KEY'
  ];
  
  const lowerKey = key.toLowerCase();
  return sensitiveKeys.some(sensitive => lowerKey.includes(sensitive.toLowerCase()));
};

/**
 * Mask secrets in strings (URLs, connection strings, etc.)
 */
const maskStringSecrets = (str: string): string => {
  // Mask database URLs
  str = str.replace(/(postgresql:\/\/[^:]+:)[^@]+(@)/g, '$1***MASKED***$2');
  
  // Mask API keys in URLs
  str = str.replace(/([?&](?:key|token|secret|auth)=)[^&]+/gi, '$1***MASKED***');
  
  // Mask JWT tokens
  str = str.replace(/eyJ[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+/g, '***MASKED_JWT***');
  
  // Mask Stripe keys
  str = str.replace(/sk_[a-zA-Z0-9_]+/g, '***MASKED_STRIPE_KEY***');
  str = str.replace(/pk_[a-zA-Z0-9_]+/g, '***MASKED_STRIPE_PUBKEY***');
  
  return str;
};

/**
 * Response security middleware
 * Ensures sensitive data is never returned in responses
 */
export const responseSecurityMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const originalJson = res.json;
  
  res.json = function(obj: any) {
    // Mask secrets in response data
    const maskedObj = maskSecrets(obj);
    return originalJson.call(this, maskedObj);
  };
  
  next();
};