// React hook for analytics integration

import { useEffect, useCallback } from 'react';
import { analytics } from '@/services/analytics';
import { EventCategory, EventName } from '../../../shared/types/analytics';

export interface UseAnalyticsReturn {
  track: (event: EventName | string, category: EventCategory, properties?: Record<string, any>, immediate?: boolean) => void;
  trackPageView: (page?: string) => void;
  trackConversion: (conversionType: string, value?: number, currency?: string) => void;
  trackFormEvent: (formId: string, action: 'started' | 'completed' | 'abandoned' | 'field_focused' | 'field_completed', fieldId?: string, value?: any) => void;
  trackClick: (element: string, category: 'cta' | 'nav' | 'button' | 'link', properties?: Record<string, any>) => void;
  trackError: (error: Error | string, category?: 'javascript' | 'api' | 'network' | 'validation', properties?: Record<string, any>) => void;
  startABTest: (testId: string, variants: { id: string; weight: number }[]) => string;
  getABTestVariant: (testId: string) => string | null;
  trackABTestConversion: (testId: string, conversionEvent: string) => void;
  setUserId: (userId: string) => void;
  setUserConsent: (granted: boolean) => void;
}

/**
 * Hook for analytics tracking throughout the application
 */
export function useAnalytics(): UseAnalyticsReturn {
  const track = useCallback((
    event: EventName | string,
    category: EventCategory,
    properties: Record<string, any> = {},
    immediate: boolean = false
  ) => {
    analytics.track(event, category, properties, immediate);
  }, []);

  const trackPageView = useCallback((page?: string) => {
    analytics.trackPageView(page);
  }, []);

  const trackConversion = useCallback((
    conversionType: string,
    value?: number,
    currency: string = 'USD'
  ) => {
    analytics.trackConversion(conversionType, value, currency);
  }, []);

  const trackFormEvent = useCallback((
    formId: string,
    action: 'started' | 'completed' | 'abandoned' | 'field_focused' | 'field_completed',
    fieldId?: string,
    value?: any
  ) => {
    analytics.trackFormEvent(formId, action, fieldId, value);
  }, []);

  const trackClick = useCallback((
    element: string,
    category: 'cta' | 'nav' | 'button' | 'link',
    properties: Record<string, any> = {}
  ) => {
    analytics.trackClick(element, category, properties);
  }, []);

  const trackError = useCallback((
    error: Error | string,
    category: 'javascript' | 'api' | 'network' | 'validation' = 'javascript',
    properties: Record<string, any> = {}
  ) => {
    analytics.trackError(error, category, properties);
  }, []);

  const startABTest = useCallback((
    testId: string,
    variants: { id: string; weight: number }[]
  ): string => {
    return analytics.startABTest(testId, variants);
  }, []);

  const getABTestVariant = useCallback((testId: string): string | null => {
    return analytics.getABTestVariant(testId);
  }, []);

  const trackABTestConversion = useCallback((testId: string, conversionEvent: string) => {
    analytics.trackABTestConversion(testId, conversionEvent);
  }, []);

  const setUserId = useCallback((userId: string) => {
    analytics.setUserId(userId);
  }, []);

  const setUserConsent = useCallback((granted: boolean) => {
    analytics.setUserConsent(granted);
  }, []);

  return {
    track,
    trackPageView,
    trackConversion,
    trackFormEvent,
    trackClick,
    trackError,
    startABTest,
    getABTestVariant,
    trackABTestConversion,
    setUserId,
    setUserConsent
  };
}

/**
 * Hook for tracking page views automatically
 */
export function usePageTracking(page?: string): void {
  const { trackPageView } = useAnalytics();

  useEffect(() => {
    trackPageView(page);
  }, [page, trackPageView]);
}

/**
 * Hook for form analytics
 */
export function useFormAnalytics(formId: string) {
  const { trackFormEvent } = useAnalytics();

  const trackFormStart = useCallback(() => {
    trackFormEvent(formId, 'started');
  }, [formId, trackFormEvent]);

  const trackFormComplete = useCallback(() => {
    trackFormEvent(formId, 'completed');
  }, [formId, trackFormEvent]);

  const trackFormAbandon = useCallback(() => {
    trackFormEvent(formId, 'abandoned');
  }, [formId, trackFormEvent]);

  const trackFieldFocus = useCallback((fieldId: string) => {
    trackFormEvent(formId, 'field_focused', fieldId);
  }, [formId, trackFormEvent]);

  const trackFieldComplete = useCallback((fieldId: string, value: any) => {
    trackFormEvent(formId, 'field_completed', fieldId, value);
  }, [formId, trackFormEvent]);

  // Auto-track form abandonment on unmount
  useEffect(() => {
    return () => {
      trackFormAbandon();
    };
  }, [trackFormAbandon]);

  return {
    trackFormStart,
    trackFormComplete,
    trackFormAbandon,
    trackFieldFocus,
    trackFieldComplete
  };
}

/**
 * Hook for conversion funnel tracking
 */
export function useConversionFunnel(funnelId: string, steps: string[]) {
  const { track } = useAnalytics();

  const trackFunnelStep = useCallback((stepIndex: number, stepData?: Record<string, any>) => {
    if (stepIndex < 0 || stepIndex >= steps.length) return;

    track('funnel_step_completed', 'user_action', {
      funnelId,
      stepIndex,
      stepName: steps[stepIndex],
      totalSteps: steps.length,
      ...stepData
    });
  }, [funnelId, steps, track]);

  const trackFunnelComplete = useCallback((conversionValue?: number) => {
    track('funnel_completed', 'user_action', {
      funnelId,
      totalSteps: steps.length,
      conversionValue
    }, true);
  }, [funnelId, steps.length, track]);

  const trackFunnelAbandon = useCallback((lastStepIndex: number) => {
    track('funnel_abandoned', 'user_action', {
      funnelId,
      lastStepIndex,
      lastStepName: steps[lastStepIndex],
      totalSteps: steps.length
    });
  }, [funnelId, steps, track]);

  return {
    trackFunnelStep,
    trackFunnelComplete,
    trackFunnelAbandon
  };
}

/**
 * Hook for A/B testing with React components
 */
export function useABTest(testId: string, variants: { id: string; weight: number; component: React.ComponentType }[]) {
  const { startABTest, getABTestVariant } = useAnalytics();

  const variantId = getABTestVariant(testId) || startABTest(
    testId,
    variants.map(v => ({ id: v.id, weight: v.weight }))
  );

  const selectedVariant = variants.find(v => v.id === variantId) || variants[0];

  return {
    variantId,
    Component: selectedVariant.component
  };
}

/**
 * Hook for performance tracking
 */
export function usePerformanceTracking() {
  const { track } = useAnalytics();

  const trackCustomMetric = useCallback((name: string, value: number, unit: string = 'ms') => {
    track('performance_metric', 'performance', {
      metric: name,
      value,
      unit,
      page: window.location.pathname
    });
  }, [track]);

  const trackApiResponseTime = useCallback((endpoint: string, duration: number) => {
    track('api_response_time', 'performance', {
      endpoint,
      duration,
      page: window.location.pathname
    });
  }, [track]);

  const trackResourceLoad = useCallback((resource: string, duration: number, size?: number) => {
    track('resource_load_time', 'performance', {
      resource,
      duration,
      size,
      page: window.location.pathname
    });
  }, [track]);

  return {
    trackCustomMetric,
    trackApiResponseTime,
    trackResourceLoad
  };
}

/**
 * Hook for error tracking and reporting
 */
export function useErrorTracking() {
  const { trackError } = useAnalytics();

  useEffect(() => {
    // Global error handler
    const handleError = (event: ErrorEvent) => {
      trackError(event.error || event.message, 'javascript', {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno
      });
    };

    // Unhandled promise rejection handler
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      trackError(event.reason, 'javascript', {
        type: 'unhandledRejection'
      });
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, [trackError]);

  return { trackError };
}