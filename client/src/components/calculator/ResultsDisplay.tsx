/**
 * @file ResultsDisplay.tsx
 * @description Animated results display showing R&D tax credit calculations
 * @author SMBTaxCredits.com Team
 * @date 2025-01-09
 * @knowledgeBase 
 * - system-architecture-explanation.md
 * - pricing_strategy_rd_platform.md
 * - user_archetype_profiles.md
 * 
 * Creates the "aha moment" when SMBs realize their innovation activities
 * (process optimization, custom solutions, digital transformation) qualify
 * for significant federal tax credits.
 * 
 * EXAMPLES:
 * - Agency refined custom solutions: $15,000 credit
 * - E-commerce optimized processes: $8,000 credit
 * - Healthcare improved systems: $12,000 credit
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TrendingUp, 
  DollarSign, 
  Award, 
  CheckCircle,
  ArrowRight,
  Sparkles,
  Clock,
  Shield,
  FileText
} from 'lucide-react';
import { CountUpAnimation } from './CountUpAnimation';
import { formatCurrency } from '@/utils/calculations';

interface ResultsDisplayProps {
  result: any;
  isBlurred?: boolean;
  onGetStarted?: () => void;
  showFullDetails?: boolean;
}

interface QRELineItemProps {
  label: string;
  amount: number;
  percentage: number;
  icon: React.ReactNode;
  note?: string;
}

const QRELineItem: React.FC<QRELineItemProps> = ({ label, amount, percentage, icon, note }) => (
  <div className="flex items-start gap-3">
    <div className="mt-1 text-blue-600">{icon}</div>
    <div className="flex-1">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <p className="font-medium text-gray-900">{label}</p>
          {note && <p className="text-xs text-gray-500 mt-0.5">{note}</p>}
        </div>
        <div className="text-right ml-4">
          <p className="font-semibold">{formatCurrency(amount)}</p>
          <p className="text-xs text-gray-500">{percentage.toFixed(1)}%</p>
        </div>
      </div>
    </div>
  </div>
);

export const ResultsDisplay: React.FC<ResultsDisplayProps> = ({
  result,
  isBlurred = true,
  onGetStarted,
  showFullDetails = false
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [showBreakdown, setShowBreakdown] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (result) {
      setIsVisible(true);
      setTimeout(() => setShowBreakdown(true), 1500);
    }
  }, [result]);

  if (!result) {
    return (
      <div className="text-center py-12 text-gray-500">
        <Sparkles className="mx-auto h-12 w-12 mb-4 text-gray-300" />
        <p className="text-lg">Enter your information above to see your potential innovation tax credits</p>
      </div>
    );
  }

  const { federalCredit, totalQRE, tierInfo, roi, breakdown } = result;
  const hasSignificantCredit = federalCredit >= 5000;

  const getExampleActivity = () => {
    const activities = [
      'custom solution development',
      'process optimization',
      'digital transformation',
      'system integration',
      'automation development'
    ];
    return activities[Math.floor(Math.random() * activities.length)];
  };

  return (
    <AnimatePresence>
      <motion.div
        ref={containerRef}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.5 }}
        className="relative"
      >
        {/* Blur Overlay - Conversion Driver */}
        {isBlurred && (
          <div className="absolute inset-0 z-20 flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-xl shadow-2xl p-8 max-w-md mx-4 text-center"
            >
              <div className="mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                  <Sparkles className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  Your Results Are Ready!
                </h3>
                <p className="text-gray-600">
                  See how much your innovation work could save in federal taxes
                </p>
              </div>
              
              {/* Teaser Amount */}
              <div className="mb-6 p-4 bg-primary-light rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Estimated Federal Innovation Credit</p>
                <p className="text-3xl font-bold text-primary">
                  {formatCurrency(Math.round(federalCredit / 1000) * 1000)}+
                </p>
              </div>

              <button
                onClick={onGetStarted}
                className="w-full btn-primary flex items-center justify-center group"
              >
                See My Full Results
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </button>

              <p className="mt-4 text-xs text-gray-500">
                No credit card required • 2-minute process
              </p>
            </motion.div>
          </div>
        )}

        {/* Main Results Content */}
        <div className={`${isBlurred ? 'blur-md pointer-events-none' : ''} transition-all duration-500`}>
          {/* Hero Credit Amount */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-center mb-8"
          >
            <h2 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-2">
              Your Estimated Federal Innovation Tax Credit
            </h2>
            
            <div className="relative inline-block">
              <CountUpAnimation
                end={federalCredit}
                duration={2000}
                className="text-5xl md:text-6xl font-bold text-primary"
                prefix="$"
              />
              
              {hasSignificantCredit && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 1, type: "spring" }}
                  className="absolute -top-2 -right-12"
                >
                  <div className="bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                    WOW!
                  </div>
                </motion.div>
              )}
            </div>

            <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
              Your work on {getExampleActivity()} qualifies for federal R&D tax credits
            </p>
          </motion.div>

          {/* ROI Highlight Box */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-secondary-light border border-secondary rounded-xl p-6 mb-8"
          >
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  <h3 className="font-semibold text-gray-900">Return on Investment</h3>
                </div>
                <p className="text-2xl font-bold text-green-600">
                  {roi}x return
                </p>
                <p className="text-sm text-gray-600">
                  {formatCurrency(federalCredit - (tierInfo?.price || 0))} net benefit after our {formatCurrency(tierInfo?.price || 0)} fee
                </p>
              </div>
              
              <div className="text-right">
                <p className="text-sm text-gray-600 mb-1">Break even in</p>
                <p className="text-2xl font-bold text-gray-900">{Math.round(365 / roi)} days</p>
              </div>
            </div>
          </motion.div>

          {/* QRE Breakdown */}
          {breakdown && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="mb-8"
            >
              <button
                onClick={() => setShowBreakdown(!showBreakdown)}
                className="flex items-center gap-2 text-gray-700 hover:text-gray-900 mb-4 font-medium"
              >
                <span>Qualifying Expense Breakdown</span>
                <motion.span
                  animate={{ rotate: showBreakdown ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                  className="inline-block"
                >
                  ▼
                </motion.span>
              </button>

              <AnimatePresence>
                {showBreakdown && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                      {breakdown.wages > 0 && (
                        <QRELineItem
                          label="Employee time on innovation experiments"
                          amount={breakdown.wages}
                          percentage={(breakdown.wages / totalQRE) * 100}
                          icon={<DollarSign className="h-5 w-5" />}
                        />
                      )}

                      {breakdown.contractors > 0 && (
                        <QRELineItem
                          label="External consultants (65% eligible)"
                          amount={breakdown.contractors}
                          percentage={(breakdown.contractors / totalQRE) * 100}
                          icon={<Award className="h-5 w-5" />}
                          note="IRS limits contractor costs to 65%"
                        />
                      )}

                      {breakdown.supplies > 0 && (
                        <QRELineItem
                          label="Software, cloud, testing costs"
                          amount={breakdown.supplies}
                          percentage={(breakdown.supplies / totalQRE) * 100}
                          icon={<DollarSign className="h-5 w-5" />}
                        />
                      )}

                      <div className="pt-4 border-t border-gray-200">
                        <div className="flex justify-between items-center">
                          <span className="font-semibold text-gray-900">Total Qualifying Expenses</span>
                          <span className="font-bold text-xl">{formatCurrency(totalQRE)}</span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          Credit Rate: 6% (First-time filer) • Method: Alternative Simplified Credit
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {/* Trust Signals */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
          >
            <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg">
              <Shield className="h-8 w-8 text-blue-600 flex-shrink-0" />
              <div>
                <p className="font-semibold text-gray-900">IRS Compliant</p>
                <p className="text-xs text-gray-600">Full audit support included</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg">
              <CheckCircle className="h-8 w-8 text-green-600 flex-shrink-0" />
              <div>
                <p className="font-semibold text-gray-900">Guaranteed Results</p>
                <p className="text-xs text-gray-600">Or your money back</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-lg">
              <FileText className="h-8 w-8 text-purple-600 flex-shrink-0" />
              <div>
                <p className="font-semibold text-gray-900">Complete Package</p>
                <p className="text-xs text-gray-600">All forms & documentation</p>
              </div>
            </div>
          </motion.div>

          {/* Service Tier */}
          {tierInfo && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.1 }}
              className="bg-primary text-white rounded-xl p-6 mb-8 card-shadow-lg"
            >
              <h3 className="text-lg font-semibold mb-2">Your Service Package</h3>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-2xl font-bold">{tierInfo.description}</p>
                  <p className="text-sm opacity-90 mt-1">
                    For credits {formatCurrency(tierInfo.creditRange.min)} - {formatCurrency(tierInfo.creditRange.max)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm opacity-90">One-time fee</p>
                  <p className="text-2xl font-bold">{formatCurrency(tierInfo.price)}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mt-4">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  <span className="text-sm">IRS Form 6765</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  <span className="text-sm">Technical Narratives</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  <span className="text-sm">QRE Documentation</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  <span className="text-sm">CPA-Ready Package</span>
                </div>
              </div>
            </motion.div>
          )}

          {/* Urgency Element */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.3 }}
            className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8"
          >
            <div className="flex items-start gap-3">
              <Clock className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div>
                <p className="font-semibold text-gray-900">Limited Time Offer</p>
                <p className="text-sm text-gray-600">
                  Claim your {new Date().getFullYear()} credits before tax deadlines. Most businesses leave money on the table.
                </p>
              </div>
            </div>
          </motion.div>

          {/* CTA Button */}
          {onGetStarted && !isBlurred && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.5 }}
              className="text-center"
            >
              <button
                onClick={onGetStarted}
                className="btn-primary btn-lg transform hover:scale-105 shadow-lg"
              >
                Start My Documentation
              </button>
              <p className="text-sm text-gray-500 mt-3">
                Average completion time: 45 minutes • Support available 24/7
              </p>
            </motion.div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};