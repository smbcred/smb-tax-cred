import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

export interface WebhookRequest extends Request {
  rawBody?: Buffer;
  webhookSignature?: string;
  webhookSource?: string;
}

// Middleware to capture raw body for webhook signature verification
export const captureRawBody = (req: WebhookRequest, res: Response, next: NextFunction) => {
  if (req.path.startsWith('/api/webhooks/')) {
    const chunks: Buffer[] = [];
    
    req.on('data', (chunk) => {
      chunks.push(chunk);
    });
    
    req.on('end', () => {
      req.rawBody = Buffer.concat(chunks);
      // Parse JSON manually after capturing raw body
      try {
        req.body = JSON.parse(req.rawBody.toString());
      } catch (error) {
        req.body = {};
      }
      next();
    });
  } else {
    next();
  }
};

// Verify Make.com webhook signature
export const verifyMakeSignature = (secret: string) => {
  return (req: WebhookRequest, res: Response, next: NextFunction) => {
    const signature = req.headers['x-make-signature'] as string;
    const timestamp = req.headers['x-make-timestamp'] as string;
    
    if (!signature || !timestamp) {
      req.webhookSignature = 'missing';
      return next();
    }
    
    if (!req.rawBody) {
      req.webhookSignature = 'no-body';
      return next();
    }
    
    try {
      // Make.com signature format: sha256=<hash>
      const expectedSignature = crypto
        .createHmac('sha256', secret)
        .update(timestamp + req.rawBody.toString())
        .digest('hex');
      
      const providedSignature = signature.replace('sha256=', '');
      
      // Use timing-safe comparison
      const isValid = crypto.timingSafeEqual(
        Buffer.from(expectedSignature, 'hex'),
        Buffer.from(providedSignature, 'hex')
      );
      
      req.webhookSignature = isValid ? 'valid' : 'invalid';
      req.webhookSource = 'make';
      
      // Check timestamp to prevent replay attacks (within 5 minutes)
      const timestampMs = parseInt(timestamp) * 1000;
      const currentTime = Date.now();
      const timeDiff = Math.abs(currentTime - timestampMs);
      const maxAgeMs = 5 * 60 * 1000; // 5 minutes
      
      if (timeDiff > maxAgeMs) {
        req.webhookSignature = 'expired';
      }
      
    } catch (error) {
      console.error('Webhook signature verification error:', error);
      req.webhookSignature = 'error';
    }
    
    next();
  };
};

// Verify generic webhook signature (for other services)
export const verifyGenericSignature = (secret: string, headerName = 'x-webhook-signature') => {
  return (req: WebhookRequest, res: Response, next: NextFunction) => {
    const signature = req.headers[headerName] as string;
    
    if (!signature) {
      req.webhookSignature = 'missing';
      return next();
    }
    
    if (!req.rawBody) {
      req.webhookSignature = 'no-body';
      return next();
    }
    
    try {
      const expectedSignature = crypto
        .createHmac('sha256', secret)
        .update(req.rawBody)
        .digest('hex');
      
      const providedSignature = signature.replace(/^(sha256=|hmac-sha256=)/, '');
      
      const isValid = crypto.timingSafeEqual(
        Buffer.from(expectedSignature, 'hex'),
        Buffer.from(providedSignature, 'hex')
      );
      
      req.webhookSignature = isValid ? 'valid' : 'invalid';
      
    } catch (error) {
      console.error('Generic webhook signature verification error:', error);
      req.webhookSignature = 'error';
    }
    
    next();
  };
};

// Log webhook events for debugging and audit trail
export const logWebhookEvent = (req: WebhookRequest, res: Response, next: NextFunction) => {
  const logData = {
    method: req.method,
    path: req.path,
    headers: {
      'content-type': req.headers['content-type'],
      'user-agent': req.headers['user-agent'],
      'x-forwarded-for': req.headers['x-forwarded-for'],
    },
    signature: req.webhookSignature,
    source: req.webhookSource,
    bodySize: req.rawBody?.length || 0,
    timestamp: new Date().toISOString(),
  };
  
  console.log('Webhook event received:', logData);
  next();
};