/**
 * @file LandingPage.tsx
 * @description Main marketing landing page for SMBTaxCredits.com R&D Tax Credit documentation service
 * @author SMBTaxCredits.com Team
 * @date 2024-01-15
 * @modified 2024-01-15
 * @dependencies React, Tailwind CSS, framer-motion, react-icons
 * @knowledgeBase Copywriting & Positioning Guide.md, user_archetype_profiles.md
 * 
 * This component serves as the primary conversion point for SMBTaxCredits.com,
 * featuring trust signals, benefit explanations, and an embedded calculator
 * to capture leads.
 */

import { useState } from "react";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { 
  FaShieldAlt, 
  FaLock, 
  FaCheckCircle, 
  FaDollarSign, 
  FaClock, 
  FaFileAlt,
  FaCalculator,
  FaFileSignature,
  FaDownload,
  FaChevronDown,
  FaChevronRight
} from "react-icons/fa";
import ResponsiveNav from "@/components/navigation/ResponsiveNav";
import ResponsiveHero from "@/components/sections/ResponsiveHero";
import { BenefitsGrid, PricingGrid, ProcessStepsGrid } from "@/components/layout/ResponsiveGrid";
import { MetaTags } from "@/components/seo/MetaTags";
import { InteractiveCalculator } from "@/components/calculator/InteractiveCalculator";
import { benefitsContent } from "@/data/benefitsContent";
import { processSteps } from "@/data/processContent";
import { pricingContent } from "@/data/pricingContent";
import { faqContent } from "@/data/faqContent";
import { HeroContent } from "@/data/heroContent";
import { Footer } from "@/components/layout/Footer";

// INTEGRATION: Calculator component will be imported and embedded in section 6
// TODO: Connect interactive calculator component once built
// TODO: Implement Google Analytics event tracking for CTAs
// TODO: Add A/B testing framework for headline variations

export default function LandingPage() {
  const [expandedFaqIndex, setExpandedFaqIndex] = useState<number | null>(null);
  const { ref: trustRef, inView: trustInView } = useInView({ threshold: 0.1, triggerOnce: true });
  const { ref: calcRef, inView: calcInView } = useInView({ threshold: 0.1, triggerOnce: true });
  const { ref: faqRef, inView: faqInView } = useInView({ threshold: 0.1, triggerOnce: true });
  const { ref: ctaRef, inView: ctaInView } = useInView({ threshold: 0.1, triggerOnce: true });

  // Map icons for benefits grid using imported content
  const benefits = benefitsContent.map(benefit => ({
    ...benefit,
    icon: benefit.iconName === "FaShieldAlt" ? <FaShieldAlt className="text-4xl" /> :
          benefit.iconName === "FaDollarSign" ? <FaDollarSign className="text-4xl" /> :
          benefit.iconName === "FaClock" ? <FaClock className="text-4xl" /> :
          benefit.iconName === "FaFileAlt" ? <FaFileAlt className="text-4xl" /> :
          benefit.iconName === "FaCheckCircle" ? <FaCheckCircle className="text-4xl" /> :
          <FaLock className="text-4xl" />
  }));

  // Map icons for process steps using imported content
  const processStepsWithIcons = processSteps.map(step => ({
    ...step,
    icon: step.iconName === "FaCalculator" ? <FaCalculator className="text-3xl" /> :
          step.iconName === "FaFileSignature" ? <FaFileSignature className="text-3xl" /> :
          <FaDownload className="text-3xl" />
  }));

  // Use only the first 4 pricing tiers for the preview
  const pricingTiers = pricingContent.tiers.slice(0, 4).map(tier => ({
    tier: tier.tier,
    range: tier.creditRange,
    price: tier.price,
    example: tier.example,
    highlighted: tier.highlighted
  }));

  // Use top 5 FAQs from imported content
  const faqItems = faqContent.slice(0, 5);

  // Conversion optimization point: Scroll to calculator
  const scrollToCalculator = () => {
    document.getElementById("calculator-section")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-white">
      {/* SEO Meta Tags */}
      <MetaTags />
      
      {/* Responsive Navigation Component */}
      <ResponsiveNav />

      {/* Responsive Hero Section */}
      <ResponsiveHero />

      {/* Trust Signals Bar - Responsive with animation */}
      <motion.section 
        ref={trustRef}
        initial={{ opacity: 0, y: 20 }}
        animate={trustInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6 }}
        className="bg-gray-100 border-y border-gray-200 py-6"
      >
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={trustInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="flex items-center justify-center gap-3"
            >
              <FaShieldAlt className="text-green-600 text-xl sm:text-2xl" />
              <span className="text-sm sm:text-base text-gray-700 font-medium">IRS Section 41 Compliant</span>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={trustInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex items-center justify-center gap-3"
            >
              <FaLock className="text-green-600 text-xl sm:text-2xl" />
              <span className="text-sm sm:text-base text-gray-700 font-medium">256-bit SSL Encrypted</span>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={trustInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex items-center justify-center gap-3"
            >
              <FaCheckCircle className="text-green-600 text-xl sm:text-2xl" />
              <span className="text-sm sm:text-base text-gray-700 font-medium">CPA-Approved Documentation</span>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Benefits/Features Grid - Using Responsive Component */}
      <section className="py-12 sm:py-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-8 sm:mb-12"
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
              Why businesses using AI choose us
            </h2>
            <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
              We understand AI experimentation—from ChatGPT prompts to custom automations
            </p>
          </motion.div>

          <BenefitsGrid benefits={benefits} />
        </div>
      </section>

      {/* How It Works Section - Using Responsive Component */}
      <section id="how-it-works" className="py-12 sm:py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-8 sm:mb-12"
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
              How we turn your AI work into tax savings
            </h2>
            <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
              A simple 3-step process that starts with your AI story
            </p>
          </motion.div>

          <ProcessStepsGrid steps={processStepsWithIcons} />
        </div>
      </section>

      {/* Interactive Calculator Preview Section - Responsive */}
      <section id="calculator-section" className="py-12 sm:py-16">
        <div className="container mx-auto px-4">
          <motion.div
            ref={calcRef}
            initial={{ opacity: 0, y: 20 }}
            animate={calcInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="text-center mb-8 sm:mb-12"
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
              Calculate what your AI experiments may be worth
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-600">
              Quick calculator for businesses using ChatGPT, Claude, and other AI tools
            </p>
          </motion.div>

          {/* Interactive Calculator Component */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={calcInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <InteractiveCalculator />
          </motion.div>
        </div>
      </section>

      {/* Pricing Preview Section - Using Responsive Component */}
      <section id="pricing" className="py-12 sm:py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-8 sm:mb-12"
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
              {pricingContent.headline}
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-600">
              {pricingContent.subheadline}
            </p>
          </motion.div>

          <PricingGrid tiers={pricingTiers} />

          <div className="text-center mt-8">
            <p className="text-sm sm:text-base text-gray-600 mb-4">
              {pricingContent.additionalYear.description}: {pricingContent.additionalYear.price}. Federal documentation included in all tiers.
            </p>
            <a href="/pricing" className="text-green-600 hover:text-green-700 font-medium inline-flex items-center gap-2">
              View all 7 pricing tiers 
              <FaChevronRight className="w-4 h-4" />
            </a>
            
            {/* Pricing comparison callout */}
            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg max-w-md mx-auto">
              <p className="text-sm font-semibold text-green-800">
                {pricingContent.comparison.title}
              </p>
              <p className="text-sm text-green-700 mt-1">
                Consultants: {pricingContent.comparison.competitorPrice} • 
                Us: {pricingContent.comparison.ourPrice} • 
                <span className="font-bold">{pricingContent.comparison.savings}</span>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Preview Section - Responsive */}
      <section id="faq" className="py-12 sm:py-16">
        <div className="container mx-auto px-4">
          <motion.div
            ref={faqRef}
            initial={{ opacity: 0, y: 20 }}
            animate={faqInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="text-center mb-8 sm:mb-12"
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
              Common Questions
            </h2>
            <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
              Get answers to frequently asked questions about R&D tax credits
            </p>
          </motion.div>

          <div className="max-w-3xl mx-auto space-y-3 sm:space-y-4">
            {faqItems.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={faqInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
              >
                <button
                  className="w-full px-4 sm:px-6 py-3 sm:py-4 text-left flex justify-between items-center 
                           hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 
                           focus:ring-green-500 rounded-lg"
                  onClick={() => setExpandedFaqIndex(expandedFaqIndex === index ? null : index)}
                  aria-expanded={expandedFaqIndex === index}
                  aria-controls={`faq-answer-${index}`}
                >
                  <span className="font-semibold text-gray-900 text-sm sm:text-base pr-2">
                    {item.question}
                  </span>
                  <FaChevronDown 
                    className={`text-gray-500 transition-transform flex-shrink-0 ${
                      expandedFaqIndex === index ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {expandedFaqIndex === index && (
                  <motion.div 
                    id={`faq-answer-${index}`} 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="px-4 sm:px-6 pb-3 sm:pb-4"
                  >
                    <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                      {item.answer}
                    </p>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-8">
            <a href="/faq" className="text-green-600 hover:text-green-700 font-medium inline-flex items-center gap-2">
              View all FAQs 
              <FaChevronRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </section>

      {/* Important Compliance Information Section */}
      <section className="py-12 sm:py-16 bg-amber-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-8 text-center">
              Important Information for Tax Year {new Date().getFullYear()}
            </h2>
            
            {/* Section 174 Warning */}
            <div className="mb-6 p-6 bg-white border-2 border-amber-300 rounded-lg shadow-md">
              <div className="flex items-start gap-3">
                <span className="text-2xl">⚠️</span>
                <div>
                  <h3 className="font-bold text-lg text-gray-900 mb-2">Section 174 Capitalization Requirement</h3>
                  <p className="text-gray-700 mb-3">
                    <strong>For tax years 2022-2025,</strong> R&D expenses must be capitalized and amortized over 5 years 
                    (domestic) or 15 years (foreign) instead of immediate expensing. This significantly impacts cash flow 
                    even with the R&D credit.
                  </p>
                  <p className="text-sm text-gray-600">
                    Consult your tax professional about how this impacts your specific situation.
                  </p>
                </div>
              </div>
            </div>

            {/* Startup Payroll Offset */}
            <div className="mb-6 p-6 bg-white border-2 border-green-300 rounded-lg shadow-md">
              <div className="flex items-start gap-3">
                <span className="text-2xl">🚀</span>
                <div>
                  <h3 className="font-bold text-lg text-gray-900 mb-2">Startup Payroll Tax Offset</h3>
                  <p className="text-gray-700 mb-3">
                    Qualifying startups (less than 5 years old with under $5M in gross receipts) may use up to 
                    <strong> $500,000</strong> of R&D credits to offset payroll taxes instead of income tax.
                  </p>
                  <p className="text-sm text-gray-600">
                    This provides immediate cash flow benefits even for pre-revenue companies.
                  </p>
                </div>
              </div>
            </div>

            {/* IRS Four-Part Test */}
            <div className="mb-6 p-6 bg-white border-2 border-blue-300 rounded-lg shadow-md">
              <h3 className="font-bold text-lg text-gray-900 mb-4">IRS Four-Part Test for R&D Credits</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold">1.</span>
                  <div>
                    <strong className="text-gray-900">Technological in Nature</strong>
                    <p className="text-sm text-gray-600">Relies on computer science or engineering</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold">2.</span>
                  <div>
                    <strong className="text-gray-900">Elimination of Uncertainty</strong>
                    <p className="text-sm text-gray-600">Addresses technical challenges</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold">3.</span>
                  <div>
                    <strong className="text-gray-900">Process of Experimentation</strong>
                    <p className="text-sm text-gray-600">Involves testing and iteration</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold">4.</span>
                  <div>
                    <strong className="text-gray-900">Business Component</strong>
                    <p className="text-sm text-gray-600">Creates new or improved functionality</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Required Disclaimer */}
            <div className="p-6 bg-gray-100 border border-gray-300 rounded-lg">
              <p className="text-sm text-gray-700 text-center">
                <strong>Important Disclaimer:</strong> This tool provides estimates based on current federal tax law. 
                Actual credits depend on your specific circumstances and IRS examination. SMBTaxCredits.com provides 
                documentation services only and does not offer tax advice. Always consult a qualified tax professional 
                before claiming credits.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section - Responsive Conversion optimization point */}
      <section className="py-12 sm:py-16 bg-gradient-to-r from-green-600 to-blue-600">
        <div className="container mx-auto px-4">
          <motion.div
            ref={ctaRef}
            initial={{ opacity: 0, y: 20 }}
            animate={ctaInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3 sm:mb-4">
              {HeroContent.headline.replace("—", "?")}
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-white/90 mb-6 sm:mb-8 max-w-2xl mx-auto">
              Join thousands of SMBs who've simplified their R&D tax credit claims
            </p>
            <button
              onClick={scrollToCalculator}
              className="bg-white text-green-600 px-6 sm:px-8 py-3 sm:py-4 rounded-lg 
                       text-base sm:text-lg font-semibold hover:bg-gray-100 
                       transition-all transform hover:scale-105 
                       focus:outline-none focus:ring-4 focus:ring-white/50
                       shadow-lg"
              aria-label="Start Your Free Estimate"
            >
              {HeroContent.primaryCTA}
            </button>
            <p className="text-xs sm:text-sm text-white/80 mt-4">
              No credit card required. Get your estimate in 2 minutes.
            </p>

            {/* Trust indicators for final conversion */}
            <div className="mt-8 flex flex-wrap justify-center gap-4 sm:gap-6 text-white/90">
              <span className="flex items-center gap-2 text-sm">
                <FaCheckCircle /> IRS Compliant
              </span>
              <span className="flex items-center gap-2 text-sm">
                <FaLock /> Secure & Encrypted
              </span>
              <span className="flex items-center gap-2 text-sm">
                <FaShieldAlt /> Money-Back Guarantee
              </span>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}