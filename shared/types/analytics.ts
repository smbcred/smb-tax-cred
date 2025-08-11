// Analytics type definitions for tracking and reporting

export interface AnalyticsEvent {
  id: string;
  userId?: string;
  sessionId: string;
  timestamp: Date;
  event: string;
  category: 'user_action' | 'page_view' | 'conversion' | 'error' | 'performance';
  properties: Record<string, any>;
  userAgent?: string;
  ipAddress?: string;
  referrer?: string;
  page?: string;
}

export interface ConversionFunnel {
  id: string;
  name: string;
  steps: ConversionStep[];
  conversionRates: number[];
  totalUsers: number;
  completedUsers: number;
  dropoffRates: number[];
}

export interface ConversionStep {
  id: string;
  name: string;
  event: string;
  description: string;
  order: number;
  required: boolean;
}

export interface UserJourney {
  sessionId: string;
  userId?: string;
  startTime: Date;
  endTime?: Date;
  events: AnalyticsEvent[];
  pages: string[];
  duration?: number;
  bounced: boolean;
  converted: boolean;
  conversionValue?: number;
}

export interface ABTestVariant {
  id: string;
  name: string;
  weight: number;
  config: Record<string, any>;
  isControl: boolean;
}

export interface ABTest {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  startDate: Date;
  endDate?: Date;
  variants: ABTestVariant[];
  targetEvents: string[];
  segments?: string[];
}

export interface ABTestAssignment {
  userId: string;
  sessionId: string;
  testId: string;
  variantId: string;
  assignedAt: Date;
}

export interface PerformanceMetric {
  id: string;
  sessionId: string;
  timestamp: Date;
  metric: 'LCP' | 'FID' | 'CLS' | 'TTFB' | 'FCP' | 'custom';
  value: number;
  unit: 'ms' | 'score' | 'bytes' | 'count';
  page: string;
  deviceType: 'mobile' | 'tablet' | 'desktop';
  connection?: string;
}

export interface AnalyticsFilter {
  startDate?: Date;
  endDate?: Date;
  userId?: string;
  sessionId?: string;
  event?: string;
  category?: string;
  page?: string;
  deviceType?: string;
  userSegment?: string;
}

export interface AnalyticsDashboard {
  id: string;
  name: string;
  description: string;
  widgets: DashboardWidget[];
  filters: AnalyticsFilter;
  refreshInterval?: number;
  isPublic: boolean;
  createdBy: string;
}

export interface DashboardWidget {
  id: string;
  type: 'metric' | 'chart' | 'table' | 'funnel' | 'heatmap';
  title: string;
  query: AnalyticsQuery;
  visualization: VisualizationConfig;
  size: { width: number; height: number };
  position: { x: number; y: number };
}

export interface AnalyticsQuery {
  events: string[];
  filters: AnalyticsFilter;
  groupBy?: string[];
  aggregation: 'count' | 'sum' | 'avg' | 'min' | 'max' | 'unique';
  orderBy?: string;
  limit?: number;
}

export interface VisualizationConfig {
  chartType: 'line' | 'bar' | 'pie' | 'area' | 'scatter' | 'funnel';
  xAxis?: string;
  yAxis?: string;
  colorScheme?: string[];
  showLegend: boolean;
  showTooltips: boolean;
}

export interface AnalyticsInsight {
  id: string;
  type: 'anomaly' | 'trend' | 'correlation' | 'prediction';
  title: string;
  description: string;
  significance: 'low' | 'medium' | 'high' | 'critical';
  data: any;
  generatedAt: Date;
  actionable: boolean;
  recommendations?: string[];
}

// Event categories for the R&D Tax Credit SaaS
export const EventCategories = {
  CALCULATOR: 'calculator',
  FORM: 'form', 
  PAYMENT: 'payment',
  DOCUMENT: 'document',
  AUTH: 'auth',
  NAVIGATION: 'navigation',
  ENGAGEMENT: 'engagement',
  ERROR: 'error',
  PERFORMANCE: 'performance'
} as const;

// Common event names
export const EventNames = {
  // Calculator events
  CALCULATOR_STARTED: 'calculator_started',
  CALCULATOR_STEP_COMPLETED: 'calculator_step_completed',
  CALCULATOR_COMPLETED: 'calculator_completed',
  CALCULATOR_ABANDONED: 'calculator_abandoned',
  
  // Form events  
  FORM_STARTED: 'form_started',
  FORM_SECTION_COMPLETED: 'form_section_completed',
  FORM_SAVED: 'form_saved',
  FORM_SUBMITTED: 'form_submitted',
  FORM_ABANDONED: 'form_abandoned',
  
  // Payment events
  PAYMENT_INITIATED: 'payment_initiated',
  PAYMENT_COMPLETED: 'payment_completed',
  PAYMENT_FAILED: 'payment_failed',
  
  // Document events
  DOCUMENT_GENERATED: 'document_generated',
  DOCUMENT_DOWNLOADED: 'document_downloaded',
  DOCUMENT_SHARED: 'document_shared',
  
  // Auth events
  USER_REGISTERED: 'user_registered',
  USER_LOGIN: 'user_login',
  USER_LOGOUT: 'user_logout',
  
  // Navigation events
  PAGE_VIEW: 'page_view',
  LINK_CLICKED: 'link_clicked',
  CTA_CLICKED: 'cta_clicked',
  
  // Engagement events
  TIME_ON_PAGE: 'time_on_page',
  SCROLL_DEPTH: 'scroll_depth',
  VIDEO_PLAYED: 'video_played',
  MODAL_OPENED: 'modal_opened',
  
  // Error events
  ERROR_OCCURRED: 'error_occurred',
  API_ERROR: 'api_error',
  
  // Performance events
  PERFORMANCE_METRIC: 'performance_metric',
  SLOW_LOAD: 'slow_load'
} as const;

export type EventCategory = typeof EventCategories[keyof typeof EventCategories];
export type EventName = typeof EventNames[keyof typeof EventNames];

// Pre-defined conversion funnels for R&D Tax Credit SaaS
export const ConversionFunnels = {
  LEAD_TO_CUSTOMER: {
    id: 'lead_to_customer',
    name: 'Lead to Customer',
    steps: [
      { id: '1', name: 'Landing Page Visit', event: EventNames.PAGE_VIEW, description: 'User visits landing page', order: 1, required: true },
      { id: '2', name: 'Calculator Started', event: EventNames.CALCULATOR_STARTED, description: 'User starts R&D calculator', order: 2, required: true },
      { id: '3', name: 'Calculator Completed', event: EventNames.CALCULATOR_COMPLETED, description: 'User completes calculator', order: 3, required: true },
      { id: '4', name: 'User Registration', event: EventNames.USER_REGISTERED, description: 'User creates account', order: 4, required: true },
      { id: '5', name: 'Payment Completed', event: EventNames.PAYMENT_COMPLETED, description: 'User pays for service', order: 5, required: true }
    ]
  },
  
  FORM_COMPLETION: {
    id: 'form_completion',
    name: 'Form Completion Flow',
    steps: [
      { id: '1', name: 'Form Started', event: EventNames.FORM_STARTED, description: 'User starts intake form', order: 1, required: true },
      { id: '2', name: 'Company Info', event: EventNames.FORM_SECTION_COMPLETED, description: 'Company information completed', order: 2, required: true },
      { id: '3', name: 'R&D Activities', event: EventNames.FORM_SECTION_COMPLETED, description: 'R&D activities completed', order: 3, required: true },
      { id: '4', name: 'Expenses', event: EventNames.FORM_SECTION_COMPLETED, description: 'Expense breakdown completed', order: 4, required: true },
      { id: '5', name: 'Form Submitted', event: EventNames.FORM_SUBMITTED, description: 'Form successfully submitted', order: 5, required: true }
    ]
  }
} as const;