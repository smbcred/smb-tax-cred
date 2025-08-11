export interface SupportTicket {
  id: string;
  userId?: string;
  email: string;
  name: string;
  subject: string;
  message: string;
  category: SupportCategory;
  priority: SupportPriority;
  status: TicketStatus;
  createdAt: Date;
  updatedAt: Date;
  assignedTo?: string;
  escalatedAt?: Date;
  resolvedAt?: Date;
  responseTime?: number; // minutes
}

export enum SupportCategory {
  TECHNICAL = 'technical',
  BILLING = 'billing',
  GENERAL = 'general',
  CALCULATOR = 'calculator',
  DOCUMENTATION = 'documentation',
  ACCOUNT = 'account'
}

export enum SupportPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent'
}

export enum TicketStatus {
  OPEN = 'open',
  IN_PROGRESS = 'in_progress',
  WAITING_CUSTOMER = 'waiting_customer',
  ESCALATED = 'escalated',
  RESOLVED = 'resolved',
  CLOSED = 'closed'
}

export interface SupportMetrics {
  totalTickets: number;
  openTickets: number;
  avgResponseTime: number; // minutes
  satisfactionScore: number; // 1-5
  escalationRate: number; // percentage
}

export interface SLAConfig {
  responseTime: {
    [key in SupportPriority]: number; // minutes
  };
  escalationTime: {
    [key in SupportPriority]: number; // minutes
  };
}

export interface TicketUpdate {
  message: string;
  status?: TicketStatus;
  assignedTo?: string;
  internal?: boolean; // internal note vs customer-visible update
}

export interface LiveChatMessage {
  id: string;
  sessionId: string;
  userId?: string;
  message: string;
  timestamp: Date;
  isAgent: boolean;
}

export interface ChatSession {
  id: string;
  userId?: string;
  email?: string;
  name?: string;
  status: 'active' | 'ended';
  startedAt: Date;
  endedAt?: Date;
  messages: LiveChatMessage[];
}