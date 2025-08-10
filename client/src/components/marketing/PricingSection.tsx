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
          <h2 className="text-3xl font-bold text-heading mb-4">Transparent Pricing</h2>
          <p className="text-lg text-muted">
            Our fee is based on your calculated R&D tax credit amount
          </p>
        </div>
        
        <div className="grid md:grid-cols-4 gap-6">
          {pricingTiers.map((tier, index) => (
            <div 
              key={tier.tier}
              className={`relative rounded-xl p-6 transition-all hover:shadow-md ${
                tier.popular 
                  ? 'bg-primary-light border-2 border-primary' 
                  : 'bg-white border border-gray-200'
              }`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {tier.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-primary text-white px-3 py-1 rounded-full text-xs font-medium">
                    Most Popular
                  </span>
                </div>
              )}
              
              <div className="text-center">
                <h3 className="text-lg font-semibold text-heading mb-2">
                  {tier.name}
                </h3>
                <div className="text-3xl font-bold text-primary mb-1">
                  ${tier.price.toLocaleString()}
                </div>
                <p className="text-sm text-muted mb-4">
                  Credits {tier.creditRange}
                </p>
                
                <ul className="text-sm text-muted space-y-2 mb-6">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-center">
                      <i className="fas fa-check text-secondary mr-2"></i>
                      {feature}
                    </li>
                  ))}
                </ul>
                
                <button 
                  className={`w-full py-2 rounded-lg font-medium transition-colors ${
                    tier.popular
                      ? 'btn-primary'
                      : 'bg-gray-100 text-muted cursor-not-allowed'
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
          <p className="text-muted mb-4">
            All pricing includes complete IRS-compliant documentation package
          </p>
          <div className="flex items-center justify-center space-x-6 text-sm text-muted">
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
