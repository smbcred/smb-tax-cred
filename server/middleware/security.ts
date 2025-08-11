import { Request, Response, NextFunction } from 'express';
import { createHash, randomBytes } from 'crypto';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';

// Content Security Policy configuration
const cspConfig = {
  directives: {
    defaultSrc: ["'self'"],
    scriptSrc: [
      "'self'",
      "'unsafe-inline'", // Allow inline scripts for Vite dev
      "'unsafe-eval'", // Allow eval for development
      "https://js.stripe.com",
      "https://www.googletagmanager.com",
      "https://replit.com",
    ],
    styleSrc: [
      "'self'",
      "'unsafe-inline'", // Allow inline styles for Tailwind
      "https://fonts.googleapis.com",
    ],
    fontSrc: [
      "'self'",
      "https://fonts.gstatic.com",
    ],
    imgSrc: [
      "'self'",
      "data:",
      "https:",
      "blob:",
    ],
    connectSrc: [
      "'self'",
      "https://api.stripe.com",
      "wss:",
      process.env.NODE_ENV === 'development' ? "ws://localhost:*" : "",
    ].filter(Boolean),
    frameSrc: [
      "'self'",
      "https://js.stripe.com",
    ],
    objectSrc: ["'none'"],
    upgradeInsecureRequests: process.env.NODE_ENV === 'production' ? [] : null,
  },
};

// Security headers middleware using Helmet
export function securityHeaders() {
  return helmet({
    contentSecurityPolicy: process.env.NODE_ENV === 'production' ? cspConfig : false,
    crossOriginEmbedderPolicy: false, // Allow Stripe embeds
    hsts: {
      maxAge: 31536000, // 1 year
      includeSubDomains: true,
      preload: true,
    },
    frameguard: {
      action: 'deny',
    },
    noSniff: true,
    xssFilter: true,
    referrerPolicy: {
      policy: 'strict-origin-when-cross-origin',
    },
  });
}

// Input sanitization middleware
export function inputSanitization() {
  return (req: Request, res: Response, next: NextFunction) => {
    // Sanitize request body
    if (req.body && typeof req.body === 'object') {
      req.body = sanitizeObject(req.body);
    }

    // Sanitize query parameters
    if (req.query && typeof req.query === 'object') {
      req.query = sanitizeObject(req.query);
    }

    // Sanitize URL parameters
    if (req.params && typeof req.params === 'object') {
      req.params = sanitizeObject(req.params);
    }

    next();
  };
}

// Recursive object sanitization
function sanitizeObject(obj: any): any {
  if (typeof obj !== 'object' || obj === null) {
    return sanitizeString(obj);
  }

  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item));
  }

  const sanitized: any = {};
  for (const [key, value] of Object.entries(obj)) {
    const sanitizedKey = sanitizeString(key);
    sanitized[sanitizedKey] = sanitizeObject(value);
  }

  return sanitized;
}

// String sanitization for XSS prevention
function sanitizeString(input: any): any {
  if (typeof input !== 'string') {
    return input;
  }

  return input
    // Remove script tags
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    // Remove javascript: protocol
    .replace(/javascript:/gi, '')
    // Remove on* event handlers
    .replace(/\s*on\w+\s*=\s*['""][^'""]*[''""]/gi, '')
    // Remove data: URLs (except safe image types)
    .replace(/data:(?!image\/(png|jpe?g|gif|webp|svg\+xml))[^;,]*[;,]/gi, 'data:text/plain,')
    // Normalize whitespace
    .trim();
}

// SQL injection prevention for query parameters
export function sqlInjectionPrevention() {
  return (req: Request, res: Response, next: NextFunction) => {
    const suspiciousPatterns = [
      /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b)/gi,
      /('|(\\x27)|(\\x2D\\x2D)|(\%27)|(\%2D\%2D))/gi,
      /(\\x00|\\n|\\r|\\x1a)/gi,
      /(\bOR\b|\bAND\b)\s+\d+\s*=\s*\d+/gi,
    ];

    function checkForSQLInjection(obj: any, path = ''): string | null {
      if (typeof obj === 'string') {
        for (const pattern of suspiciousPatterns) {
          if (pattern.test(obj)) {
            return `${path}: Potential SQL injection detected`;
          }
        }
      } else if (typeof obj === 'object' && obj !== null) {
        for (const [key, value] of Object.entries(obj)) {
          const result = checkForSQLInjection(value, path ? `${path}.${key}` : key);
          if (result) return result;
        }
      }
      return null;
    }

    // Check body, query, and params
    const bodyCheck = req.body ? checkForSQLInjection(req.body, 'body') : null;
    const queryCheck = req.query ? checkForSQLInjection(req.query, 'query') : null;
    const paramsCheck = req.params ? checkForSQLInjection(req.params, 'params') : null;

    const suspiciousInput = bodyCheck || queryCheck || paramsCheck;
    
    if (suspiciousInput) {
      console.warn(`SQL injection attempt blocked: ${suspiciousInput}`, {
        ip: req.ip,
        userAgent: req.get('user-agent'),
        url: req.url,
        method: req.method,
      });

      return res.status(400).json({
        error: 'Invalid input detected',
        message: 'Please check your input and try again',
      });
    }

    next();
  };
}

// File upload security
export function fileUploadSecurity() {
  return (req: Request, res: Response, next: NextFunction) => {
    if (req.files || req.file) {
      const files = Array.isArray(req.files) ? req.files : req.file ? [req.file] : [];
      
      for (const file of files) {
        // Check file type
        const allowedTypes = [
          'image/jpeg',
          'image/png',
          'image/gif',
          'image/webp',
          'application/pdf',
          'text/plain',
          'text/csv',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'application/vnd.ms-excel',
        ];

        if (!allowedTypes.includes(file.mimetype)) {
          return res.status(400).json({
            error: 'Invalid file type',
            message: 'Only images, PDFs, and spreadsheets are allowed',
          });
        }

        // Check file size (10MB limit)
        if (file.size > 10 * 1024 * 1024) {
          return res.status(400).json({
            error: 'File too large',
            message: 'Files must be smaller than 10MB',
          });
        }

        // Check filename for suspicious patterns
        const suspiciousFilenamePatterns = [
          /\.(php|asp|jsp|exe|sh|bat|cmd)$/i,
          /\.\./,
          /[<>:"|?*]/,
        ];

        for (const pattern of suspiciousFilenamePatterns) {
          if (pattern.test(file.originalname || file.name || '')) {
            return res.status(400).json({
              error: 'Invalid filename',
              message: 'Filename contains invalid characters',
            });
          }
        }
      }
    }

    next();
  };
}

// Password security validation
export function passwordSecurity(password: string): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }

  if (password.length > 128) {
    errors.push('Password must be less than 128 characters long');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }

  // Check for common weak patterns
  const weakPatterns = [
    /(.)\1{2,}/, // Repeated characters
    /123|abc|qwerty|password/i, // Common sequences
  ];

  for (const pattern of weakPatterns) {
    if (pattern.test(password)) {
      errors.push('Password contains weak patterns');
      break;
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

// Generate secure random tokens
export function generateSecureToken(length = 32): string {
  return randomBytes(length).toString('hex');
}

// Hash sensitive data
export function hashSensitiveData(data: string, salt?: string): string {
  const actualSalt = salt || randomBytes(16).toString('hex');
  return createHash('sha256').update(data + actualSalt).digest('hex');
}

// Timing-safe string comparison to prevent timing attacks
export function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }

  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }

  return result === 0;
}

// IP address validation and extraction
export function getClientIP(req: Request): string {
  const forwarded = req.headers['x-forwarded-for'];
  const realIP = req.headers['x-real-ip'];
  
  if (forwarded && typeof forwarded === 'string') {
    return forwarded.split(',')[0].trim();
  }
  
  if (realIP && typeof realIP === 'string') {
    return realIP.trim();
  }
  
  return req.socket.remoteAddress || req.connection.remoteAddress || 'unknown';
}

// Security event logging
export function logSecurityEvent(
  event: string,
  req: Request,
  details?: Record<string, any>
) {
  const logData = {
    timestamp: new Date().toISOString(),
    event,
    ip: getClientIP(req),
    userAgent: req.get('user-agent'),
    url: req.url,
    method: req.method,
    userId: (req as any).user?.id,
    ...details,
  };

  console.warn('Security Event:', logData);
  
  // In production, send to security monitoring service
  if (process.env.NODE_ENV === 'production') {
    // TODO: Integrate with security monitoring service
  }
}

// Rate limiting for brute force protection
export function bruteForceProtection() {
  return rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Maximum 5 attempts per window
    message: {
      error: 'Too many failed attempts',
      message: 'Please try again later',
      retryAfter: 900, // 15 minutes in seconds
    },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req: Request) => {
      // Rate limit by IP and email/username if provided
      const ip = getClientIP(req);
      const identifier = req.body?.email || req.body?.username || '';
      return `${ip}:${identifier}`;
    },
    skip: (req: Request) => {
      // Skip rate limiting for successful logins
      return res.locals?.loginSuccess === true;
    },
    handler: (req: Request, res: Response) => {
      logSecurityEvent('brute_force_attempt', req, {
        identifier: req.body?.email || req.body?.username,
      });
      res.status(429).json({
        error: 'Too many failed attempts',
        message: 'Please try again later',
        retryAfter: 900,
      });
    },
  });
}

// CORS configuration
export function corsConfig() {
  const allowedOrigins = [
    process.env.FRONTEND_URL,
    'http://localhost:3000',
    'http://localhost:5173',
    // Add production domains
  ].filter(Boolean);

  return {
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
      // Allow requests with no origin (mobile apps, etc.)
      if (!origin) return callback(null, true);
      
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Origin',
      'X-Requested-With',
      'Content-Type',
      'Accept',
      'Authorization',
      'X-CSRF-Token',
    ],
    exposedHeaders: ['X-Total-Count'],
    maxAge: 86400, // 24 hours
  };
}

// Security middleware combination
export function applySecurity() {
  return [
    securityHeaders(),
    inputSanitization(),
    sqlInjectionPrevention(),
    fileUploadSecurity(),
  ];
}