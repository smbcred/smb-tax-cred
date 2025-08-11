// Unit tests for useAnalytics hook
import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useAnalytics } from '@/hooks/useAnalytics';

// Mock the analytics service
vi.mock('@/services/analytics', () => ({
  analyticsService: {
    trackEvent: vi.fn(),
    trackPageView: vi.fn(),
    trackConversion: vi.fn(),
    trackUserAction: vi.fn(),
    trackFormSubmission: vi.fn(),
    trackCalculatorInteraction: vi.fn(),
    startUserJourney: vi.fn(),
    updateUserJourney: vi.fn(),
    completeUserJourney: vi.fn(),
    getPerformanceMetrics: vi.fn(() => ({
      pageLoadTime: 1500,
      firstContentfulPaint: 800,
      largestContentfulPaint: 1200,
      cumulativeLayoutShift: 0.05,
      firstInputDelay: 50
    })),
    isOptedOut: vi.fn(() => false),
    optOut: vi.fn(),
    optIn: vi.fn(),
  }
}));

describe('useAnalytics Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('initializes analytics service correctly', () => {
    const { result } = renderHook(() => useAnalytics());
    
    expect(result.current).toBeDefined();
    expect(typeof result.current.trackEvent).toBe('function');
    expect(typeof result.current.trackPageView).toBe('function');
    expect(typeof result.current.trackConversion).toBe('function');
  });

  it('tracks events correctly', () => {
    const { result } = renderHook(() => useAnalytics());
    const mockAnalytics = vi.mocked(require('@/services/analytics').analyticsService);
    
    act(() => {
      result.current.trackEvent('button_click', {
        buttonName: 'calculate',
        location: 'landing_page'
      });
    });
    
    expect(mockAnalytics.trackEvent).toHaveBeenCalledWith('button_click', {
      buttonName: 'calculate',
      location: 'landing_page'
    });
  });

  it('tracks page views correctly', () => {
    const { result } = renderHook(() => useAnalytics());
    const mockAnalytics = vi.mocked(require('@/services/analytics').analyticsService);
    
    act(() => {
      result.current.trackPageView('/calculator');
    });
    
    expect(mockAnalytics.trackPageView).toHaveBeenCalledWith('/calculator');
  });

  it('tracks conversions correctly', () => {
    const { result } = renderHook(() => useAnalytics());
    const mockAnalytics = vi.mocked(require('@/services/analytics').analyticsService);
    
    act(() => {
      result.current.trackConversion('lead_capture', {
        email: 'test@example.com',
        source: 'calculator'
      });
    });
    
    expect(mockAnalytics.trackConversion).toHaveBeenCalledWith('lead_capture', {
      email: 'test@example.com',
      source: 'calculator'
    });
  });

  it('handles user journey tracking', () => {
    const { result } = renderHook(() => useAnalytics());
    const mockAnalytics = vi.mocked(require('@/services/analytics').analyticsService);
    
    act(() => {
      result.current.startUserJourney('calculator_flow');
    });
    
    act(() => {
      result.current.updateUserJourney('calculator_flow', 'expense_input');
    });
    
    act(() => {
      result.current.completeUserJourney('calculator_flow', 'results_displayed');
    });
    
    expect(mockAnalytics.startUserJourney).toHaveBeenCalledWith('calculator_flow');
    expect(mockAnalytics.updateUserJourney).toHaveBeenCalledWith('calculator_flow', 'expense_input');
    expect(mockAnalytics.completeUserJourney).toHaveBeenCalledWith('calculator_flow', 'results_displayed');
  });

  it('tracks form interactions', () => {
    const { result } = renderHook(() => useAnalytics());
    const mockAnalytics = vi.mocked(require('@/services/analytics').analyticsService);
    
    act(() => {
      result.current.trackFormSubmission('lead_capture_form', {
        success: true,
        fields: ['email', 'company', 'phone'],
        timeToComplete: 45000
      });
    });
    
    expect(mockAnalytics.trackFormSubmission).toHaveBeenCalledWith('lead_capture_form', {
      success: true,
      fields: ['email', 'company', 'phone'],
      timeToComplete: 45000
    });
  });

  it('tracks calculator interactions', () => {
    const { result } = renderHook(() => useAnalytics());
    const mockAnalytics = vi.mocked(require('@/services/analytics').analyticsService);
    
    act(() => {
      result.current.trackCalculatorInteraction('step_completed', {
        step: 'business_info',
        businessType: 'consulting',
        annualRevenue: 500000
      });
    });
    
    expect(mockAnalytics.trackCalculatorInteraction).toHaveBeenCalledWith('step_completed', {
      step: 'business_info',
      businessType: 'consulting',
      annualRevenue: 500000
    });
  });

  it('retrieves performance metrics', () => {
    const { result } = renderHook(() => useAnalytics());
    
    const metrics = result.current.getPerformanceMetrics();
    
    expect(metrics).toEqual({
      pageLoadTime: 1500,
      firstContentfulPaint: 800,
      largestContentfulPaint: 1200,
      cumulativeLayoutShift: 0.05,
      firstInputDelay: 50
    });
  });

  it('handles privacy controls', () => {
    const { result } = renderHook(() => useAnalytics());
    const mockAnalytics = vi.mocked(require('@/services/analytics').analyticsService);
    
    expect(result.current.isOptedOut()).toBe(false);
    
    act(() => {
      result.current.optOut();
    });
    
    expect(mockAnalytics.optOut).toHaveBeenCalled();
    
    act(() => {
      result.current.optIn();
    });
    
    expect(mockAnalytics.optIn).toHaveBeenCalled();
  });
});