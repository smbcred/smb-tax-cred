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

import { useState, useEffect } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
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
  FaBars,
  FaTimes,
  FaChevronDown,
  FaChevronRight
} from "react-icons/fa";
import { Link } from "wouter";

// INTEGRATION: Calculator component will be imported and embedded in section 6
// TODO: Connect interactive calculator component once built
// TODO: Implement Google Analytics event tracking for CTAs
// TODO: Add A/B testing framework for headline variations

export default function LandingPage() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [expandedFaqIndex, setExpandedFaqIndex] = useState<number | null>(null);
  
  const { scrollYProgress } = useScroll();
  const heroOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0.8]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Business logic: Pricing tiers correspond to federal credit amounts
  // Tier assignment happens dynamically in the calculator component
  const pricingTiers = [
    { tier: "Tier 1", range: "Credits < $10K", price: "$500", example: "$8K credit = 16x ROI" },
    { tier: "Tier 2", range: "Credits $10K-$20K", price: "$750", example: "$15K credit = 20x ROI" },
    { tier: "Tier 3", range: "Credits $20K-$30K", price: "$1,000", example: "$25K credit = 25x ROI" },
    { tier: "Tier 4", range: "Credits $30K-$40K", price: "$1,250", example: "$35K credit = 28x ROI" },
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
      {/* Header/Navigation Section - Sticky with transparency effect */}
      <header 
        className={`fixed top-0 w-full z-50 transition-all duration-300 ${
          isScrolled ? "bg-white shadow-md" : "bg-transparent"
        }`}
      >
        <nav className="container mx-auto px-4 py-4 flex justify-between items-center">
          {/* Logo placeholder - needs real asset */}
          <div className="text-2xl font-bold text-gray-900">
            SMBTaxCredits.com
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <a href="#how-it-works" className="text-gray-700 hover:text-green-600 transition-colors">
              How It Works
            </a>
            <a href="#pricing" className="text-gray-700 hover:text-green-600 transition-colors">
              Pricing
            </a>
            <a href="#faq" className="text-gray-700 hover:text-green-600 transition-colors">
              FAQ
            </a>
            <a href="#resources" className="text-gray-700 hover:text-green-600 transition-colors">
              Resources
            </a>
            <button
              onClick={scrollToCalculator}
              className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500"
              aria-label="Start Your Estimate"
            >
              Start Your Estimate
            </button>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden text-gray-700 focus:outline-none"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle mobile menu"
          >
            {isMobileMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
          </button>
        </nav>

        {/* Mobile Navigation - Mobile-specific consideration */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white border-t">
            <div className="container mx-auto px-4 py-4 space-y-4">
              <a href="#how-it-works" className="block text-gray-700 hover:text-green-600">
                How It Works
              </a>
              <a href="#pricing" className="block text-gray-700 hover:text-green-600">
                Pricing
              </a>
              <a href="#faq" className="block text-gray-700 hover:text-green-600">
                FAQ
              </a>
              <a href="#resources" className="block text-gray-700 hover:text-green-600">
                Resources
              </a>
              <button
                onClick={scrollToCalculator}
                className="w-full bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
              >
                Start Your Estimate
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Hero Section with parallax effect */}
      <motion.section 
        style={{ opacity: heroOpacity }}
        className="pt-20 md:pt-24 pb-16 bg-gradient-to-b from-white to-gray-50"
      >
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              {/* Copy that may need A/B testing */}
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                Claim your federal R&D tax credit—without the runaround.
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                Flat-fee, self-serve documentation for amended 2022–2024 and current 2025 filings—IRS-aligned and CPA-ready.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={scrollToCalculator}
                  className="bg-green-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500"
                  aria-label="Start your free estimate"
                >
                  Start your free estimate
                </button>
                <a 
                  href="#how-it-works"
                  className="text-blue-600 flex items-center justify-center gap-2 hover:text-blue-700 transition-colors"
                >
                  See how it works <FaChevronRight />
                </a>
              </div>
            </motion.div>

            {/* Hero image placeholder - needs real asset */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="hidden md:block"
            >
              <div className="bg-gradient-to-br from-blue-100 to-green-100 rounded-lg h-96 flex items-center justify-center">
                <p className="text-gray-500">Hero Illustration Placeholder</p>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Trust Signals Bar */}
      <section className="bg-gray-100 border-y border-gray-200 py-6">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center justify-center gap-3">
              <FaShieldAlt className="text-green-600 text-2xl" />
              <span className="text-gray-700 font-medium">IRS Section 41 Compliant</span>
            </div>
            <div className="flex items-center justify-center gap-3">
              <FaLock className="text-green-600 text-2xl" />
              <span className="text-gray-700 font-medium">256-bit SSL Encrypted</span>
            </div>
            <div className="flex items-center justify-center gap-3">
              <FaCheckCircle className="text-green-600 text-2xl" />
              <span className="text-gray-700 font-medium">CPA-Approved Documentation</span>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits/Features Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why SMBs Choose SMBTaxCredits.com
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: <FaShieldAlt className="text-4xl text-green-600" />,
                title: "IRS-Compliant by Design",
                description: "Section G project summaries, amended-claim exhibits, and complete audit trail included in every package."
              },
              {
                icon: <FaDollarSign className="text-4xl text-green-600" />,
                title: "Flat-Fee Transparency",
                description: "No percentage cuts or hidden fees. Know your cost upfront based on your credit size."
              },
              {
                icon: <FaClock className="text-4xl text-green-600" />,
                title: "Fast Turnaround",
                description: "Get your complete documentation package in days, not months. Most clients finish in 20 minutes."
              },
              {
                icon: <FaFileAlt className="text-4xl text-green-600" />,
                title: "CPA-Friendly Outputs",
                description: "Clean handoff files your accountant needs: Form 6765 data, workpapers, and filing instructions."
              },
              {
                icon: <FaCheckCircle className="text-4xl text-green-600" />,
                title: "Simple Process",
                description: "Plain-English questions guide you through the four-part test. No tax expertise required."
              },
              {
                icon: <FaLock className="text-4xl text-green-600" />,
                title: "Secure & Confidential",
                description: "Bank-level encryption, minimal data collection, and automatic deletion after 90 days."
              }
            ].map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow"
              >
                <div className="mb-4">{benefit.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {benefit.title}
                </h3>
                <p className="text-gray-600">
                  {benefit.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Your R&D Credit in 3 Simple Steps
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                number: "1",
                icon: <FaCalculator className="text-3xl text-white" />,
                title: "Estimate",
                description: "Answer a few questions to size your potential credit"
              },
              {
                number: "2",
                icon: <FaFileSignature className="text-3xl text-white" />,
                title: "Document",
                description: "We turn your projects and costs into IRS-ready narratives and forms"
              },
              {
                number: "3",
                icon: <FaDownload className="text-3xl text-white" />,
                title: "File",
                description: "Download your package and file with your CPA. Need payroll offset? We prep the 8974 data."
              }
            ].map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
                className="relative"
              >
                <div className="text-center">
                  <div className="w-20 h-20 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-3xl font-bold text-white">{step.number}</span>
                  </div>
                  <div className="bg-blue-600 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                    {step.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    {step.title}
                  </h3>
                  <p className="text-gray-600">
                    {step.description}
                  </p>
                </div>
                {index < 2 && (
                  <div className="hidden md:block absolute top-10 left-full w-full">
                    <div className="w-full h-0.5 bg-gray-300"></div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Interactive Calculator Preview Section */}
      <section id="calculator-section" className="py-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Calculate Your R&D Tax Credit
            </h2>
            <p className="text-xl text-gray-600">
              See your potential federal credit in under 2 minutes
            </p>
          </motion.div>

          {/* Calculator component placeholder with blur effect */}
          <div className="relative max-w-4xl mx-auto">
            <div className="bg-white rounded-lg shadow-xl p-8 filter blur-sm">
              <div className="space-y-4">
                <div className="h-12 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-12 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-12 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-12 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-white p-6 rounded-lg shadow-2xl">
                <p className="text-lg font-semibold text-gray-700">
                  Complete all steps to see your estimate
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Preview Section */}
      <section id="pricing" className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Transparent, Flat-Fee Pricing
            </h2>
            <p className="text-xl text-gray-600">
              Keep more of your credit. No percentage cuts.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {pricingTiers.map((tier, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {tier.tier}
                </h3>
                <p className="text-gray-600 mb-3">{tier.range}</p>
                <p className="text-3xl font-bold text-green-600 mb-3">{tier.price}</p>
                <p className="text-sm text-gray-500">{tier.example}</p>
              </motion.div>
            ))}
          </div>

          <div className="text-center">
            <p className="text-gray-600 mb-4">
              Add another year: $297 per additional year. Federal documentation included in all tiers.
            </p>
            <a href="/pricing" className="text-blue-600 hover:text-blue-700 font-medium">
              View all 7 pricing tiers →
            </a>
          </div>
        </div>
      </section>

      {/* FAQ Preview Section */}
      <section id="faq" className="py-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Common Questions
            </h2>
          </motion.div>

          <div className="max-w-3xl mx-auto space-y-4">
            {faqItems.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white rounded-lg shadow-md"
              >
                <button
                  className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500"
                  onClick={() => setExpandedFaqIndex(expandedFaqIndex === index ? null : index)}
                  aria-expanded={expandedFaqIndex === index}
                  aria-controls={`faq-answer-${index}`}
                >
                  <span className="font-semibold text-gray-900">{item.question}</span>
                  <FaChevronDown 
                    className={`text-gray-500 transition-transform ${
                      expandedFaqIndex === index ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {expandedFaqIndex === index && (
                  <div id={`faq-answer-${index}`} className="px-6 pb-4">
                    <p className="text-gray-600">{item.answer}</p>
                  </div>
                )}
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-8">
            <a href="/faq" className="text-blue-600 hover:text-blue-700 font-medium">
              View all FAQs →
            </a>
          </div>
        </div>
      </section>

      {/* Final CTA Section - Conversion optimization point */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-green-600">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to Claim Your R&D Credit?
            </h2>
            <p className="text-xl text-white/90 mb-8">
              Join thousands of SMBs who've simplified their R&D tax credit claims
            </p>
            <button
              onClick={scrollToCalculator}
              className="bg-white text-green-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-white"
              aria-label="Start Your Free Estimate"
            >
              Start Your Free Estimate
            </button>
            <p className="text-sm text-white/80 mt-4">
              No credit card required. Get your estimate in 2 minutes.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            {/* Company Column */}
            <div>
              <h3 className="text-xl font-bold mb-4">SMBTaxCredits.com</h3>
              <p className="text-gray-400 mb-4">Innovation deserves a refund</p>
              <p className="text-sm text-gray-500">© 2024 SMBTaxCredits.com</p>
            </div>

            {/* Product Column */}
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2">
                <li><a href="/how-it-works" className="text-gray-400 hover:text-white transition-colors">How It Works</a></li>
                <li><a href="/pricing" className="text-gray-400 hover:text-white transition-colors">Pricing</a></li>
                <li><a href="/calculator" className="text-gray-400 hover:text-white transition-colors">Calculator</a></li>
                <li><a href="/samples" className="text-gray-400 hover:text-white transition-colors">Sample Documents</a></li>
              </ul>
            </div>

            {/* Resources Column */}
            <div>
              <h4 className="font-semibold mb-4">Resources</h4>
              <ul className="space-y-2">
                <li><a href="/guide" className="text-gray-400 hover:text-white transition-colors">R&D Credit Guide</a></li>
                <li><a href="/activities" className="text-gray-400 hover:text-white transition-colors">Qualifying Activities</a></li>
                <li><a href="/faq" className="text-gray-400 hover:text-white transition-colors">FAQ</a></li>
                <li><a href="/blog" className="text-gray-400 hover:text-white transition-colors">Blog</a></li>
              </ul>
            </div>

            {/* Legal Column */}
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2">
                <li><a href="/privacy" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="/terms" className="text-gray-400 hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="/security" className="text-gray-400 hover:text-white transition-colors">Security</a></li>
                <li><a href="/contact" className="text-gray-400 hover:text-white transition-colors">Contact Us</a></li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}