/**
 * @file ResponsiveHero.tsx
 * @description Responsive hero section with mobile optimizations
 * @author SMBTaxCredits.com Team
 * INTEGRATION: Uses intersection observer for performance
 */

import { motion } from 'framer-motion';
import { FaChevronRight, FaArrowRight } from 'react-icons/fa';
import { useInView } from 'react-intersection-observer';

interface ResponsiveHeroProps {
  onStartEstimate?: () => void;
}

const ResponsiveHero: React.FC<ResponsiveHeroProps> = ({ onStartEstimate }) => {
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });

  const handleStartEstimate = () => {
    if (onStartEstimate) {
      onStartEstimate();
    } else {
      document.getElementById("calculator-section")?.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section className="relative pt-20 lg:pt-24 pb-16 lg:pb-24 overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-white via-gray-50 to-white -z-10" />
      
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
          {/* Text Content */}
          <motion.div 
            ref={ref}
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="w-full lg:w-1/2 text-center lg:text-left"
          >
            {/* Mobile-first headline sizing */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl 
                         font-bold text-gray-900 leading-tight mb-4 sm:mb-6">
              Claim your federal R&D tax credit—
              <span className="text-green-600 block mt-2">without the runaround.</span>
            </h1>
            
            {/* Responsive subheadline */}
            <p className="text-base sm:text-lg lg:text-xl text-gray-600 mb-6 sm:mb-8 
                        max-w-2xl mx-auto lg:mx-0 leading-relaxed">
              Flat-fee, self-serve documentation for amended 2022–2024 and current 2025 
              filings—IRS-aligned and CPA-ready.
            </p>

            {/* Trust indicators for mobile */}
            <div className="flex flex-wrap justify-center lg:justify-start gap-4 mb-6 sm:mb-8">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>IRS Compliant</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>CPA-Ready</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Flat-Fee</span>
              </div>
            </div>
            
            {/* Mobile-optimized CTA buttons */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start">
              <button 
                onClick={handleStartEstimate}
                className="w-full sm:w-auto bg-green-600 text-white px-6 sm:px-8 py-3 sm:py-4 
                         rounded-lg text-base sm:text-lg font-semibold hover:bg-green-700 
                         transition-all transform hover:scale-105 
                         focus:outline-none focus:ring-4 focus:ring-green-500/50
                         flex items-center justify-center gap-2 group"
              >
                Start your free estimate
                <FaArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
              
              <a href="#how-it-works" 
                 className="w-full sm:w-auto text-green-600 px-6 sm:px-8 py-3 sm:py-4 
                          rounded-lg text-base sm:text-lg font-semibold 
                          hover:bg-green-50 transition-all
                          text-center inline-flex items-center justify-center gap-2
                          border border-green-200 hover:border-green-300">
                See how it works
                <FaChevronRight className="w-4 h-4" />
              </a>
            </div>

            {/* Social proof for mobile */}
            <div className="mt-8 flex items-center justify-center lg:justify-start gap-6">
              <div className="text-center lg:text-left">
                <p className="text-2xl font-bold text-gray-900">1,000+</p>
                <p className="text-sm text-gray-600">SMBs Served</p>
              </div>
              <div className="border-l border-gray-300 h-12"></div>
              <div className="text-center lg:text-left">
                <p className="text-2xl font-bold text-gray-900">$10M+</p>
                <p className="text-sm text-gray-600">Credits Claimed</p>
              </div>
            </div>
          </motion.div>
          
          {/* Hero Image/Illustration - Responsive sizing */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="w-full lg:w-1/2 relative mt-8 lg:mt-0"
          >
            {/* Placeholder for hero illustration */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-blue-500 
                            rounded-2xl opacity-10 blur-3xl"></div>
              <div className="relative bg-gradient-to-br from-green-50 to-blue-50 
                            rounded-2xl p-8 sm:p-12 lg:p-16 text-center">
                <div className="space-y-4">
                  <div className="w-20 h-20 bg-green-100 rounded-full mx-auto 
                                flex items-center justify-center">
                    <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                            d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    Calculate Your Credit
                  </h3>
                  <p className="text-gray-600">
                    Get your estimate in under 2 minutes
                  </p>
                  <div className="flex justify-center gap-2">
                    <div className="w-2 h-2 bg-green-600 rounded-full animate-pulse"></div>
                    <div className="w-2 h-2 bg-green-600 rounded-full animate-pulse delay-100"></div>
                    <div className="w-2 h-2 bg-green-600 rounded-full animate-pulse delay-200"></div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default ResponsiveHero;