// Analytics event definitions and tracking utilities for R&D Tax Credit SaaS

import { EventNames, EventCategories } from '../../../shared/types/analytics';
import { analytics } from '@/services/analytics';

/**
 * Calculator-specific event tracking
 */
export const CalculatorEvents = {
  start: (source: string = 'landing_page') => {
    analytics.track(EventNames.CALCULATOR_STARTED, EventCategories.CALCULATOR, {
      source,
      timestamp: Date.now()
    });
  },

  stepCompleted: (step: number, stepName: string, data: Record<string, any> = {}) => {
    analytics.track(EventNames.CALCULATOR_STEP_COMPLETED, EventCategories.CALCULATOR, {
      step,
      stepName,
      ...data,
      timestamp: Date.now()
    });
  },

  completed: (results: Record<string, any>, timeSpent: number) => {
    analytics.track(EventNames.CALCULATOR_COMPLETED, EventCategories.CALCULATOR, {
      ...results,
      timeSpent,
      timestamp: Date.now()
    }, true); // Immediate flush for completion
  },

  abandoned: (lastStep: number, timeSpent: number, reason?: string) => {
    analytics.track(EventNames.CALCULATOR_ABANDONED, EventCategories.CALCULATOR, {
      lastStep,
      timeSpent,
      reason,
      timestamp: Date.now()
    });
  }
};

/**
 * Form interaction event tracking
 */
export const FormEvents = {
  start: (formId: string, formType: string) => {
    analytics.track(EventNames.FORM_STARTED, EventCategories.FORM, {
      formId,
      formType,
      timestamp: Date.now()
    });
  },

  sectionCompleted: (formId: string, sectionName: string, sectionIndex: number, data: Record<string, any> = {}) => {
    analytics.track(EventNames.FORM_SECTION_COMPLETED, EventCategories.FORM, {
      formId,
      sectionName,
      sectionIndex,
      ...data,
      timestamp: Date.now()
    });
  },

  saved: (formId: string, completionPercentage: number, autoSave: boolean = false) => {
    analytics.track(EventNames.FORM_SAVED, EventCategories.FORM, {
      formId,
      completionPercentage,
      autoSave,
      timestamp: Date.now()
    });
  },

  submitted: (formId: string, data: Record<string, any>, timeSpent: number) => {
    analytics.track(EventNames.FORM_SUBMITTED, EventCategories.FORM, {
      formId,
      timeSpent,
      fieldCount: Object.keys(data).length,
      timestamp: Date.now()
    }, true); // Immediate flush for submission
  },

  abandoned: (formId: string, lastSection: string, completionPercentage: number, timeSpent: number) => {
    analytics.track(EventNames.FORM_ABANDONED, EventCategories.FORM, {
      formId,
      lastSection,
      completionPercentage,
      timeSpent,
      timestamp: Date.now()
    });
  },

  fieldInteraction: (formId: string, fieldId: string, fieldType: string, action: 'focus' | 'blur' | 'change') => {
    analytics.track('form_field_interaction', EventCategories.FORM, {
      formId,
      fieldId,
      fieldType,
      action,
      timestamp: Date.now()
    });
  }
};

/**
 * Payment and conversion event tracking
 */
export const PaymentEvents = {
  initiated: (amount: number, currency: string, planType: string) => {
    analytics.track(EventNames.PAYMENT_INITIATED, EventCategories.PAYMENT, {
      amount,
      currency,
      planType,
      timestamp: Date.now()
    }, true);
  },

  completed: (amount: number, currency: string, planType: string, paymentMethod: string, transactionId: string) => {
    analytics.track(EventNames.PAYMENT_COMPLETED, EventCategories.PAYMENT, {
      amount,
      currency,
      planType,
      paymentMethod,
      transactionId,
      timestamp: Date.now()
    }, true);

    // Also track as conversion
    analytics.trackConversion('payment', amount, currency);
  },

  failed: (amount: number, currency: string, planType: string, errorCode?: string, errorMessage?: string) => {
    analytics.track(EventNames.PAYMENT_FAILED, EventCategories.PAYMENT, {
      amount,
      currency,
      planType,
      errorCode,
      errorMessage,
      timestamp: Date.now()
    }, true);
  }
};

/**
 * Document generation and download tracking
 */
export const DocumentEvents = {
  generated: (documentType: string, userId: string, generationTime: number) => {
    analytics.track(EventNames.DOCUMENT_GENERATED, EventCategories.DOCUMENT, {
      documentType,
      userId,
      generationTime,
      timestamp: Date.now()
    });
  },

  downloaded: (documentType: string, documentId: string, format: string = 'pdf') => {
    analytics.track(EventNames.DOCUMENT_DOWNLOADED, EventCategories.DOCUMENT, {
      documentType,
      documentId,
      format,
      timestamp: Date.now()
    });
  },

  shared: (documentType: string, documentId: string, shareMethod: string) => {
    analytics.track(EventNames.DOCUMENT_SHARED, EventCategories.DOCUMENT, {
      documentType,
      documentId,
      shareMethod,
      timestamp: Date.now()
    });
  }
};

/**
 * Authentication event tracking
 */
export const AuthEvents = {
  registered: (userId: string, registrationMethod: string, source?: string) => {
    analytics.track(EventNames.USER_REGISTERED, EventCategories.AUTH, {
      userId,
      registrationMethod,
      source,
      timestamp: Date.now()
    }, true);

    analytics.setUserId(userId);
    analytics.trackConversion('registration');
  },

  login: (userId: string, loginMethod: string) => {
    analytics.track(EventNames.USER_LOGIN, EventCategories.AUTH, {
      userId,
      loginMethod,
      timestamp: Date.now()
    });

    analytics.setUserId(userId);
  },

  logout: (userId: string, sessionDuration: number) => {
    analytics.track(EventNames.USER_LOGOUT, EventCategories.AUTH, {
      userId,
      sessionDuration,
      timestamp: Date.now()
    });
  }
};

/**
 * Navigation and engagement tracking
 */
export const NavigationEvents = {
  pageView: (page: string, title?: string, referrer?: string) => {
    analytics.track(EventNames.PAGE_VIEW, EventCategories.NAVIGATION, {
      page,
      title: title || document.title,
      referrer: referrer || document.referrer,
      timestamp: Date.now()
    });
  },

  linkClicked: (linkText: string, destination: string, linkType: 'internal' | 'external' | 'download' = 'internal') => {
    analytics.track(EventNames.LINK_CLICKED, EventCategories.NAVIGATION, {
      linkText,
      destination,
      linkType,
      currentPage: window.location.pathname,
      timestamp: Date.now()
    });
  },

  ctaClicked: (ctaText: string, ctaLocation: string, ctaType: string) => {
    analytics.track(EventNames.CTA_CLICKED, EventCategories.NAVIGATION, {
      ctaText,
      ctaLocation,
      ctaType,
      currentPage: window.location.pathname,
      timestamp: Date.now()
    });
  }
};

/**
 * User engagement tracking
 */
export const EngagementEvents = {
  timeOnPage: (page: string, duration: number, engaged: boolean = true) => {
    analytics.track(EventNames.TIME_ON_PAGE, EventCategories.ENGAGEMENT, {
      page,
      duration,
      engaged,
      timestamp: Date.now()
    });
  },

  scrollDepth: (page: string, maxDepth: number, totalHeight: number) => {
    const percentage = Math.round((maxDepth / totalHeight) * 100);
    analytics.track(EventNames.SCROLL_DEPTH, EventCategories.ENGAGEMENT, {
      page,
      maxDepth,
      totalHeight,
      percentage,
      timestamp: Date.now()
    });
  },

  modalOpened: (modalId: string, trigger: string, context?: string) => {
    analytics.track(EventNames.MODAL_OPENED, EventCategories.ENGAGEMENT, {
      modalId,
      trigger,
      context,
      currentPage: window.location.pathname,
      timestamp: Date.now()
    });
  },

  videoPlayed: (videoId: string, duration: number, completed: boolean) => {
    analytics.track(EventNames.VIDEO_PLAYED, EventCategories.ENGAGEMENT, {
      videoId,
      duration,
      completed,
      completionRate: completed ? 100 : Math.round((duration / 100) * 100),
      timestamp: Date.now()
    });
  }
};

/**
 * Error tracking utilities
 */
export const ErrorEvents = {
  occurred: (error: Error | string, context: string, severity: 'low' | 'medium' | 'high' | 'critical' = 'medium') => {
    const errorData = typeof error === 'string' ? { message: error } : {
      message: error.message,
      stack: error.stack,
      name: error.name
    };

    analytics.track(EventNames.ERROR_OCCURRED, EventCategories.ERROR, {
      ...errorData,
      context,
      severity,
      currentPage: window.location.pathname,
      timestamp: Date.now()
    }, true);
  },

  apiError: (endpoint: string, status: number, message: string, requestId?: string) => {
    analytics.track(EventNames.API_ERROR, EventCategories.ERROR, {
      endpoint,
      status,
      message,
      requestId,
      currentPage: window.location.pathname,
      timestamp: Date.now()
    }, true);
  }
};

/**
 * Performance tracking utilities
 */
export const PerformanceEvents = {
  metric: (metricName: string, value: number, unit: string = 'ms') => {
    analytics.track(EventNames.PERFORMANCE_METRIC, EventCategories.PERFORMANCE, {
      metric: metricName,
      value,
      unit,
      page: window.location.pathname,
      timestamp: Date.now()
    });
  },

  slowLoad: (resource: string, loadTime: number, threshold: number = 3000) => {
    if (loadTime > threshold) {
      analytics.track(EventNames.SLOW_LOAD, EventCategories.PERFORMANCE, {
        resource,
        loadTime,
        threshold,
        page: window.location.pathname,
        timestamp: Date.now()
      });
    }
  }
};

/**
 * Business-specific conversion funnels
 */
export const ConversionFunnels = {
  leadToCustomer: {
    landingPageVisit: () => NavigationEvents.pageView('/'),
    calculatorStarted: (source: string) => CalculatorEvents.start(source),
    calculatorCompleted: (results: any, timeSpent: number) => CalculatorEvents.completed(results, timeSpent),
    userRegistered: (userId: string, method: string) => AuthEvents.registered(userId, method, 'calculator'),
    paymentCompleted: (amount: number, planType: string) => PaymentEvents.completed(amount, 'USD', planType, 'stripe', 'tx_' + Date.now())
  },

  formCompletion: {
    formStarted: (formId: string) => FormEvents.start(formId, 'intake'),
    companyInfo: (formId: string, data: any) => FormEvents.sectionCompleted(formId, 'company_information', 1, data),
    rdActivities: (formId: string, data: any) => FormEvents.sectionCompleted(formId, 'rd_activities', 2, data),
    expenses: (formId: string, data: any) => FormEvents.sectionCompleted(formId, 'expense_breakdown', 3, data),
    formSubmitted: (formId: string, data: any, timeSpent: number) => FormEvents.submitted(formId, data, timeSpent)
  }
};

/**
 * Utility functions for common tracking patterns
 */
export const TrackingUtils = {
  /**
   * Track user session duration
   */
  trackSessionDuration: (() => {
    const sessionStart = Date.now();
    
    return () => {
      const duration = Date.now() - sessionStart;
      EngagementEvents.timeOnPage('session', duration);
      return duration;
    };
  })(),

  /**
   * Track scroll depth with throttling
   */
  trackScrollDepth: (() => {
    let maxScrollDepth = 0;
    let throttleTimer: NodeJS.Timeout;

    return () => {
      const currentScroll = window.scrollY;
      const documentHeight = document.documentElement.scrollHeight - window.innerHeight;
      
      if (currentScroll > maxScrollDepth) {
        maxScrollDepth = currentScroll;
        
        clearTimeout(throttleTimer);
        throttleTimer = setTimeout(() => {
          EngagementEvents.scrollDepth(window.location.pathname, maxScrollDepth, documentHeight);
        }, 1000);
      }
    };
  })(),

  /**
   * Track form field completion rates
   */
  trackFormProgress: (formId: string, totalFields: number) => {
    let completedFields = 0;
    
    return {
      fieldCompleted: () => {
        completedFields++;
        const percentage = Math.round((completedFields / totalFields) * 100);
        FormEvents.saved(formId, percentage, true);
      },
      getCompletionRate: () => Math.round((completedFields / totalFields) * 100)
    };
  }
};