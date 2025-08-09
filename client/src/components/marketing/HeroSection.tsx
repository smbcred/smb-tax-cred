/**
 * @file HeroSection.tsx
 * @description Hero section component with trust signals and CTA
 * @author R&D Tax Credit SAAS Team
 * @date 2024-01-15
 * @modified 2024-01-15
 * @dependencies React, Tailwind CSS
 * @knowledgeBase Hero section with professional design, trust signals, and call-to-action buttons
 */

interface HeroSectionProps {
  onGetStarted: () => void;
}

export default function HeroSection({ onGetStarted }: HeroSectionProps) {
  return (
    <section className="relative gradient-hero py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8 animate-fade-in">
            <div className="space-y-4">
              <h1 className="text-4xl lg:text-5xl font-bold text-slate-900 leading-tight">
                Calculate Your R&D Tax Credit in{" "}
                <span className="text-gradient">Minutes</span>
              </h1>
              <p className="text-xl text-slate-600 leading-relaxed">
                Professional R&D tax credit documentation service for small businesses. 
                Get IRS-compliant forms and maximize your federal tax credits with our 
                AI-powered platform.
              </p>
            </div>
            
            {/* Trust Signals */}
            <div className="grid grid-cols-3 gap-4 py-6">
              <div className="trust-signal">
                <div className="trust-signal-value trust-signal-primary">$2.3M+</div>
                <div className="text-sm text-slate-600">Credits Calculated</div>
              </div>
              <div className="trust-signal">
                <div className="trust-signal-value trust-signal-secondary">500+</div>
                <div className="text-sm text-slate-600">Happy Businesses</div>
              </div>
              <div className="trust-signal">
                <div className="trust-signal-value text-blue-600">99.2%</div>
                <div className="text-sm text-slate-600">IRS Compliance</div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <button 
                onClick={onGetStarted}
                className="btn-primary text-lg shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all"
              >
                Start Free Calculator
              </button>
              <button className="btn-outline text-lg">
                <i className="fas fa-play mr-2"></i>
                Watch Demo
              </button>
            </div>
          </div>
          
          <div className="relative animate-slide-up">
            {/* Professional dashboard interface showcasing the calculator */}
            <img 
              src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600" 
              alt="Professional business dashboard with financial calculations" 
              className="rounded-xl shadow-2xl w-full h-auto card-hover" 
            />
            <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-lg shadow-lg border border-slate-200">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-rd-secondary-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-slate-700">Live Calculation</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
