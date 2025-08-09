/**
 * @file ResultsDisplay.tsx
 * @description Calculator results display with pricing tiers
 * @author R&D Tax Credit SAAS Team
 * @date 2024-01-15
 * @modified 2024-01-15
 * @dependencies React, Calculator Service
 * @knowledgeBase Step 4 - Results display with animated values and CTA
 */

import { CalculationResult } from "@/types";
import { formatCurrency, getPricingTier } from "@/services/calculator.service";
import { Button } from "@/components/ui/button";

interface ResultsDisplayProps {
  result: CalculationResult;
  onGetFullReport: () => void;
}

export default function ResultsDisplay({ result, onGetFullReport }: ResultsDisplayProps) {
  const pricingTier = getPricingTier(result.federalCredit);
  
  return (
    <div className="calculator-step animate-fade-in">
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold text-slate-900 mb-4">
          Your R&D Tax Credit Estimate
        </h3>
        <p className="text-slate-600">Based on your qualifying research expenses</p>
      </div>
      
      {/* Results Cards */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="dashboard-card text-center">
          <div className="text-sm text-slate-600 mb-2">Total QREs</div>
          <div className="text-2xl font-bold text-rd-primary-500 animate-count-up">
            {formatCurrency(result.totalQRE)}
          </div>
          <div className="text-xs text-slate-500 mt-2">
            Qualified Research Expenses
          </div>
        </div>
        
        <div className="dashboard-card text-center border-2 border-rd-secondary-200 bg-rd-secondary-50">
          <div className="text-sm text-slate-600 mb-2">Federal Credit</div>
          <div className="text-3xl font-bold text-rd-secondary-500 animate-count-up">
            {formatCurrency(result.federalCredit)}
          </div>
          <div className="text-xs text-slate-500 mt-2">
            14% ASC Method
          </div>
        </div>
        
        <div className="dashboard-card text-center">
          <div className="text-sm text-slate-600 mb-2">Our Service Fee</div>
          <div className="text-2xl font-bold text-slate-900 animate-count-up">
            {formatCurrency(result.pricingAmount)}
          </div>
          <div className="text-xs text-slate-500 mt-2">
            {pricingTier.name} Package
          </div>
        </div>
      </div>

      {/* Value Proposition */}
      <div className="bg-slate-100 rounded-lg p-6 mb-8">
        <div className="grid md:grid-cols-2 gap-6 items-center">
          <div>
            <h4 className="font-semibold text-slate-900 mb-3">
              <i className="fas fa-chart-line text-rd-secondary-500 mr-2"></i>
              Excellent ROI Opportunity
            </h4>
            <div className="space-y-2 text-sm text-slate-600">
              <div className="flex justify-between">
                <span>Estimated Credit:</span>
                <span className="font-semibold text-rd-secondary-600">
                  {formatCurrency(result.federalCredit)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Service Investment:</span>
                <span className="font-semibold">
                  {formatCurrency(result.pricingAmount)}
                </span>
              </div>
              <div className="flex justify-between border-t border-slate-300 pt-2">
                <span className="font-semibold">Net Benefit:</span>
                <span className="font-bold text-rd-secondary-600">
                  {formatCurrency(result.federalCredit - result.pricingAmount)}
                </span>
              </div>
            </div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-rd-primary-500">
              {Math.round(((result.federalCredit - result.pricingAmount) / result.pricingAmount) * 100)}%
            </div>
            <div className="text-sm text-slate-600">Return on Investment</div>
          </div>
        </div>
      </div>

      {/* Package Features */}
      <div className="bg-white border border-slate-200 rounded-lg p-6 mb-8">
        <h4 className="font-semibold text-slate-900 mb-4">
          <i className="fas fa-star text-yellow-500 mr-2"></i>
          {pricingTier.name} Package Includes:
        </h4>
        <div className="grid md:grid-cols-2 gap-3">
          {pricingTier.features.map((feature, index) => (
            <div key={index} className="flex items-center">
              <i className="fas fa-check text-rd-secondary-500 mr-2"></i>
              <span className="text-sm text-slate-700">{feature}</span>
            </div>
          ))}
        </div>
      </div>
      
      {/* Unlock Results CTA */}
      <div className="gradient-primary rounded-xl p-8 text-center text-white">
        <h4 className="text-xl font-semibold mb-2">Unlock Your Complete Analysis</h4>
        <p className="mb-6 opacity-90">
          Get detailed breakdown and start your IRS-compliant documentation process
        </p>
        <div className="space-y-3">
          <Button 
            onClick={onGetFullReport}
            className="bg-white text-rd-primary-500 hover:bg-slate-100 px-8 py-3 font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all"
          >
            <i className="fas fa-download mr-2"></i>
            Get Full Report
          </Button>
          <div className="flex items-center justify-center space-x-4 text-sm opacity-80">
            <div className="flex items-center">
              <i className="fas fa-shield-alt mr-1"></i>
              <span>30-Day Guarantee</span>
            </div>
            <div className="flex items-center">
              <i className="fas fa-clock mr-1"></i>
              <span>Fast Delivery</span>
            </div>
            <div className="flex items-center">
              <i className="fas fa-headset mr-1"></i>
              <span>Expert Support</span>
            </div>
          </div>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="mt-6 text-xs text-slate-500 text-center">
        <i className="fas fa-info-circle mr-1"></i>
        This is an estimate based on the simplified ASC method. Actual credits may vary based on 
        detailed documentation review and IRS guidelines.
      </div>
    </div>
  );
}
