import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { trackEvent } from '@/utils/analytics';

// A/B Test variants for landing page elements
const HEADLINE_VARIANTS = {
  A: "Small Businesses Using AI: You May Qualify for $20K+ in Tax Credits",
  B: "Turn Your ChatGPT Experiments Into IRS-Compliant R&D Tax Credits",
  C: "The Smart Friend Who Knows Taxes: AI Usage Documentation Made Simple"
};

const CTA_VARIANTS = {
  A: "Calculate My Tax Credit",
  B: "See My Potential Savings",
  C: "Check My Qualification"
};

const TRUST_SIGNALS = [
  { metric: "12,500+", label: "Calculations Completed" },
  { metric: "$52.3M", label: "Tax Credits Calculated" },
  { metric: "$27K", label: "Average Credit Amount" },
  { metric: "96%", label: "Success Rate" }
];

interface LandingOptimizationsProps {
  onCTAClick?: () => void;
}

export const LandingOptimizations: React.FC<LandingOptimizationsProps> = ({
  onCTAClick
}) => {
  const [headlineVariant, setHeadlineVariant] = useState<'A' | 'B' | 'C'>('A');
  const [ctaVariant, setCTAVariant] = useState<'A' | 'B' | 'C'>('A');
  const [isVisible, setIsVisible] = useState(false);

  // A/B test assignment
  useEffect(() => {
    // Simple hash-based assignment for consistent user experience
    const userId = localStorage.getItem('userId') || sessionStorage.getItem('sessionId') || 'anonymous';
    const hash = userId.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    
    const headlineIndex = Math.abs(hash) % 3;
    const ctaIndex = Math.abs(hash >> 1) % 3;
    
    const variants: Array<'A' | 'B' | 'C'> = ['A', 'B', 'C'];
    setHeadlineVariant(variants[headlineIndex]);
    setCTAVariant(variants[ctaIndex]);

    // Track A/B test impression
    trackEvent('ab_test_impression', {
      test_name: 'landing_page_optimization',
      headline_variant: variants[headlineIndex],
      cta_variant: variants[ctaIndex]
    });

    setIsVisible(true);
  }, []);

  const handleCTAClick = () => {
    // Track A/B test conversion
    trackEvent('ab_test_conversion', {
      test_name: 'landing_page_optimization',
      headline_variant: headlineVariant,
      cta_variant: ctaVariant,
      action: 'cta_click'
    });

    onCTAClick?.();
  };

  if (!isVisible) return null;

  return (
    <div className="space-y-8">
      {/* Optimized Headline */}
      <div className="text-center space-y-4">
        <Badge variant="secondary" className="mb-4">
          🚀 New: AI Experiment Documentation
        </Badge>
        
        <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white leading-tight">
          {HEADLINE_VARIANTS[headlineVariant]}
        </h1>
        
        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
          95% of small businesses using AI tools qualify for R&D tax credits. 
          Get instant qualification assessment and professional documentation.
        </p>
      </div>

      {/* Trust Signals */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 py-8">
        {TRUST_SIGNALS.map((signal, index) => (
          <div key={index} className="text-center">
            <div className="text-2xl md:text-3xl font-bold text-blue-600 dark:text-blue-400">
              {signal.metric}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {signal.label}
            </div>
          </div>
        ))}
      </div>

      {/* Optimized CTA */}
      <div className="text-center space-y-4">
        <Button 
          size="lg" 
          onClick={handleCTAClick}
          className="text-lg px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white"
        >
          {CTA_VARIANTS[ctaVariant]} →
        </Button>
        
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Free calculator • 2-minute assessment • No signup required
        </p>
      </div>

      {/* Social Proof */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 text-center">
        <p className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          "This calculator showed us we qualified for $28,000 in R&D credits"
        </p>
        <p className="text-gray-600 dark:text-gray-400">
          Sarah M., Marketing Agency Owner
        </p>
      </div>
    </div>
  );
};

// Exit-intent modal for lead capture
export const ExitIntentModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onCTAClick: () => void;
}> = ({ isOpen, onClose, onCTAClick }) => {
  useEffect(() => {
    if (isOpen) {
      trackEvent('exit_intent_shown', {
        trigger: 'mouse_leave',
        page: window.location.pathname
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6 relative">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          ✕
        </button>
        
        <div className="text-center space-y-4">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
            Wait! Don't Miss Out
          </h3>
          
          <p className="text-gray-600 dark:text-gray-300">
            You could be missing out on thousands in R&D tax credits. 
            Get your free assessment before you go.
          </p>
          
          <Button 
            onClick={() => {
              trackEvent('exit_intent_conversion', {
                action: 'cta_click'
              });
              onCTAClick();
            }}
            className="w-full bg-red-600 hover:bg-red-700 text-white"
          >
            Get My Free Assessment Now
          </Button>
          
          <p className="text-xs text-gray-500">
            Takes 2 minutes • No email required • Instant results
          </p>
        </div>
      </div>
    </div>
  );
};

// Sticky CTA bar for mobile
export const StickyCTABar: React.FC<{
  onCTAClick: () => void;
  estimatedCredit?: number;
}> = ({ onCTAClick, estimatedCredit }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY > 500;
      setIsVisible(scrolled);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-blue-600 text-white p-4 z-40 md:hidden">
      <div className="flex items-center justify-between">
        <div>
          <div className="font-semibold">
            {estimatedCredit ? `Potential Credit: $${estimatedCredit.toLocaleString()}` : 'Check Your R&D Credit'}
          </div>
          <div className="text-xs opacity-90">Free assessment</div>
        </div>
        <Button 
          onClick={() => {
            trackEvent('sticky_cta_click', {
              position: 'bottom',
              estimated_credit: estimatedCredit
            });
            onCTAClick();
          }}
          variant="secondary"
          size="sm"
        >
          Calculate
        </Button>
      </div>
    </div>
  );
};

export default LandingOptimizations;