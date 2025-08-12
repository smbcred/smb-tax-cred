import crypto from 'crypto';
import { promisify } from 'util';

const scryptAsync = promisify(crypto.scrypt);

// Encryption configuration
const ENCRYPTION_CONFIG = {
  algorithm: 'aes-256-cbc',
  keyLength: 32,
  ivLength: 16,
  saltLength: 32,
};

// Derive encryption key from password and salt
async function deriveKey(password: string, salt: Buffer): Promise<Buffer> {
  return (await scryptAsync(password, salt, ENCRYPTION_CONFIG.keyLength)) as Buffer;
}

// Get encryption key from environment or generate one
function getEncryptionKey(): string {
  const key = process.env.ENCRYPTION_KEY;
  if (!key && process.env.NODE_ENV !== "production") {
    console.debug('ENCRYPTION_KEY not set. Using an ephemeral dev key.');
    return crypto.randomBytes(32).toString('hex');
  } else if (!key) {
    throw new Error('ENCRYPTION_KEY is required in production');
  }
  return key;
}

const MASTER_KEY = getEncryptionKey();

// Encrypt sensitive data
export async function encryptData(plaintext: string, customKey?: string): Promise<string> {
  try {
    const key = customKey || MASTER_KEY;
    const salt = crypto.randomBytes(ENCRYPTION_CONFIG.saltLength);
    const iv = crypto.randomBytes(ENCRYPTION_CONFIG.ivLength);
    
    const derivedKey = await deriveKey(key, salt);
    const cipher = crypto.createCipheriv(ENCRYPTION_CONFIG.algorithm, derivedKey, iv);
    cipher.setAutoPadding(true);
    
    let encrypted = cipher.update(plaintext, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    // Combine salt, iv, and encrypted data
    const combined = Buffer.concat([
      salt,
      iv,
      Buffer.from(encrypted, 'hex')
    ]);
    
    return combined.toString('base64');
  } catch (error) {
    console.error('Encryption failed:', error);
    throw new Error('Failed to encrypt data');
  }
}

// Decrypt sensitive data
export async function decryptData(encryptedData: string, customKey?: string): Promise<string> {
  try {
    const key = customKey || MASTER_KEY;
    const combined = Buffer.from(encryptedData, 'base64');
    
    // Extract components
    const salt = combined.slice(0, ENCRYPTION_CONFIG.saltLength);
    const iv = combined.slice(ENCRYPTION_CONFIG.saltLength, ENCRYPTION_CONFIG.saltLength + ENCRYPTION_CONFIG.ivLength);
    const encrypted = combined.slice(ENCRYPTION_CONFIG.saltLength + ENCRYPTION_CONFIG.ivLength);
    
    const derivedKey = await deriveKey(key, salt);
    const decipher = crypto.createDecipheriv(ENCRYPTION_CONFIG.algorithm, derivedKey, iv);
    decipher.setAutoPadding(true);
    
    let decrypted = decipher.update(encrypted, undefined, 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    console.error('Decryption failed:', error);
    throw new Error('Failed to decrypt data');
  }
}

// Hash sensitive data (one-way)
export function hashSensitiveData(data: string): string {
  return crypto.createHash('sha256').update(data).digest('hex');
}

// Encrypt PII fields in objects
export async function encryptPII(data: Record<string, any>, piiFields: string[]): Promise<Record<string, any>> {
  const encrypted = { ...data };
  
  for (const field of piiFields) {
    if (encrypted[field] && typeof encrypted[field] === 'string') {
      encrypted[field] = await encryptData(encrypted[field]);
      encrypted[`${field}_encrypted`] = true;
    }
  }
  
  return encrypted;
}

// Decrypt PII fields in objects
export async function decryptPII(data: Record<string, any>, piiFields: string[]): Promise<Record<string, any>> {
  const decrypted = { ...data };
  
  for (const field of piiFields) {
    if (decrypted[field] && decrypted[`${field}_encrypted`]) {
      decrypted[field] = await decryptData(decrypted[field]);
      delete decrypted[`${field}_encrypted`];
    }
  }
  
  return decrypted;
}

// Secure data transmission middleware
export function secureTransmission() {
  return (req: any, res: any, next: any) => {
    // Force HTTPS in production
    if (process.env.NODE_ENV === 'production' && !req.secure) {
      return res.redirect(301, `https://${req.headers.host}${req.url}`);
    }
    
    // Set security headers for data transmission
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    
    next();
  };
}

// Encrypt database fields before storage
export class FieldEncryption {
  private static readonly PII_FIELDS = [
    'email',
    'firstName', 
    'lastName',
    'phone',
    'ssn',
    'ein',
    'addressLine1',
    'addressLine2',
    'bankAccount',
    'routingNumber'
  ];

  static async encryptRecord(record: Record<string, any>): Promise<Record<string, any>> {
    const encrypted = { ...record };
    
    for (const field of this.PII_FIELDS) {
      if (encrypted[field] && typeof encrypted[field] === 'string') {
        encrypted[field] = await encryptData(encrypted[field]);
      }
    }
    
    return encrypted;
  }

  static async decryptRecord(record: Record<string, any>): Promise<Record<string, any>> {
    const decrypted = { ...record };
    
    for (const field of this.PII_FIELDS) {
      if (decrypted[field] && typeof decrypted[field] === 'string') {
        try {
          // Try to decrypt - if it fails, data might not be encrypted
          decrypted[field] = await decryptData(decrypted[field]);
        } catch {
          // Data not encrypted or different format, leave as-is
        }
      }
    }
    
    return decrypted;
  }

  static isPIIField(fieldName: string): boolean {
    return this.PII_FIELDS.includes(fieldName);
  }

  static sanitizeForLogging(data: Record<string, any>): Record<string, any> {
    const sanitized = { ...data };
    
    for (const field of this.PII_FIELDS) {
      if (sanitized[field]) {
        sanitized[field] = '***REDACTED***';
      }
    }
    
    return sanitized;
  }
}

// Key rotation utilities
export class KeyRotation {
  private static readonly KEY_ROTATION_INTERVAL = 90 * 24 * 60 * 60 * 1000; // 90 days

  static generateNewKey(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  static shouldRotateKey(lastRotation: Date): boolean {
    const now = new Date();
    const timeSinceRotation = now.getTime() - lastRotation.getTime();
    return timeSinceRotation > this.KEY_ROTATION_INTERVAL;
  }

  static async rotateEncryptedField(
    oldEncryptedData: string,
    oldKey: string,
    newKey: string
  ): Promise<string> {
    // Decrypt with old key
    const plaintext = await decryptData(oldEncryptedData, oldKey);
    
    // Re-encrypt with new key
    return await encryptData(plaintext, newKey);
  }
}

// Secure random token generation
export function generateSecureToken(length: number = 32): string {
  return crypto.randomBytes(length).toString('hex');
}

// Constant-time string comparison to prevent timing attacks
export function constantTimeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }
  
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  
  return crypto.timingSafeEqual(bufA, bufB);
}

// Environment-specific encryption settings
export function getEncryptionSettings() {
  return {
    enabled: process.env.NODE_ENV === 'production' || process.env.ENABLE_ENCRYPTION === 'true',
    keyRotationEnabled: process.env.KEY_ROTATION_ENABLED === 'true',
    algorithm: ENCRYPTION_CONFIG.algorithm,
    keyLength: ENCRYPTION_CONFIG.keyLength,
  };
}

// Data masking for different purposes
export class DataMasking {
  static maskEmail(email: string): string {
    const [username, domain] = email.split('@');
    const maskedUsername = username.slice(0, 2) + '*'.repeat(username.length - 2);
    return `${maskedUsername}@${domain}`;
  }

  static maskPhone(phone: string): string {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 10) {
      return `${cleaned.slice(0, 3)}***${cleaned.slice(-4)}`;
    }
    return '***' + cleaned.slice(-4);
  }

  static maskSSN(ssn: string): string {
    const cleaned = ssn.replace(/\D/g, '');
    return '***-**-' + cleaned.slice(-4);
  }

  static maskEIN(ein: string): string {
    const cleaned = ein.replace(/\D/g, '');
    return '**-***' + cleaned.slice(-4);
  }

  static maskBankAccount(account: string): string {
    return '****' + account.slice(-4);
  }

  static maskForAudit(data: Record<string, any>): Record<string, any> {
    const masked = { ...data };
    
    if (masked.email) masked.email = this.maskEmail(masked.email);
    if (masked.phone) masked.phone = this.maskPhone(masked.phone);
    if (masked.ssn) masked.ssn = this.maskSSN(masked.ssn);
    if (masked.ein) masked.ein = this.maskEIN(masked.ein);
    if (masked.bankAccount) masked.bankAccount = this.maskBankAccount(masked.bankAccount);
    
    return masked;
  }
}

// Encryption audit logging
export function logEncryptionEvent(
  event: 'encrypt' | 'decrypt' | 'key_rotation' | 'access_denied',
  details: Record<string, any>
): void {
  const logEntry = {
    timestamp: new Date().toISOString(),
    event,
    details: FieldEncryption.sanitizeForLogging(details),
    environment: process.env.NODE_ENV,
  };
  
  console.log('Encryption Event:', JSON.stringify(logEntry));
  
  // In production, send to secure audit service
  if (process.env.NODE_ENV === 'production') {
    // TODO: Integrate with audit logging service
  }
}