import { SupportCategory, SupportPriority, SLAConfig } from '@shared/types/support';

export class SupportService {
  private static slaConfig: SLAConfig = {
    responseTime: {
      urgent: 60,    // 1 hour
      high: 240,     // 4 hours  
      medium: 1440,  // 24 hours
      low: 2880      // 48 hours
    },
    escalationTime: {
      urgent: 120,   // 2 hours
      high: 480,     // 8 hours
      medium: 2880,  // 48 hours
      low: 5760      // 96 hours
    }
  };

  static calculatePriority(category: SupportCategory, keywords: string): SupportPriority {
    const lowerKeywords = keywords.toLowerCase();
    
    // Urgent keywords
    if (lowerKeywords.includes('urgent') || 
        lowerKeywords.includes('down') ||
        lowerKeywords.includes('broken') ||
        lowerKeywords.includes('can\'t login') ||
        lowerKeywords.includes('payment failed')) {
      return SupportPriority.URGENT;
    }
    
    // High priority by category
    if (category === SupportCategory.BILLING || 
        category === SupportCategory.ACCOUNT) {
      return SupportPriority.HIGH;
    }
    
    // High priority keywords
    if (lowerKeywords.includes('error') ||
        lowerKeywords.includes('bug') ||
        lowerKeywords.includes('not working')) {
      return SupportPriority.HIGH;
    }
    
    // Calculator issues are medium priority
    if (category === SupportCategory.CALCULATOR ||
        category === SupportCategory.TECHNICAL) {
      return SupportPriority.MEDIUM;
    }
    
    return SupportPriority.LOW;
  }

  static shouldEscalate(ticket: any): boolean {
    const now = new Date();
    const escalationThreshold = this.slaConfig.escalationTime[ticket.priority as SupportPriority];
    const hoursSinceCreated = (now.getTime() - new Date(ticket.createdAt).getTime()) / (1000 * 60);
    
    return hoursSinceCreated > escalationThreshold;
  }

  static generateTicketId(): string {
    const prefix = 'SUP';
    const timestamp = Date.now().toString().slice(-8);
    const random = Math.random().toString(36).substring(2, 5).toUpperCase();
    return `${prefix}-${timestamp}-${random}`;
  }

  static getResponseTimeSLA(priority: SupportPriority): number {
    return this.slaConfig.responseTime[priority];
  }

  static categorizeTicket(subject: string, message: string): SupportCategory {
    const text = (subject + ' ' + message).toLowerCase();
    
    if (text.includes('payment') || text.includes('billing') || 
        text.includes('charge') || text.includes('subscription')) {
      return SupportCategory.BILLING;
    }
    
    if (text.includes('calculator') || text.includes('calculation') ||
        text.includes('credit amount') || text.includes('estimate')) {
      return SupportCategory.CALCULATOR;
    }
    
    if (text.includes('login') || text.includes('password') ||
        text.includes('account') || text.includes('profile')) {
      return SupportCategory.ACCOUNT;
    }
    
    if (text.includes('document') || text.includes('guide') ||
        text.includes('help') || text.includes('how to')) {
      return SupportCategory.DOCUMENTATION;
    }
    
    if (text.includes('error') || text.includes('bug') ||
        text.includes('not working') || text.includes('broken')) {
      return SupportCategory.TECHNICAL;
    }
    
    return SupportCategory.GENERAL;
  }

  static generateAutoResponse(category: SupportCategory): string {
    const responses = {
      [SupportCategory.TECHNICAL]: "Thank you for reporting this technical issue. Our support team will investigate and respond within 4 hours. In the meantime, you can check our troubleshooting guide at /help.",
      [SupportCategory.BILLING]: "We've received your billing inquiry. Our billing team will review your account and respond within 4 hours. For urgent billing matters, please include your account email and any relevant transaction details.",
      [SupportCategory.CALCULATOR]: "Thanks for your calculator question! Our team will help you get accurate R&D tax credit estimates. We'll respond within 24 hours with detailed guidance.",
      [SupportCategory.ACCOUNT]: "We've received your account-related request. Our support team will assist you within 4 hours. If you're unable to access your account, please try our password reset option first.",
      [SupportCategory.DOCUMENTATION]: "Thank you for reaching out about our documentation. We'll provide the information you need within 24 hours. You can also browse our help center at /help for immediate answers.",
      [SupportCategory.GENERAL]: "Thank you for contacting SMB Tax Credits support. We've received your message and will respond within 24 hours."
    };
    
    return responses[category];
  }

  static formatTicketForEmail(ticket: any): string {
    return `
New Support Ticket Created
=========================

Ticket ID: ${ticket.id}
Category: ${ticket.category}
Priority: ${ticket.priority}
Status: ${ticket.status}

Customer Information:
- Name: ${ticket.name}
- Email: ${ticket.email}
- User ID: ${ticket.userId || 'N/A'}

Subject: ${ticket.subject}

Message:
${ticket.message}

Created: ${new Date(ticket.createdAt).toLocaleString()}
SLA Response Time: ${this.getResponseTimeSLA(ticket.priority)} minutes

Ticket URL: [Dashboard URL]/support/tickets/${ticket.id}
`;
  }
}