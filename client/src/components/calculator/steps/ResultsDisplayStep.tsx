/**
 * @file ResultsDisplayStep.tsx
 * @description Step 4: Results display with lead capture trigger
 */

import { motion } from 'framer-motion';
import { formatCurrency, formatNumber } from '@/utils/calculations';
import { FaCheckCircle, FaChartLine, FaDollarSign, FaFileAlt } from 'react-icons/fa';

interface ResultsDisplayStepProps {
  results: {
    totalQRE: number;
    federalCredit: number;
    stateCredit: number;
    totalBenefit: number;
    pricingTier: number;
    tierInfo: any;
    roi: number;
    breakdown?: {
      wages: number;
      contractors: number;
      supplies: number;
      cloud: number;
    };
  } | null;
  isBlurred: boolean;
  onCTAClick: () => void;
}

export const ResultsDisplayStep: React.FC<ResultsDisplayStepProps> = ({
  results,
  isBlurred,
  onCTAClick
}) => {
  if (!results) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">
          Please complete the previous steps to see your results
        </p>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Blur overlay for non-registered users */}
      {isBlurred && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/80 backdrop-blur-sm rounded-lg">
          <div className="text-center p-6">
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              Your Results Are Ready!
            </h3>
            <p className="text-gray-600 mb-6 max-w-md">
              Enter your email to unlock your complete AI R&D credit estimate, 
              pricing details, and next steps.
            </p>
            <button
              onClick={onCTAClick}
              className="bg-green-600 text-white px-8 py-3 rounded-lg font-semibold 
                       hover:bg-green-700 transition-all transform hover:scale-105"
            >
              See My Full Results
            </button>
            <p className="text-xs text-gray-500 mt-3">
              No credit card required • Takes 30 seconds
            </p>
          </div>
        </div>
      )}

      {/* Results Content */}
      <div className={isBlurred ? 'filter blur-md' : ''}>
        <div className="mb-6">
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            Your Innovation Tax Credit Estimate
          </h3>
          <p className="text-gray-600">
            Based on your innovation and experimentation activities, here's your potential tax savings
          </p>
        </div>

        {/* Main Credit Amount */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg p-6 mb-6"
        >
          <div className="text-center">
            <p className="text-sm uppercase tracking-wide opacity-90 mb-2">
              Total Federal Innovation Tax Credit
            </p>
            <div className="text-5xl font-bold mb-2">
              {formatCurrency(results.federalCredit)}
            </div>
            <p className="text-sm opacity-90">
              Potential annual tax savings using ASC method
            </p>
          </div>
        </motion.div>

        {/* Breakdown Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-white border border-gray-200 rounded-lg p-4"
          >
            <div className="flex items-center gap-3 mb-2">
              <FaChartLine className="text-blue-600 text-xl" />
              <span className="font-semibold text-gray-900">Qualifying Expenses</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {formatCurrency(results.totalQRE)}
            </div>
            <p className="text-sm text-gray-600 mt-1">
              Total R&D expenses that qualify
            </p>
          </motion.div>

          <motion.div
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-white border border-gray-200 rounded-lg p-4"
          >
            <div className="flex items-center gap-3 mb-2">
              <FaDollarSign className="text-green-600 text-xl" />
              <span className="font-semibold text-gray-900">Your ROI</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {results.roi}x
            </div>
            <p className="text-sm text-gray-600 mt-1">
              Return on investment with our service
            </p>
          </motion.div>
        </div>

        {/* Expense Breakdown */}
        {results.breakdown && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-gray-50 rounded-lg p-4 mb-6"
          >
            <h4 className="font-semibold text-gray-900 mb-3">QRE Breakdown</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Wages & Salaries</span>
                <span className="font-medium">{formatCurrency(results.breakdown.wages)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Contract Research</span>
                <span className="font-medium">{formatCurrency(results.breakdown.contractors)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Software & Supplies</span>
                <span className="font-medium">{formatCurrency(results.breakdown.supplies)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Cloud Computing</span>
                <span className="font-medium">{formatCurrency(results.breakdown.cloud)}</span>
              </div>
              <div className="border-t pt-2 mt-2">
                <div className="flex justify-between font-semibold">
                  <span>Total QRE</span>
                  <span>{formatCurrency(results.totalQRE)}</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Pricing Information */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6"
        >
          <h4 className="font-semibold text-blue-900 mb-2">
            Your Pricing Tier: {results.tierInfo.description}
          </h4>
          <div className="flex justify-between items-center">
            <span className="text-blue-800">Documentation Service Fee:</span>
            <span className="text-2xl font-bold text-blue-900">
              {formatCurrency(results.tierInfo.price)}
            </span>
          </div>
          <p className="text-sm text-blue-700 mt-2">
            One-time flat fee • No percentage of credit • Includes all forms & documentation
          </p>
        </motion.div>

        {/* What's Included */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h4 className="font-semibold text-gray-900 mb-3">What You'll Receive</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {[
              'IRS Form 6765 Data',
              'Section G Project Summaries',
              'Technical Narratives',
              'QRE Calculations',
              'Filing Instructions',
              'CPA-Ready Package'
            ].map((item, index) => (
              <div key={index} className="flex items-center gap-2">
                <FaCheckCircle className="text-green-500 text-sm" />
                <span className="text-sm text-gray-700">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};