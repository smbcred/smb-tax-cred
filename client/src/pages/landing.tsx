/**
 * @file landing.tsx
 * @description Main landing page with interactive calculator and lead capture
 * @author R&D Tax Credit SAAS Team
 * @date 2024-01-15
 * @modified 2024-01-15
 * @dependencies React, Calculator Components, Marketing Components
 * @knowledgeBase Landing page with hero section, calculator, features, and pricing
 */

import { useState } from "react";
import HeroSection from "@/components/marketing/HeroSection";
import InteractiveCalculator from "@/components/calculator/InteractiveCalculator";
import FeaturesSection from "@/components/marketing/FeaturesSection";
import PricingSection from "@/components/marketing/PricingSection";
import LeadCaptureModal from "@/components/modals/LeadCaptureModal";
import type { CalculationResult } from "@shared/schema";

// Navigation component
const Navigation = () => {
  const [showAuthModal, setShowAuthModal] = useState(false);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <nav className="bg-white shadow-sm border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                  <i className="fas fa-calculator text-white text-lg"></i>
                </div>
                <span className="ml-3 text-xl font-semibold text-slate-900">
                  R&D Tax Credit Pro
                </span>
              </div>
            </div>
          </div>
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              <button 
                onClick={() => scrollToSection('calculator')}
                className="text-slate-600 hover:text-rd-primary-500 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Calculator
              </button>
              <button 
                onClick={() => scrollToSection('features')}
                className="text-slate-600 hover:text-rd-primary-500 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Features
              </button>
              <button 
                onClick={() => scrollToSection('pricing')}
                className="text-slate-600 hover:text-rd-primary-500 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Pricing
              </button>
              <button 
                onClick={() => setShowAuthModal(true)}
                className="bg-blue-500 hover:bg-rd-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Sign In
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

// Footer component
const Footer = () => {
  return (
    <footer className="bg-slate-900 text-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-4 gap-8">
          <div className="col-span-2">
            <div className="flex items-center mb-6">
              <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                <i className="fas fa-calculator text-white text-lg"></i>
              </div>
              <span className="ml-3 text-xl font-semibold">R&D Tax Credit Pro</span>
            </div>
            <p className="text-slate-400 mb-6 max-w-md">
              Professional R&D tax credit documentation service helping small businesses maximize 
              their federal tax credits with AI-powered, IRS-compliant solutions.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-slate-400 hover:text-white transition-colors">
                <i className="fab fa-linkedin text-xl"></i>
              </a>
              <a href="#" className="text-slate-400 hover:text-white transition-colors">
                <i className="fab fa-twitter text-xl"></i>
              </a>
              <a href="#" className="text-slate-400 hover:text-white transition-colors">
                <i className="fab fa-facebook text-xl"></i>
              </a>
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Product</h4>
            <ul className="space-y-2 text-slate-400">
              <li>
                <button 
                  onClick={() => document.getElementById('calculator')?.scrollIntoView({ behavior: 'smooth' })}
                  className="hover:text-white transition-colors"
                >
                  Calculator
                </button>
              </li>
              <li>
                <button 
                  onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                  className="hover:text-white transition-colors"
                >
                  Features
                </button>
              </li>
              <li>
                <button 
                  onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}
                  className="hover:text-white transition-colors"
                >
                  Pricing
                </button>
              </li>
              <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Support</h4>
            <ul className="space-y-2 text-slate-400">
              <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-slate-800 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-slate-400 text-sm">© 2024 R&D Tax Credit Pro. All rights reserved.</p>
            <div className="flex items-center space-x-4 mt-4 md:mt-0">
              <span className="text-slate-400 text-sm">Powered by AI</span>
              <div className="flex items-center space-x-2">
                <i className="fas fa-lock text-slate-400"></i>
                <span className="text-slate-400 text-sm">SOC 2 Compliant</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

// Auth Modal Component
const AuthModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch(isLogin ? "/api/auth/login" : "/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Authentication failed");
      }

      const data = await response.json();
      localStorage.setItem("auth_token", data.token);
      window.location.reload(); // Refresh to trigger auth state change
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
        >
          <i className="fas fa-times"></i>
        </button>
        
        <div className="text-center mb-6">
          <h3 className="text-xl font-semibold text-slate-900 mb-2">
            {isLogin ? "Sign In" : "Create Account"}
          </h3>
          <p className="text-slate-600">
            {isLogin 
              ? "Access your R&D tax credit dashboard" 
              : "Start your R&D tax credit journey"
            }
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="form-label">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="form-input"
              placeholder="you@company.com"
              required
            />
          </div>
          
          <div>
            <label className="form-label">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="form-input"
              placeholder="Enter your password"
              required
            />
          </div>
          
          {error && (
            <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">
              {error}
            </div>
          )}
          
          <button 
            type="submit" 
            disabled={loading}
            className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Please wait..." : (isLogin ? "Sign In" : "Create Account")}
          </button>
        </form>
        
        <div className="text-center mt-6">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-sm text-rd-primary-500 hover:text-rd-primary-600"
          >
            {isLogin 
              ? "Need an account? Sign up" 
              : "Already have an account? Sign in"
            }
          </button>
        </div>
      </div>
    </div>
  );
};

// Main Landing component
export default function Landing() {
  const [showLeadCapture, setShowLeadCapture] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [calculationData, setCalculationData] = useState<CalculationResult | null>(null);

  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation />
      
      <HeroSection 
        onGetStarted={() => {
          document.getElementById('calculator')?.scrollIntoView({ behavior: 'smooth' });
        }}
      />
      
      <InteractiveCalculator 
        onResultsReady={(data) => {
          setCalculationData(data);
          setShowLeadCapture(true);
        }}
      />
      
      <FeaturesSection />
      
      <PricingSection />
      
      <Footer />
      
      <LeadCaptureModal
        isOpen={showLeadCapture}
        onClose={() => setShowLeadCapture(false)}
        calculationData={calculationData}
        onSuccess={() => {
          setShowLeadCapture(false);
          setShowAuth(true);
        }}
      />
      
      <AuthModal
        isOpen={showAuth}
        onClose={() => setShowAuth(false)}
      />
    </div>
  );
}
