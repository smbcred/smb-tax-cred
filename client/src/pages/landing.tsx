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

  // Business logic: Pricing tiers correspond to federal credit amounts
  // Tier assignment happens dynamically in the calculator component
  const pricingTiers = [
    { tier: "Tier 1", range: "Credits < $10K", price: "$500", example: "$8K credit = 16x ROI" },
    { tier: "Tier 2", range: "Credits $10K-$20K", price: "$750", example: "$15K credit = 20x ROI", highlighted: true },
    { tier: "Tier 3", range: "Credits $20K-$30K", price: "$1,000", example: "$25K credit = 25x ROI" },
    { tier: "Tier 4", range: "Credits $30K-$40K", price: "$1,250", example: "$35K credit = 28x ROI" },
  ];

  // Benefits data for grid
  const benefits = [
    {
      icon: <FaShieldAlt className="text-4xl" />,
      title: "IRS-Compliant by Design",
      description: "Section G project summaries, amended-claim exhibits, and complete audit trail included in every package."
    },
    {
      icon: <FaDollarSign className="text-4xl" />,
      title: "Flat-Fee Transparency",
      description: "No percentage cuts or hidden fees. Know your cost upfront based on your credit size."
    },
    {
      icon: <FaClock className="text-4xl" />,
      title: "Fast Turnaround",
      description: "Get your complete documentation package in days, not months. Most clients finish in 20 minutes."
    },
    {
      icon: <FaFileAlt className="text-4xl" />,
      title: "CPA-Friendly Outputs",
      description: "Clean handoff files your accountant needs: Form 6765 data, workpapers, and filing instructions."
    },
    {
      icon: <FaCheckCircle className="text-4xl" />,
      title: "Simple Process",
      description: "Plain-English questions guide you through the four-part test. No tax expertise required."
    },
    {
      icon: <FaLock className="text-4xl" />,
      title: "Secure & Confidential",
      description: "Bank-level encryption, minimal data collection, and automatic deletion after 90 days."
    }
  ];

  // Process steps data
  const processSteps = [
    {
      number: "1",
      icon: <FaCalculator className="text-3xl" />,
      title: "Estimate",
      description: "Answer a few questions to size your potential credit"
    },
    {
      number: "2",
      icon: <FaFileSignature className="text-3xl" />,
      title: "Document",
      description: "We turn your projects and costs into IRS-ready narratives and forms"
    },
    {
      number: "3",
      icon: <FaDownload className="text-3xl" />,
      title: "File",
      description: "Download your package and file with your CPA. Need payroll offset? We prep the 8974 data."
    }
  ];

  // All copy follows IRS-compliant messaging guidelines
  const faqItems = [
    {
      question: "Do I even qualify for the R&D credit?",
      answer: "If you develop software, use AI, create new products, or improve processes with technology, you likely qualify. Our calculator will help you confirm."
    },
    {
      question: "What if I'm not profitable yet?",
      answer: "Qualified Small Businesses can claim up to $500K against payroll taxes instead of income taxes. Perfect for startups and growth companies."
    },
    {
      question: "Can I claim credits for past years?",
      answer: "Yes! You can amend returns for 2022-2024. Each additional year is just $297."
    },
    {
      question: "Do you file my taxes?",
      answer: "No, we prepare all documentation and forms. You or your CPA files with our comprehensive package."
    },
    {
      question: "How long does this take?",
      answer: "Most users complete the intake in 15-20 minutes. Documents are ready within 24-48 hours."
    }
  ];

  // Conversion optimization point: Scroll to calculator
  const scrollToCalculator = () => {
    document.getElementById("calculator-section")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-white">
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
              Why SMBs Choose SMBTaxCredits.com
            </h2>
            <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
              Join thousands of businesses that trust us for their R&D tax credit documentation
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
              Your R&D Credit in 3 Simple Steps
            </h2>
            <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
              Our streamlined process gets you from estimate to filing in record time
            </p>
          </motion.div>

          <ProcessStepsGrid steps={processSteps} />
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
              Calculate Your R&D Tax Credit
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-600">
              See your potential federal credit in under 2 minutes
            </p>
          </motion.div>

          {/* Calculator component placeholder with blur effect - Mobile optimized */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={calcInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative max-w-4xl mx-auto"
          >
            <div className="bg-white rounded-lg shadow-xl p-4 sm:p-6 md:p-8 filter blur-sm">
              <div className="space-y-3 sm:space-y-4">
                <div className="h-10 sm:h-12 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-10 sm:h-12 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-10 sm:h-12 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-10 sm:h-12 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </div>
            <div className="absolute inset-0 flex items-center justify-center p-4">
              <div className="bg-white p-4 sm:p-6 rounded-lg shadow-2xl max-w-sm w-full">
                <p className="text-base sm:text-lg font-semibold text-gray-700 text-center">
                  Complete all steps to see your estimate
                </p>
                <button className="mt-4 w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors">
                  Start Calculator
                </button>
              </div>
            </div>
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
              Transparent, Flat-Fee Pricing
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-600">
              Keep more of your credit. No percentage cuts.
            </p>
          </motion.div>

          <PricingGrid tiers={pricingTiers} />

          <div className="text-center mt-8">
            <p className="text-sm sm:text-base text-gray-600 mb-4">
              Add another year: $297 per additional year. Federal documentation included in all tiers.
            </p>
            <a href="/pricing" className="text-green-600 hover:text-green-700 font-medium inline-flex items-center gap-2">
              View all 7 pricing tiers 
              <FaChevronRight className="w-4 h-4" />
            </a>
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

      {/* Final CTA Section - Responsive Conversion optimization point */}
      <section className="py-12 sm:py-16 bg-gradient-to-r from-green-600 to-blue-600">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            ref={ctaRef}
            initial={{ opacity: 0, y: 20 }}
            animate={ctaInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3 sm:mb-4">
              Ready to Claim Your R&D Credit?
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
              Start Your Free Estimate
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

      {/* Footer - Responsive */}
      <footer className="bg-gray-900 text-white py-8 sm:py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
            {/* Company Column */}
            <div className="col-span-2 md:col-span-1">
              <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">SMBTaxCredits.com</h3>
              <p className="text-sm text-gray-400 mb-3 sm:mb-4">Innovation deserves a refund</p>
              <p className="text-xs sm:text-sm text-gray-500">© 2024 SMBTaxCredits.com</p>
            </div>

            {/* Product Column */}
            <div>
              <h4 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Product</h4>
              <ul className="space-y-1 sm:space-y-2">
                <li><a href="/how-it-works" className="text-xs sm:text-sm text-gray-400 hover:text-white transition-colors">How It Works</a></li>
                <li><a href="/pricing" className="text-xs sm:text-sm text-gray-400 hover:text-white transition-colors">Pricing</a></li>
                <li><a href="/calculator" className="text-xs sm:text-sm text-gray-400 hover:text-white transition-colors">Calculator</a></li>
                <li><a href="/samples" className="text-xs sm:text-sm text-gray-400 hover:text-white transition-colors">Sample Documents</a></li>
              </ul>
            </div>

            {/* Resources Column */}
            <div>
              <h4 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Resources</h4>
              <ul className="space-y-1 sm:space-y-2">
                <li><a href="/guide" className="text-xs sm:text-sm text-gray-400 hover:text-white transition-colors">R&D Credit Guide</a></li>
                <li><a href="/activities" className="text-xs sm:text-sm text-gray-400 hover:text-white transition-colors">Qualifying Activities</a></li>
                <li><a href="/faq" className="text-xs sm:text-sm text-gray-400 hover:text-white transition-colors">FAQ</a></li>
                <li><a href="/blog" className="text-xs sm:text-sm text-gray-400 hover:text-white transition-colors">Blog</a></li>
              </ul>
            </div>

            {/* Legal Column */}
            <div>
              <h4 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Legal</h4>
              <ul className="space-y-1 sm:space-y-2">
                <li><a href="/privacy" className="text-xs sm:text-sm text-gray-400 hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="/terms" className="text-xs sm:text-sm text-gray-400 hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="/security" className="text-xs sm:text-sm text-gray-400 hover:text-white transition-colors">Security</a></li>
                <li><a href="/contact" className="text-xs sm:text-sm text-gray-400 hover:text-white transition-colors">Contact Us</a></li>
              </ul>
            </div>
          </div>

          {/* Mobile-friendly bottom bar */}
          <div className="mt-8 pt-8 border-t border-gray-800 text-center">
            <p className="text-xs text-gray-500">
              Built with ❤️ for small businesses everywhere
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}