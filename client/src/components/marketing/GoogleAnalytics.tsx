import React, { useEffect } from 'react';

interface GoogleAnalyticsProps {
  measurementId?: string;
  enableInDevelopment?: boolean;
}

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    dataLayer?: any[];
  }
}

export const GoogleAnalytics: React.FC<GoogleAnalyticsProps> = ({
  measurementId = process.env.VITE_GOOGLE_ANALYTICS_ID,
  enableInDevelopment = false
}) => {
  useEffect(() => {
    // Only load GA in production unless explicitly enabled for development
    if (!measurementId || (process.env.NODE_ENV === 'development' && !enableInDevelopment)) {
      console.log('Google Analytics disabled in development mode');
      return;
    }

    // Initialize Google Analytics 4
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
    document.head.appendChild(script);

    // Initialize gtag function
    window.dataLayer = window.dataLayer || [];
    window.gtag = function() {
      window.dataLayer?.push(arguments);
    };

    // Configure Google Analytics
    window.gtag?.('js', new Date());
    window.gtag?.('config', measurementId, {
      // Privacy-friendly configuration
      anonymize_ip: true,
      cookie_flags: 'SameSite=None;Secure',
      cookie_domain: window.location.hostname,
      // Enhanced privacy settings
      allow_google_signals: false,
      allow_ad_personalization_signals: false,
      // Custom settings for R&D tax credit tracking
      custom_map: {
        custom_parameter_1: 'calculator_completion',
        custom_parameter_2: 'lead_source',
        custom_parameter_3: 'estimated_credit'
      }
    });

    // Track page view
    window.gtag?.('event', 'page_view', {
      page_title: document.title,
      page_location: window.location.href,
      send_to: measurementId
    });

    console.log('Google Analytics initialized:', measurementId);

    // Cleanup function
    return () => {
      // Remove script if component unmounts
      const existingScript = document.querySelector(`script[src*="${measurementId}"]`);
      if (existingScript) {
        existingScript.remove();
      }
    };
  }, [measurementId, enableInDevelopment]);

  return null; // This component doesn't render anything
};

// Convenience functions for tracking events
export const trackCalculatorEvent = (action: string, data?: Record<string, any>) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', action, {
      event_category: 'Calculator',
      event_label: 'R&D Tax Credit Calculator',
      ...data
    });
  }
};

export const trackConversionEvent = (stage: string, value?: number) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'conversion', {
      event_category: 'Funnel',
      event_label: stage,
      value: value || 0,
      currency: 'USD'
    });
  }
};

export const trackLeadEvent = (source: string, estimatedCredit?: number) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'generate_lead', {
      event_category: 'Lead Generation',
      event_label: source,
      value: estimatedCredit || 0,
      currency: 'USD'
    });
  }
};

export const trackPaymentEvent = (plan: string, amount: number, transactionId: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'purchase', {
      transaction_id: transactionId,
      value: amount,
      currency: 'USD',
      items: [{
        item_id: plan,
        item_name: `R&D Tax Credit Documentation - ${plan}`,
        category: 'Tax Services',
        quantity: 1,
        price: amount
      }]
    });
  }
};

export default GoogleAnalytics;