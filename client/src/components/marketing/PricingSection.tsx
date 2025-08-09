/**
 * @file PricingSection.tsx
 * @description Pricing section with dynamic tier display
 * @author R&D Tax Credit SAAS Team
 * @date 2024-01-15
 * @modified 2024-01-15
 * @dependencies React, Calculator Service
 * @knowledgeBase Pricing tiers based on calculated R&D credit amounts
 */

import { pricingTiers } from "@/services/calculator.service";

export default function PricingSection() {
  return (
    <section id="pricing" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">Transparent Pricing</h2>
          <p className="text-lg text-slate-600">
            Our fee is based on your calculated R&D tax credit amount
          </p>
        </div>
        
        <div className="grid md:grid-cols-4 gap-6">
          {pricingTiers.map((tier, index) => (
            <div 
              key={tier.tier}
              className={`relative rounded-xl p-6 transition-all hover:shadow-md ${
                tier.popular 
                  ? 'bg-blue-50 border-2 border-blue-500' 
                  : 'bg-white border border-slate-200'
              }`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {tier.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                    Most Popular
                  </span>
                </div>
              )}
              
              <div className="text-center">
                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                  {tier.name}
                </h3>
                <div className="text-3xl font-bold text-rd-primary-500 mb-1">
                  ${tier.price.toLocaleString()}
                </div>
                <p className="text-sm text-slate-600 mb-4">
                  Credits {tier.creditRange}
                </p>
                
                <ul className="text-sm text-slate-600 space-y-2 mb-6">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-center">
                      <i className="fas fa-check text-rd-secondary-500 mr-2"></i>
                      {feature}
                    </li>
                  ))}
                </ul>
                
                <button 
                  className={`w-full py-2 rounded-lg font-medium transition-colors ${
                    tier.popular
                      ? 'btn-primary'
                      : 'bg-slate-100 text-slate-600 cursor-not-allowed'
                  }`}
                  disabled={!tier.popular}
                >
                  {tier.popular ? 'Get Started' : 'Based on Calculation'}
                </button>
              </div>
            </div>
          ))}
        </div>
        
        <div className="text-center mt-12">
          <p className="text-slate-600 mb-4">
            All pricing includes complete IRS-compliant documentation package
          </p>
          <div className="flex items-center justify-center space-x-6 text-sm text-slate-500">
            <div className="flex items-center">
              <i className="fas fa-shield-alt mr-2"></i>
              <span>Secure Processing</span>
            </div>
            <div className="flex items-center">
              <i className="fas fa-clock mr-2"></i>
              <span>30-Day Delivery</span>
            </div>
            <div className="flex items-center">
              <i className="fas fa-headset mr-2"></i>
              <span>Expert Support</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
