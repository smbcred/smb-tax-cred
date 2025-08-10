import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { storage } from '../storage.js';
import { nanoid } from 'nanoid';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key';

export interface CreateUserFromCheckoutParams {
  email: string;
  leadId?: string;
  firstName?: string;
  lastName?: string;
  stripeCustomerId?: string;
}

export interface UserCreationResult {
  user: {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
  };
  token: string;
  isNewUser: boolean;
}

export class UserCreationService {
  /**
   * Creates or retrieves a user from checkout data
   */
  static async createOrGetUserFromCheckout(params: CreateUserFromCheckoutParams): Promise<UserCreationResult> {
    const { email, leadId, firstName, lastName, stripeCustomerId } = params;

    // Check if user already exists
    const existingUser = await storage.getUserByEmail(email);
    
    if (existingUser) {
      // Update existing user with any new information
      const updatedUser = await storage.updateUser(existingUser.id, {
        firstName: firstName || existingUser.firstName,
        lastName: lastName || existingUser.lastName,
        stripeCustomerId: stripeCustomerId || existingUser.stripeCustomerId,
        lastLoginAt: new Date(),
        loginCount: (existingUser.loginCount || 0) + 1,
      });

      // Generate JWT token
      const token = jwt.sign({ userId: existingUser.id }, JWT_SECRET, { expiresIn: "7d" });

      return {
        user: {
          id: existingUser.id,
          email: existingUser.email,
          firstName: updatedUser.firstName || undefined,
          lastName: updatedUser.lastName || undefined,
        },
        token,
        isNewUser: false,
      };
    }

    // Create new user
    const temporaryPassword = nanoid(16); // Generate secure temporary password
    const passwordHash = await bcrypt.hash(temporaryPassword, 10);

    const userData = {
      email,
      passwordHash,
      password: temporaryPassword, // For compatibility with existing schema
      firstName,
      lastName,
      stripeCustomerId,
      emailVerified: false, // Will be verified through welcome email
      createdFromLead: true,
      leadCapturedAt: new Date(),
      status: 'active' as const,
      loginCount: 1,
      lastLoginAt: new Date(),
    };

    const newUser = await storage.createUser(userData);

    // Generate JWT token
    const token = jwt.sign({ userId: newUser.id }, JWT_SECRET, { expiresIn: "7d" });

    console.log(`Created new user from checkout: ${email} (ID: ${newUser.id})`);

    return {
      user: {
        id: newUser.id,
        email: newUser.email,
        firstName: newUser.firstName || undefined,
        lastName: newUser.lastName || undefined,
      },
      token,
      isNewUser: true,
    };
  }

  /**
   * Links a lead to a user account
   */
  static async linkLeadToUser(userId: string, leadId: string): Promise<void> {
    try {
      // Get the lead by ID
      const lead = await storage.getLead(leadId);
      if (!lead) {
        console.warn(`Lead ${leadId} not found when linking to user ${userId}`);
        return;
      }

      // Update user with lead information if not already set
      const user = await storage.getUser(userId);
      
      if (user) {
        await storage.updateUser(userId, {
          firstName: user.firstName || undefined, // Lead doesn't have firstName/lastName
          lastName: user.lastName || undefined,
          phone: user.phone || lead.phoneNumber,
        });
      }

      console.log(`Linked lead ${leadId} to user ${userId}`);
    } catch (error) {
      console.error(`Failed to link lead ${leadId} to user ${userId}:`, error);
    }
  }
}