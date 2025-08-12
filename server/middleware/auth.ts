import jwt from "jsonwebtoken";
import { Request } from "express";

if (!process.env.JWT_SECRET) {
  throw new Error("Missing required JWT secret: JWT_SECRET");
}

const JWT_SECRET = process.env.JWT_SECRET;

// Authentication middleware to verify JWT tokens
export const authenticateToken = async (req: any, res: any, next: any) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Access token required" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

// Simple auth check for routes that need authentication
export const isAuthenticated = (req: any, res: any, next: any) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

// Helper to get client IP address
export const getClientIp = (req: Request): string => {
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) {
    const forwardedArray = Array.isArray(forwarded) ? forwarded : [forwarded];
    return forwardedArray[0].split(',')[0].trim();
  }
  return req.socket.remoteAddress || '';
};