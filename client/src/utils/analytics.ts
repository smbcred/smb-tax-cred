// Analytics utility functions for marketing tracking

interface AnalyticsEvent {
  event: string;
  properties?: Record<string, any>;
  userId?: string;
  sessionId?: string;
}

interface ConversionEvent {
  stage: string;
  userId?: string;
  sessionId: string;
  metadata?: Record<string, any>;
}

interface UTMParams {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
}

class Analytics {
  private sessionId: string;
  private userId?: string;

  constructor() {
    this.sessionId = this.getOrCreateSessionId();
    this.userId = this.getUserId();
  }

  private getOrCreateSessionId(): string {
    let sessionId = sessionStorage.getItem('sessionId');
    if (!sessionId) {
      sessionId = `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('sessionId', sessionId);
    }
    return sessionId;
  }

  private getUserId(): string | undefined {
    return localStorage.getItem('userId') || undefined;
  }

  // Track marketing events
  async trackEvent(event: string, properties?: Record<string, any>): Promise<void> {
    try {
      const eventData: AnalyticsEvent = {
        event,
        properties,
        userId: this.userId,
        sessionId: this.sessionId
      };

      await fetch('/api/analytics/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(eventData)
      });

      // Also send to Google Analytics if available
      if (typeof gtag !== 'undefined') {
        gtag('event', event, properties);
      }
    } catch (error) {
      console.log('Analytics tracking failed:', error);
    }
  }

  // Track conversion funnel stages
  async trackConversion(stage: string, metadata?: Record<string, any>): Promise<void> {
    try {
      const conversionData: ConversionEvent = {
        stage,
        userId: this.userId,
        sessionId: this.sessionId,
        metadata
      };

      await fetch('/api/analytics/conversions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(conversionData)
      });
    } catch (error) {
      console.log('Conversion tracking failed:', error);
    }
  }

  // Track UTM parameters
  async trackUTM(page: string): Promise<void> {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const utmParams: UTMParams & { page: string; sessionId: string } = {
        utm_source: urlParams.get('utm_source') || undefined,
        utm_medium: urlParams.get('utm_medium') || undefined,
        utm_campaign: urlParams.get('utm_campaign') || undefined,
        utm_term: urlParams.get('utm_term') || undefined,
        utm_content: urlParams.get('utm_content') || undefined,
        page,
        sessionId: this.sessionId
      };

      // Only track if we have UTM parameters
      if (Object.values(utmParams).some(value => value !== undefined)) {
        await fetch('/api/analytics/utm', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(utmParams)
        });

        // Store UTM data in session for attribution
        sessionStorage.setItem('utmData', JSON.stringify(utmParams));
      }
    } catch (error) {
      console.log('UTM tracking failed:', error);
    }
  }

  // Track A/B test events
  async trackABTest(testName: string, variant: string, action: 'impression' | 'click' | 'conversion', metadata?: Record<string, any>): Promise<void> {
    try {
      await fetch('/api/analytics/ab-tests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          testName,
          variant,
          userId: this.userId,
          sessionId: this.sessionId,
          action,
          metadata
        })
      });
    } catch (error) {
      console.log('A/B test tracking failed:', error);
    }
  }

  // Page view tracking
  async trackPageView(page: string, title?: string): Promise<void> {
    await this.trackEvent('page_view', {
      page,
      title: title || document.title,
      referrer: document.referrer,
      userAgent: navigator.userAgent
    });

    // Track UTM parameters on page load
    await this.trackUTM(page);

    // Send to Google Analytics if available
    if (typeof gtag !== 'undefined') {
      gtag('config', 'GA_MEASUREMENT_ID', {
        page_path: page,
        page_title: title
      });
    }
  }

  // Calculator-specific tracking
  async trackCalculatorStart(): Promise<void> {
    await this.trackEvent('calculator_started', {
      page: '/calculator',
      timestamp: new Date().toISOString()
    });
    await this.trackConversion('calculator_start');
  }

  async trackCalculatorStep(step: string, data?: Record<string, any>): Promise<void> {
    await this.trackEvent('calculator_step', {
      step,
      data,
      page: '/calculator'
    });
  }

  async trackCalculatorComplete(results: Record<string, any>): Promise<void> {
    await this.trackEvent('calculator_completed', {
      ...results,
      page: '/calculator'
    });
    await this.trackConversion('calculator_complete', results);
  }

  // Lead capture tracking
  async trackLeadCapture(leadData: Record<string, any>): Promise<void> {
    await this.trackEvent('lead_captured', {
      ...leadData,
      source: this.getLeadSource()
    });
    await this.trackConversion('lead_capture', leadData);
  }

  // Payment tracking
  async trackCheckoutStart(plan: string, amount: number): Promise<void> {
    await this.trackEvent('checkout_started', {
      plan,
      amount,
      currency: 'USD'
    });
    await this.trackConversion('checkout_start', { plan, amount });
  }

  async trackPaymentComplete(plan: string, amount: number, transactionId: string): Promise<void> {
    await this.trackEvent('payment_completed', {
      plan,
      amount,
      currency: 'USD',
      transactionId
    });
    await this.trackConversion('payment_complete', { plan, amount, transactionId });
  }

  // Content engagement tracking
  async trackBlogView(articleId: string, title: string): Promise<void> {
    await this.trackEvent('blog_article_viewed', {
      articleId,
      title,
      page: `/blog/${articleId}`
    });
  }

  async trackDownload(downloadType: string, fileName?: string): Promise<void> {
    await this.trackEvent('download_started', {
      downloadType,
      fileName
    });
  }

  // Get lead source attribution
  private getLeadSource(): string {
    const utmData = sessionStorage.getItem('utmData');
    if (utmData) {
      const utm = JSON.parse(utmData);
      return utm.utm_source || 'direct';
    }
    return document.referrer ? 'referral' : 'direct';
  }

  // Set user ID when user logs in or registers
  setUserId(userId: string): void {
    this.userId = userId;
    localStorage.setItem('userId', userId);
  }

  // Clear user data on logout
  clearUserData(): void {
    this.userId = undefined;
    localStorage.removeItem('userId');
  }
}

// Create singleton instance
const analytics = new Analytics();

// Export convenience functions
export const trackEvent = (event: string, properties?: Record<string, any>) => 
  analytics.trackEvent(event, properties);

export const trackConversion = (stage: string, metadata?: Record<string, any>) => 
  analytics.trackConversion(stage, metadata);

export const trackPageView = (page: string, title?: string) => 
  analytics.trackPageView(page, title);

export const trackCalculatorStart = () => 
  analytics.trackCalculatorStart();

export const trackCalculatorStep = (step: string, data?: Record<string, any>) => 
  analytics.trackCalculatorStep(step, data);

export const trackCalculatorComplete = (results: Record<string, any>) => 
  analytics.trackCalculatorComplete(results);

export const trackLeadCapture = (leadData: Record<string, any>) => 
  analytics.trackLeadCapture(leadData);

export const trackCheckoutStart = (plan: string, amount: number) => 
  analytics.trackCheckoutStart(plan, amount);

export const trackPaymentComplete = (plan: string, amount: number, transactionId: string) => 
  analytics.trackPaymentComplete(plan, amount, transactionId);

export const trackBlogView = (articleId: string, title: string) => 
  analytics.trackBlogView(articleId, title);

export const trackDownload = (downloadType: string, fileName?: string) => 
  analytics.trackDownload(downloadType, fileName);

export const setUserId = (userId: string) => 
  analytics.setUserId(userId);

export const clearUserData = () => 
  analytics.clearUserData();

export default analytics;