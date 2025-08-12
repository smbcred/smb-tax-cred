import { Request } from "express";

// Get request ID from request object if available
const getRequestId = (req?: Request): string | undefined => {
  if (!req) return undefined;
  return (req as any).request_id;
};

// Enhanced logging functions with request_id context
export const logger = {
  info: (message: string, data?: any, req?: Request) => {
    const rid = getRequestId(req);
    const logData = rid ? { rid, ...data } : data;
    console.log(message, logData || '');
  },
  
  warn: (message: string, data?: any, req?: Request) => {
    const rid = getRequestId(req);
    const logData = rid ? { rid, ...data } : data;
    console.warn(message, logData || '');
  },
  
  error: (message: string, data?: any, req?: Request) => {
    const rid = getRequestId(req);
    const logData = rid ? { rid, ...data } : data;
    console.error(message, logData || '');
  },
  
  debug: (message: string, data?: any, req?: Request) => {
    if (process.env.NODE_ENV === 'development') {
      const rid = getRequestId(req);
      const logData = rid ? { rid, ...data } : data;
      console.debug(message, logData || '');
    }
  }
};

// Legacy support for simple console logging with request context
export const logWithRequestId = (req: Request | undefined, level: 'log' | 'error' | 'warn', message: string, data?: any) => {
  const rid = req ? (req as any).request_id : undefined;
  const logData = rid ? { rid, ...data } : data;
  
  switch (level) {
    case 'error':
      console.error(message, logData);
      break;
    case 'warn':  
      console.warn(message, logData);
      break;
    default:
      console.log(message, logData);
  }
};