import { Request, Response, NextFunction } from 'express';
import { z, ZodSchema, ZodError } from 'zod';
import { validationResult, ValidationChain, body, query, param } from 'express-validator';

// Enhanced validation middleware for Zod schemas
export function validateSchema<T>(schema: ZodSchema<T>, source: 'body' | 'query' | 'params' = 'body') {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = req[source];
      const validated = schema.parse(data);
      
      // Replace the request data with validated/sanitized data
      (req as any)[source] = validated;
      
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const formattedErrors = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
          code: err.code,
          received: err.code === 'invalid_type' ? typeof err.received : err.received,
        }));

        return res.status(400).json({
          error: 'Validation failed',
          message: 'Please check your input and try again',
          details: formattedErrors,
        });
      }

      console.error('Validation middleware error:', error);
      return res.status(500).json({
        error: 'Internal validation error',
        message: 'An unexpected error occurred during validation',
      });
    }
  };
}

// Express-validator middleware wrapper
export function validateFields(validations: ValidationChain[]) {
  return [
    ...validations,
    (req: Request, res: Response, next: NextFunction) => {
      const errors = validationResult(req);
      
      if (!errors.isEmpty()) {
        const formattedErrors = errors.array().map(error => ({
          field: error.type === 'field' ? error.path : 'unknown',
          message: error.msg,
          value: error.type === 'field' ? error.value : undefined,
        }));

        return res.status(400).json({
          error: 'Validation failed',
          message: 'Please check your input and try again',
          details: formattedErrors,
        });
      }

      next();
    },
  ];
}

// Common validation schemas
export const emailSchema = z.string().email('Invalid email address').max(255);

export const passwordSchema = z.string()
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password must be less than 128 characters')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/\d/, 'Password must contain at least one number')
  .regex(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/, 'Password must contain at least one special character');

export const phoneSchema = z.string()
  .regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format')
  .optional();

export const einSchema = z.string()
  .regex(/^\d{2}-?\d{7}$/, 'EIN must be in format XX-XXXXXXX')
  .optional();

export const urlSchema = z.string()
  .url('Invalid URL format')
  .max(2048, 'URL too long')
  .optional();

export const nameSchema = z.string()
  .min(1, 'Name is required')
  .max(100, 'Name too long')
  .regex(/^[a-zA-Z\s\-'.]+$/, 'Name contains invalid characters');

export const companyNameSchema = z.string()
  .min(1, 'Company name is required')
  .max(255, 'Company name too long')
  .regex(/^[a-zA-Z0-9\s\-'.,&()]+$/, 'Company name contains invalid characters');

export const amountSchema = z.number()
  .positive('Amount must be positive')
  .max(1000000000, 'Amount too large')
  .multipleOf(0.01, 'Amount must have at most 2 decimal places');

export const yearSchema = z.number()
  .int('Year must be an integer')
  .min(2000, 'Year too old')
  .max(new Date().getFullYear() + 1, 'Year cannot be in the future');

// Sanitization utilities
export function sanitizeEmail(email: string): string {
  return email.toLowerCase().trim();
}

export function sanitizeName(name: string): string {
  return name.trim().replace(/\s+/g, ' ');
}

export function sanitizePhoneNumber(phone: string): string {
  return phone.replace(/\D/g, '');
}

export function sanitizeUrl(url: string): string {
  return url.trim().toLowerCase();
}

// Advanced input validation patterns
export const secureStringSchema = (maxLength = 255) => z.string()
  .max(maxLength, `Text too long (max ${maxLength} characters)`)
  .regex(/^[^<>{}]*$/, 'Text contains invalid characters')
  .transform(str => str.trim());

export const alphanumericSchema = (maxLength = 50) => z.string()
  .max(maxLength, `Text too long (max ${maxLength} characters)`)
  .regex(/^[a-zA-Z0-9_-]+$/, 'Only letters, numbers, underscores, and hyphens allowed');

export const slugSchema = z.string()
  .max(100, 'Slug too long')
  .regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens');

// File validation schemas
export const fileSchema = z.object({
  filename: z.string().max(255, 'Filename too long'),
  mimetype: z.enum([
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
    'text/plain',
    'text/csv',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel',
  ], { errorMap: () => ({ message: 'Invalid file type' }) }),
  size: z.number().max(10 * 1024 * 1024, 'File too large (max 10MB)'),
});

// Business validation schemas
export const companyInfoSchema = z.object({
  legalName: companyNameSchema,
  dbaName: companyNameSchema.optional(),
  ein: einSchema,
  entityType: z.enum(['c-corp', 's-corp', 'llc', 'partnership', 'sole-proprietorship']).optional(),
  incorporationState: z.string().length(2, 'State must be 2 characters').optional(),
  naicsCode: z.string().regex(/^\d{2,6}$/, 'Invalid NAICS code').optional(),
  website: urlSchema,
  addressLine1: secureStringSchema(255).optional(),
  addressLine2: secureStringSchema(255).optional(),
  city: secureStringSchema(100).optional(),
  state: z.string().length(2, 'State must be 2 characters').optional(),
  zipCode: z.string().regex(/^\d{5}(-\d{4})?$/, 'Invalid ZIP code').optional(),
  phone: phoneSchema,
});

export const expenseBreakdownSchema = z.object({
  wages: amountSchema.optional(),
  contractors: amountSchema.optional(),
  supplies: amountSchema.optional(),
  cloudSoftware: amountSchema.optional(),
}).refine(
  data => Object.values(data).some(value => value && value > 0),
  'At least one expense amount is required'
);

// Request validation middleware factories
export function validateBody<T>(schema: ZodSchema<T>) {
  return validateSchema(schema, 'body');
}

export function validateQuery<T>(schema: ZodSchema<T>) {
  return validateSchema(schema, 'query');
}

export function validateParams<T>(schema: ZodSchema<T>) {
  return validateSchema(schema, 'params');
}

// Pagination validation
export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sort: z.string().optional(),
  order: z.enum(['asc', 'desc']).default('desc'),
});

// Search validation
export const searchSchema = z.object({
  q: z.string().max(255, 'Search query too long').optional(),
  filter: z.record(z.string()).optional(),
});

// ID validation
export const idSchema = z.string().uuid('Invalid ID format');

// Date validation
export const dateRangeSchema = z.object({
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
}).refine(
  data => !data.startDate || !data.endDate || data.startDate <= data.endDate,
  'Start date must be before end date'
);

// Conditional validation helper
export function conditionalValidation<T>(
  condition: (data: any) => boolean,
  schema: ZodSchema<T>
) {
  return z.any().superRefine((data, ctx) => {
    if (condition(data)) {
      const result = schema.safeParse(data);
      if (!result.success) {
        result.error.errors.forEach(error => {
          ctx.addIssue(error);
        });
      }
    }
  });
}

// Express-validator field validators
export const emailValidator = body('email')
  .isEmail()
  .normalizeEmail()
  .withMessage('Invalid email address');

export const passwordValidator = body('password')
  .isLength({ min: 8, max: 128 })
  .withMessage('Password must be 8-128 characters')
  .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/)
  .withMessage('Password must contain uppercase, lowercase, number, and special character');

export const nameValidator = (field: string) => body(field)
  .trim()
  .isLength({ min: 1, max: 100 })
  .withMessage(`${field} must be 1-100 characters`)
  .matches(/^[a-zA-Z\s\-'.]+$/)
  .withMessage(`${field} contains invalid characters`);

export const phoneValidator = body('phone')
  .optional()
  .isMobilePhone('any')
  .withMessage('Invalid phone number');

export const uuidValidator = (field: string, location: 'body' | 'query' | 'param' = 'body') => {
  const validator = location === 'body' ? body(field) : 
                   location === 'query' ? query(field) : param(field);
  
  return validator
    .isUUID(4)
    .withMessage(`${field} must be a valid UUID`);
};

// Comprehensive validation for common endpoints
export const userRegistrationValidation = validateFields([
  emailValidator,
  passwordValidator,
  nameValidator('firstName').optional(),
  nameValidator('lastName').optional(),
  phoneValidator,
]);

export const userLoginValidation = validateFields([
  emailValidator,
  body('password').notEmpty().withMessage('Password is required'),
]);

export const companyCreationValidation = validateBody(companyInfoSchema);

export const expenseValidation = validateBody(expenseBreakdownSchema);