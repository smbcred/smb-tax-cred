// Analytics service for tracking user behavior and performance metrics

import { AnalyticsEvent, EventCategory, EventName } from '../../../shared/types/analytics';

export class AnalyticsService {
  private sessionId: string;
  private userId?: string;
  private events: AnalyticsEvent[] = [];
  private isEnabled: boolean = true;
  private batchSize: number = 10;
  private flushInterval: number = 5000; // 5 seconds
  private batchTimer?: NodeJS.Timeout;
  private abTests: Map<string, string> = new Map(); // testId -> variantId

  constructor() {
    this.sessionId = this.generateSessionId();
    this.initializeSession();
    this.setupPerformanceMonitoring();
    this.setupUnloadHandler();
  }

  /**
   * Initialize the analytics session
   */
  private initializeSession(): void {
    // Check for user consent
    const hasConsent = this.hasUserConsent();
    this.isEnabled = hasConsent;

    if (this.isEnabled) {
      // Track initial page view
      this.track('page_view', 'navigation', {
        page: window.location.pathname,
        referrer: document.referrer,
        title: document.title
      });

      // Start batch timer
      this.startBatchTimer();
    }
  }

  /**
   * Check if user has given analytics consent
   */
  private hasUserConsent(): boolean {
    const consent = localStorage.getItem('analytics_consent');
    return consent === 'granted';
  }

  /**
   * Set user consent for analytics tracking
   */
  public setUserConsent(granted: boolean): void {
    localStorage.setItem('analytics_consent', granted ? 'granted' : 'denied');
    this.isEnabled = granted;

    if (granted && !this.batchTimer) {
      this.startBatchTimer();
    } else if (!granted) {
      this.stopBatchTimer();
      this.clearStoredData();
    }
  }

  /**
   * Set the current user ID
   */
  public setUserId(userId: string): void {
    this.userId = userId;
    
    // Track user identification
    this.track('user_identified', 'auth', {
      userId,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Track an analytics event
   */
  public track(
    event: EventName | string,
    category: EventCategory,
    properties: Record<string, any> = {},
    immediate: boolean = false
  ): void {
    if (!this.isEnabled) return;

    const analyticsEvent: AnalyticsEvent = {
      id: this.generateEventId(),
      userId: this.userId,
      sessionId: this.sessionId,
      timestamp: new Date(),
      event,
      category,
      properties: {
        ...properties,
        url: window.location.href,
        userAgent: navigator.userAgent,
        timestamp: Date.now()
      },
      userAgent: navigator.userAgent,
      referrer: document.referrer,
      page: window.location.pathname
    };

    this.events.push(analyticsEvent);

    // Immediate flush for critical events
    if (immediate || event === 'error_occurred' || event === 'payment_completed') {
      this.flush();
    } else if (this.events.length >= this.batchSize) {
      this.flush();
    }
  }

  /**
   * Track page view
   */
  public trackPageView(page?: string): void {
    this.track('page_view', 'navigation', {
      page: page || window.location.pathname,
      title: document.title,
      referrer: document.referrer
    });
  }

  /**
   * Track conversion event
   */
  public trackConversion(
    conversionType: string,
    value?: number,
    currency: string = 'USD'
  ): void {
    this.track('conversion', 'user_action', {
      conversionType,
      value,
      currency,
      timestamp: Date.now()
    }, true); // Immediate flush for conversions
  }

  /**
   * Track form interaction
   */
  public trackFormEvent(
    formId: string,
    action: 'started' | 'completed' | 'abandoned' | 'field_focused' | 'field_completed',
    fieldId?: string,
    value?: any
  ): void {
    this.track(`form_${action}`, 'user_action', {
      formId,
      fieldId,
      value,
      action
    });
  }

  /**
   * Track button or link click
   */
  public trackClick(
    element: string,
    category: 'cta' | 'nav' | 'button' | 'link',
    properties: Record<string, any> = {}
  ): void {
    this.track('click', 'user_action', {
      element,
      clickCategory: category,
      ...properties
    });
  }

  /**
   * Track performance metric
   */
  public trackPerformance(
    metric: string,
    value: number,
    unit: string = 'ms'
  ): void {
    this.track('performance_metric', 'performance', {
      metric,
      value,
      unit,
      page: window.location.pathname
    });
  }

  /**
   * Track error
   */
  public trackError(
    error: Error | string,
    category: 'javascript' | 'api' | 'network' | 'validation' = 'javascript',
    properties: Record<string, any> = {}
  ): void {
    const errorData = typeof error === 'string' ? { message: error } : {
      message: error.message,
      stack: error.stack,
      name: error.name
    };

    this.track('error_occurred', 'error', {
      ...errorData,
      errorCategory: category,
      ...properties
    }, true); // Immediate flush for errors
  }

  /**
   * Start A/B test and assign user to variant
   */
  public startABTest(testId: string, variants: { id: string; weight: number }[]): string {
    // Check if user already assigned to this test
    const existingVariant = this.abTests.get(testId) || localStorage.getItem(`ab_test_${testId}`);
    
    if (existingVariant) {
      return existingVariant;
    }

    // Assign user to variant based on weighted random selection
    const random = Math.random();
    let cumulativeWeight = 0;
    let assignedVariant = variants[0].id;

    for (const variant of variants) {
      cumulativeWeight += variant.weight;
      if (random <= cumulativeWeight) {
        assignedVariant = variant.id;
        break;
      }
    }

    // Store assignment
    this.abTests.set(testId, assignedVariant);
    localStorage.setItem(`ab_test_${testId}`, assignedVariant);

    // Track assignment
    this.track('ab_test_assigned', 'engagement', {
      testId,
      variantId: assignedVariant,
      userId: this.userId,
      sessionId: this.sessionId
    });

    return assignedVariant;
  }

  /**
   * Get assigned A/B test variant
   */
  public getABTestVariant(testId: string): string | null {
    return this.abTests.get(testId) || localStorage.getItem(`ab_test_${testId}`);
  }

  /**
   * Track A/B test conversion
   */
  public trackABTestConversion(testId: string, conversionEvent: string): void {
    const variantId = this.getABTestVariant(testId);
    if (variantId) {
      this.track('ab_test_conversion', 'user_action', {
        testId,
        variantId,
        conversionEvent
      }, true);
    }
  }

  /**
   * Flush events to server
   */
  public async flush(): Promise<void> {
    if (this.events.length === 0) return;

    const eventsToSend = [...this.events];
    this.events = [];

    try {
      const response = await fetch('/api/analytics/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ events: eventsToSend })
      });

      if (!response.ok) {
        // Re-add events to queue if failed
        this.events.unshift(...eventsToSend);
        console.warn('Failed to send analytics events:', response.statusText);
      }
    } catch (error) {
      // Re-add events to queue if failed
      this.events.unshift(...eventsToSend);
      console.warn('Failed to send analytics events:', error);
    }
  }

  /**
   * Generate unique session ID
   */
  private generateSessionId(): string {
    const timestamp = Date.now().toString(36);
    const randomPart = Math.random().toString(36).substring(2);
    return `${timestamp}-${randomPart}`;
  }

  /**
   * Generate unique event ID
   */
  private generateEventId(): string {
    const timestamp = Date.now().toString(36);
    const randomPart = Math.random().toString(36).substring(2);
    return `evt_${timestamp}_${randomPart}`;
  }

  /**
   * Start batch timer for automatic flushing
   */
  private startBatchTimer(): void {
    this.batchTimer = setInterval(() => {
      this.flush();
    }, this.flushInterval);
  }

  /**
   * Stop batch timer
   */
  private stopBatchTimer(): void {
    if (this.batchTimer) {
      clearInterval(this.batchTimer);
      this.batchTimer = undefined;
    }
  }

  /**
   * Setup performance monitoring
   */
  private setupPerformanceMonitoring(): void {
    // Web Vitals monitoring
    if ('web-vitals' in window) return;

    // LCP (Largest Contentful Paint)
    this.observePerformanceMetric('largest-contentful-paint', (entry: any) => {
      this.trackPerformance('LCP', entry.renderTime || entry.loadTime);
    });

    // FID (First Input Delay)
    this.observePerformanceMetric('first-input', (entry: any) => {
      this.trackPerformance('FID', entry.processingStart - entry.startTime);
    });

    // CLS (Cumulative Layout Shift)
    this.observePerformanceMetric('layout-shift', (entry: any) => {
      if (!entry.hadRecentInput) {
        this.trackPerformance('CLS', entry.value, 'score');
      }
    });

    // Navigation timing
    window.addEventListener('load', () => {
      setTimeout(() => {
        const navigation = performance.getEntriesByType('navigation')[0] as any;
        if (navigation) {
          this.trackPerformance('TTFB', navigation.responseStart - navigation.requestStart);
          this.trackPerformance('domContentLoaded', navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart);
          this.trackPerformance('loadComplete', navigation.loadEventEnd - navigation.loadEventStart);
        }
      }, 0);
    });
  }

  /**
   * Observe performance metrics using PerformanceObserver
   */
  private observePerformanceMetric(type: string, callback: (entry: any) => void): void {
    try {
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach(callback);
      });
      observer.observe({ type, buffered: true });
    } catch (error) {
      console.warn(`Failed to observe ${type} performance metric:`, error);
    }
  }

  /**
   * Setup page unload handler to flush remaining events
   */
  private setupUnloadHandler(): void {
    const handleUnload = () => {
      this.track('session_end', 'navigation', {
        duration: Date.now() - parseInt(this.sessionId.split('-')[0], 36)
      });
      
      // Use sendBeacon for reliable event sending on unload
      if (this.events.length > 0 && navigator.sendBeacon) {
        navigator.sendBeacon(
          '/api/analytics/events',
          JSON.stringify({ events: this.events })
        );
      }
    };

    window.addEventListener('beforeunload', handleUnload);
    window.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        handleUnload();
      }
    });
  }

  /**
   * Clear stored analytics data
   */
  private clearStoredData(): void {
    this.events = [];
    this.abTests.clear();
    
    // Clear localStorage AB test assignments
    Object.keys(localStorage)
      .filter(key => key.startsWith('ab_test_'))
      .forEach(key => localStorage.removeItem(key));
  }

  /**
   * Get current session data for debugging
   */
  public getSessionInfo(): { sessionId: string; userId?: string; eventCount: number } {
    return {
      sessionId: this.sessionId,
      userId: this.userId,
      eventCount: this.events.length
    };
  }
}

// Singleton instance
export const analytics = new AnalyticsService();