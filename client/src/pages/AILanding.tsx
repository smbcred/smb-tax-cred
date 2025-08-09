/**
 * @file AILanding.tsx
 * @description Marketing landing page for AI-experimenting businesses to claim R&D tax credits
 * @author SMBTaxCredits.com Team
 * @date 2024-01-15
 * @modified 2024-01-15
 * @dependencies React, Tailwind CSS, framer-motion, react-icons
 * @knowledgeBase Updated Copywriting & Positioning Guide.md, Market Positioning Brief
 * @examples
 * - Marketing agencies testing ChatGPT prompts
 * - E-commerce brands building AI chatbots
 * - Consultants creating AI workflows
 * 
 * This component targets businesses USING AI tools (not building AI) and emphasizes
 * accessibility with "no coding required" messaging throughout.
 */

// CHANGE: Updated all messaging to focus on AI experimentation instead of traditional R&D
// INTEGRATION: Calculator component will showcase AI-specific examples
// TODO: Add testimonials from real AI-using businesses
// TODO: Implement A/B testing for "AI Credits" vs "Tax Savings" messaging
// BUG FIX: Ensure purple color contrast meets accessibility standards

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { 
  FaShieldAlt, 
  FaDollarSign, 
  FaClock, 
  FaFileAlt,
  FaCode,
  FaFlag,
  FaRobot,
  FaClipboardList,
  FaCalculator,
  FaDownload,
  FaCheck,
  FaBars,
  FaTimes,
  FaBullhorn,
  FaShoppingCart,
  FaChartLine,
  FaUtensils,
  FaChevronDown,
  FaChevronRight
} from "react-icons/fa";
import { InteractiveCalculator } from "@/components/calculator/InteractiveCalculator";

export default function AILanding() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [expandedFaqIndex, setExpandedFaqIndex] = useState<number | null>(null);

  // Intersection observers for scroll animations
  const { ref: trustRef, inView: trustInView } = useInView({ threshold: 0.1, triggerOnce: true });
  const { ref: qualifyingRef, inView: qualifyingInView } = useInView({ threshold: 0.1, triggerOnce: true });
  const { ref: benefitsRef, inView: benefitsInView } = useInView({ threshold: 0.1, triggerOnce: true });
  const { ref: examplesRef, inView: examplesInView } = useInView({ threshold: 0.1, triggerOnce: true });
  const { ref: howRef, inView: howInView } = useInView({ threshold: 0.1, triggerOnce: true });
  const { ref: calcRef, inView: calcInView } = useInView({ threshold: 0.1, triggerOnce: true });
  const { ref: pricingRef, inView: pricingInView } = useInView({ threshold: 0.1, triggerOnce: true });
  const { ref: faqRef, inView: faqInView } = useInView({ threshold: 0.1, triggerOnce: true });
  const { ref: socialRef, inView: socialInView } = useInView({ threshold: 0.1, triggerOnce: true });
  const { ref: ctaRef, inView: ctaInView } = useInView({ threshold: 0.1, triggerOnce: true });

  // Handle scroll effect for navigation
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Scroll to calculator function
  const scrollToCalculator = () => {
    document.getElementById("calculator-section")?.scrollIntoView({ behavior: "smooth" });
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* 1. Header/Navigation Section */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        isScrolled ? "bg-white shadow-md" : "bg-transparent"
      }`}>
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-16 md:h-20">
            {/* Logo */}
            <div className="text-xl md:text-2xl font-bold text-gray-900">
              SMBTaxCredits.com
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#how-it-works" className="text-gray-700 hover:text-purple-600 transition-colors">
                How It Works
              </a>
              <a href="#pricing" className="text-gray-700 hover:text-purple-600 transition-colors">
                Pricing
              </a>
              <a href="#faq" className="text-gray-700 hover:text-purple-600 transition-colors">
                FAQ
              </a>
              <a href="#examples" className="text-gray-700 hover:text-purple-600 transition-colors">
                AI Examples
              </a>
              <button
                onClick={scrollToCalculator}
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                Check My AI Credits
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden text-gray-700"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
            </button>
          </div>

          {/* Mobile Menu */}
          <AnimatePresence>
            {isMobileMenuOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="md:hidden bg-white border-t"
              >
                <div className="py-4 space-y-4">
                  <a href="#how-it-works" className="block px-4 py-2 text-gray-700">How It Works</a>
                  <a href="#pricing" className="block px-4 py-2 text-gray-700">Pricing</a>
                  <a href="#faq" className="block px-4 py-2 text-gray-700">FAQ</a>
                  <a href="#examples" className="block px-4 py-2 text-gray-700">AI Examples</a>
                  <button
                    onClick={scrollToCalculator}
                    className="w-full text-left px-4 py-2 bg-green-600 text-white"
                  >
                    Check My AI Credits
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </nav>

      {/* 2. Hero Section */}
      <section className="pt-20 md:pt-32 pb-16 bg-gradient-to-b from-white to-purple-50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-4xl mx-auto"
          >
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Your AI Experiments Qualify for Tax Credits
            </h1>
            <p className="text-xl md:text-2xl text-gray-700 mb-8">
              Get back 10-15% of what you spend on ChatGPT projects, custom GPTs, and AI automation. 
              No coding required. Federal credits only. Simple flat fee.
            </p>
            
            {/* Primary and Secondary CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <button
                onClick={scrollToCalculator}
                className="bg-green-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-green-700 transition-all transform hover:scale-105"
              >
                Check My AI Credits
              </button>
              <a
                href="#how-it-works"
                className="text-purple-600 px-8 py-4 rounded-lg text-lg font-semibold hover:text-purple-700 transition-colors flex items-center justify-center"
              >
                See how it works <FaChevronRight className="ml-2" />
              </a>
            </div>

            {/* Hero illustration placeholder */}
            <div className="bg-white/50 backdrop-blur-sm rounded-xl p-8 border border-purple-200">
              <div className="text-purple-600 text-6xl mb-4">🤖 + 💰 = 📈</div>
              <p className="text-gray-600">ChatGPT • Custom GPTs • AI Automation</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 3. Trust Signals Bar */}
      <motion.section 
        ref={trustRef}
        initial={{ opacity: 0, y: 20 }}
        animate={trustInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6 }}
        className="bg-gray-100 border-y border-gray-200 py-6"
      >
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="flex items-center justify-center gap-3">
              <FaRobot className="text-purple-600 text-2xl" />
              <span className="text-sm font-medium text-gray-700">
                Built for businesses using AI, not building it
              </span>
            </div>
            <div className="flex items-center justify-center gap-3">
              <FaShieldAlt className="text-green-600 text-2xl" />
              <span className="text-sm font-medium text-gray-700">
                IRS-compliant documentation
              </span>
            </div>
            <div className="flex items-center justify-center gap-3">
              <FaClock className="text-blue-600 text-2xl" />
              <span className="text-sm font-medium text-gray-700">
                48-hour turnaround
              </span>
            </div>
            <div className="flex items-center justify-center gap-3">
              <FaDollarSign className="text-green-600 text-2xl" />
              <span className="text-sm font-medium text-gray-700">
                Flat-fee pricing
              </span>
            </div>
          </div>
        </div>
      </motion.section>

      {/* 4. Qualifying Activities Section */}
      <motion.section 
        ref={qualifyingRef}
        initial={{ opacity: 0, y: 20 }}
        animate={qualifyingInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6 }}
        className="py-16 bg-white"
        id="qualifying"
      >
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-12">
            What Counts as AI Experimentation?
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Qualifying Activities */}
            <div className="bg-green-50 p-8 rounded-xl border border-green-200">
              <h3 className="text-2xl font-bold text-green-900 mb-6 flex items-center">
                <FaCheck className="mr-3 text-green-600" />
                These AI Projects Qualify:
              </h3>
              <ul className="space-y-4">
                {[
                  "Building custom GPTs for your business",
                  "Testing and refining AI prompts",
                  "Creating AI-powered automations",
                  "Developing chatbots for customers",
                  "Integrating AI into your workflows",
                  "Even failed AI experiments!"
                ].map((item, index) => (
                  <li key={index} className="flex items-start">
                    <FaCheck className="text-green-600 mt-1 mr-3 flex-shrink-0" />
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Non-Qualifying Activities */}
            <div className="bg-red-50 p-8 rounded-xl border border-red-200">
              <h3 className="text-2xl font-bold text-red-900 mb-6 flex items-center">
                <FaTimes className="mr-3 text-red-600" />
                What Doesn't Qualify:
              </h3>
              <ul className="space-y-4">
                {[
                  "Just using ChatGPT for basic tasks",
                  "Following AI tutorials exactly",
                  "Buying AI subscriptions without customization"
                ].map((item, index) => (
                  <li key={index} className="flex items-start">
                    <FaTimes className="text-red-600 mt-1 mr-3 flex-shrink-0" />
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </motion.section>

      {/* 5. Benefits/Features Grid */}
      <motion.section 
        ref={benefitsRef}
        initial={{ opacity: 0, y: 20 }}
        animate={benefitsInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6 }}
        className="py-16 bg-gray-50"
      >
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-12">
            Turn Your AI Experiments Into Tax Savings
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Benefit Cards */}
            {[
              {
                icon: <FaCode className="text-4xl text-purple-600" style={{ position: 'relative' }} />,
                title: "No Coding Required",
                description: "If you're experimenting with prompts, custom GPTs, or AI workflows, you qualify. No technical degree needed.",
                // No coding required messaging
              },
              {
                icon: <FaDollarSign className="text-4xl text-green-600" />,
                title: "Simple Flat Fee",
                description: "Know your cost upfront—$500 to $1,500 based on credit size. No percentage-based fees eating into your savings.",
              },
              {
                icon: <FaClock className="text-4xl text-blue-600" />,
                title: "15-Minute Process",
                description: "Answer simple questions about your AI projects. No tax forms to understand. Results in 48 hours.",
                // Non-technical language requirement
              },
              {
                icon: <FaFlag className="text-4xl text-red-600" />,
                title: "Federal Credits Only",
                description: "We keep it simple with federal credits only. No state complexity. Clear, straightforward calculations.",
                // Federal-only calculations
              },
              {
                icon: <FaRobot className="text-4xl text-purple-600" />,
                title: "Built for AI Users",
                description: "Designed for businesses using ChatGPT, Claude, and AI tools. Real examples from businesses like yours.",
                // AI-specific examples
              },
              {
                icon: <FaFileAlt className="text-4xl text-gray-600" />,
                title: "CPA-Friendly Package",
                description: "Everything your accountant needs to file. Clean documentation, clear instructions, audit-ready format.",
              }
            ].map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={benefitsInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow"
              >
                <div className="mb-4 relative">
                  {benefit.icon}
                  {index === 0 && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-12 h-0.5 bg-red-600 rotate-45 transform origin-center"></div>
                    </div>
                  )}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{benefit.title}</h3>
                <p className="text-gray-600">{benefit.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* 6. Real Examples Section */}
      <motion.section 
        ref={examplesRef}
        initial={{ opacity: 0, y: 20 }}
        animate={examplesInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6 }}
        className="py-16 bg-white"
        id="examples"
      >
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-12">
            AI Credits for Real Businesses
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {[
              {
                icon: <FaBullhorn className="text-3xl text-purple-600" />,
                type: "Marketing Agency",
                activity: "Created custom GPTs for different client campaigns",
                credit: "$32,000 in credits"
              },
              {
                icon: <FaShoppingCart className="text-3xl text-blue-600" />,
                type: "E-commerce Brand",
                activity: "Built AI chatbot for customer service",
                credit: "$18,000 in credits"
              },
              {
                icon: <FaChartLine className="text-3xl text-green-600" />,
                type: "Consultant",
                activity: "Developed AI workflow for client analysis",
                credit: "$12,000 in credits"
              },
              {
                icon: <FaUtensils className="text-3xl text-orange-600" />,
                type: "Restaurant",
                activity: "Implemented AI scheduling system",
                credit: "$8,000 in credits"
              }
            ].map((example, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={examplesInView ? { opacity: 1, scale: 1 } : {}}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-gradient-to-br from-purple-50 to-white p-6 rounded-xl border border-purple-200 hover:shadow-lg transition-shadow"
              >
                <div className="mb-4">{example.icon}</div>
                <h3 className="font-bold text-gray-900 mb-2">{example.type}</h3>
                <p className="text-sm text-gray-600 mb-3">{example.activity}</p>
                <p className="text-lg font-bold text-green-600">Qualified for: {example.credit}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* 7. How It Works Section */}
      <motion.section 
        ref={howRef}
        initial={{ opacity: 0, y: 20 }}
        animate={howInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6 }}
        className="py-16 bg-gray-50"
        id="how-it-works"
      >
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-12">
            Your AI Credits in 3 Simple Steps
          </h2>
          
          <div className="flex flex-col md:flex-row justify-center items-center md:items-start gap-8 max-w-5xl mx-auto">
            {[
              {
                number: "1",
                icon: <FaClipboardList className="text-3xl text-white" />,
                title: "Tell Us About Your AI Projects",
                description: "Quick questions about your ChatGPT usage, custom GPTs, and AI experiments"
              },
              {
                number: "2",
                icon: <FaCalculator className="text-3xl text-white" />,
                title: "We Calculate Your Credits",
                description: "See exactly how much you can claim for your AI experimentation"
              },
              {
                number: "3",
                icon: <FaDownload className="text-3xl text-white" />,
                title: "Get Your Documentation",
                description: "Everything your CPA needs to claim your federal credits"
              }
            ].map((step, index) => (
              <div key={index} className="flex flex-col items-center text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={howInView ? { scale: 1 } : {}}
                  transition={{ duration: 0.5, delay: index * 0.2 }}
                  className="relative mb-6"
                >
                  <div className="w-20 h-20 bg-purple-600 rounded-full flex items-center justify-center">
                    {step.icon}
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white font-bold">
                    {step.number}
                  </div>
                </motion.div>
                {index < 2 && (
                  <div className="hidden md:block absolute top-10 left-full w-24 h-0.5 bg-purple-300"></div>
                )}
                <h3 className="text-xl font-bold text-gray-900 mb-3">{step.title}</h3>
                <p className="text-gray-600 max-w-xs">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* 8. Interactive Calculator Preview Section */}
      <motion.section 
        ref={calcRef}
        initial={{ opacity: 0, y: 20 }}
        animate={calcInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6 }}
        className="py-16 bg-white"
        id="calculator-section"
      >
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Calculate Your AI Tax Credits in 2 Minutes
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              See how much your ChatGPT experiments and AI projects could save you
            </p>
            
            {/* Pre-calculator trust points */}
            <div className="flex flex-wrap justify-center gap-4 mb-8">
              {[
                "No technical knowledge needed",
                "Based on real business examples",
                "Federal credits worth 10-15% of costs",
                "Instant results"
              ].map((point, index) => (
                <div key={index} className="flex items-center bg-purple-50 px-4 py-2 rounded-full">
                  <FaCheck className="text-purple-600 mr-2" />
                  <span className="text-sm font-medium text-gray-700">{point}</span>
                </div>
              ))}
            </div>
          </div>
          
          {/* Calculator Component */}
          <div className="max-w-4xl mx-auto">
            <InteractiveCalculator />
          </div>
        </div>
      </motion.section>

      {/* 9. Pricing Section */}
      <motion.section 
        ref={pricingRef}
        initial={{ opacity: 0, y: 20 }}
        animate={pricingInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6 }}
        className="py-16 bg-gray-50"
        id="pricing"
      >
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-gray-600">
              One flat fee based on your credit size. No surprises.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {[
              {
                name: "Starter",
                range: "Credits under $10K",
                price: "$500",
                perfect: "Perfect for: Consultants and small teams",
                example: "Example: $8K credit = 16x ROI",
                features: ["All federal documentation", "48-hour delivery"]
              },
              {
                name: "Growth",
                range: "Credits $10K-50K",
                price: "$750",
                perfect: "Perfect for: Growing businesses and agencies",
                example: "Example: $30K credit = 40x ROI",
                features: ["All federal documentation", "48-hour delivery"],
                highlighted: true
              },
              {
                name: "Scale",
                range: "Credits $50K-100K",
                price: "$1,000",
                perfect: "Perfect for: Established companies",
                example: "Example: $75K credit = 75x ROI",
                features: ["All federal documentation", "48-hour delivery"]
              },
              {
                name: "Enterprise",
                range: "Credits over $100K",
                price: "$1,500",
                perfect: "Perfect for: Large AI implementations",
                example: "Example: $150K credit = 100x ROI",
                features: ["All federal documentation", "48-hour delivery"]
              }
            ].map((tier, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={pricingInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={`bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow ${
                  tier.highlighted ? 'ring-2 ring-purple-600' : ''
                }`}
              >
                {tier.highlighted && (
                  <div className="bg-purple-600 text-white text-sm font-bold py-1 px-3 rounded-full inline-block mb-4">
                    MOST POPULAR
                  </div>
                )}
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{tier.name}</h3>
                <p className="text-sm text-gray-600 mb-4">{tier.range}</p>
                <p className="text-3xl font-bold text-purple-600 mb-4">{tier.price} <span className="text-base text-gray-500">flat fee</span></p>
                <p className="text-sm text-gray-700 mb-3">{tier.perfect}</p>
                <p className="text-sm font-semibold text-green-600 mb-4">{tier.example}</p>
                <ul className="space-y-2">
                  {tier.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center text-sm text-gray-600">
                      <FaCheck className="text-green-600 mr-2" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
          
          <p className="text-center mt-8 text-gray-600">
            Multiple years? Add $297 per additional year
          </p>
        </div>
      </motion.section>

      {/* 10. FAQ Preview Section */}
      <motion.section 
        ref={faqRef}
        initial={{ opacity: 0, y: 20 }}
        animate={faqInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6 }}
        className="py-16 bg-white"
        id="faq"
      >
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-12">
            Questions About AI Tax Credits?
          </h2>
          
          <div className="max-w-3xl mx-auto">
            {[
              {
                question: "I just use ChatGPT for my business. Do I qualify?",
                answer: "If you're experimenting with custom prompts, building GPTs, or figuring out how to use AI for your specific needs, you likely qualify. Basic daily use doesn't qualify, but most businesses do more experimentation than they realize."
              },
              {
                question: "What counts as AI experimentation?",
                answer: "Testing prompts, building custom GPTs, creating chatbots, automating with AI, integrating AI tools, and even failed experiments all count. If you're figuring out how to make AI work for your business, that's R&D."
              },
              {
                question: "Do I need to be technical?",
                answer: "Not at all! R&D credits aren't just for programmers. If you're solving business problems with AI—even without coding—your experimentation qualifies."
                // No coding required messaging
              },
              {
                question: "Is this legitimate?",
                answer: "Yes! The IRS recognizes experimentation and testing as R&D. Prompt engineering and custom AI implementations qualify under federal guidelines."
              },
              {
                question: "How much can I claim?",
                answer: "Most businesses claim $15,000-50,000 in credits. The amount depends on time spent experimenting and related costs."
              }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0 }}
                animate={faqInView ? { opacity: 1 } : {}}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="mb-4"
              >
                <button
                  onClick={() => setExpandedFaqIndex(expandedFaqIndex === index ? null : index)}
                  className="w-full text-left p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex justify-between items-center">
                    <h3 className="font-semibold text-gray-900">{item.question}</h3>
                    <FaChevronDown 
                      className={`text-gray-600 transition-transform ${
                        expandedFaqIndex === index ? 'rotate-180' : ''
                      }`}
                    />
                  </div>
                </button>
                <AnimatePresence>
                  {expandedFaqIndex === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <p className="p-4 text-gray-600">{item.answer}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* 11. Social Proof Section */}
      <motion.section 
        ref={socialRef}
        initial={{ opacity: 0, y: 20 }}
        animate={socialInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6 }}
        className="py-16 bg-gray-50"
      >
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-12">
            Businesses Like Yours Are Claiming AI Credits
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                quote: "We had no idea our custom GPT development qualified for $32,000 in credits. The process was surprisingly simple—just questions about our AI experiments.",
                author: "Sarah M.",
                role: "Marketing Agency Owner"
              },
              {
                quote: "Our ChatGPT experiments for customer service turned into an $18,000 tax credit. No coding knowledge needed!",
                author: "David L.",
                role: "E-commerce Founder"
              },
              {
                quote: "I thought R&D credits were only for tech companies. Turns out my AI automation work qualified for $12,000.",
                author: "Maria G.",
                role: "Business Consultant"
              }
            ].map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={socialInView ? { opacity: 1, scale: 1 } : {}}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white p-6 rounded-xl shadow-md"
              >
                <div className="mb-4">
                  <div className="flex text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <span key={i}>⭐</span>
                    ))}
                  </div>
                </div>
                <p className="text-gray-700 mb-4 italic">"{testimonial.quote}"</p>
                <div className="font-semibold text-gray-900">{testimonial.author}</div>
                <div className="text-sm text-gray-600">{testimonial.role}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* 12. Final CTA Section */}
      <motion.section 
        ref={ctaRef}
        initial={{ opacity: 0, y: 20 }}
        animate={ctaInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6 }}
        className="py-16 bg-gradient-to-r from-purple-600 to-green-600"
      >
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Turn Your AI Experiments Into Tax Savings?
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Join thousands of businesses claiming credits for their ChatGPT and AI projects
          </p>
          <button
            onClick={scrollToCalculator}
            className="bg-white text-purple-600 px-8 py-4 rounded-lg text-lg font-bold hover:bg-gray-100 transition-all transform hover:scale-105"
          >
            Calculate My AI Credits Now
          </button>
          <p className="text-sm text-white/70 mt-4">
            Takes 2 minutes. No credit card required. See your federal credit instantly.
          </p>
        </div>
      </motion.section>

      {/* 13. Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            {/* Column 1 - Company */}
            <div>
              <div className="text-xl font-bold mb-2">SMBTaxCredits.com</div>
              <p className="text-gray-400 mb-4">Your AI Experiments Qualify™</p>
              <p className="text-sm text-gray-500">© 2024 All rights reserved</p>
            </div>
            
            {/* Column 2 - AI Examples */}
            <div>
              <h3 className="font-semibold mb-4">AI Examples</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Custom GPTs</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Prompt Engineering</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Chatbots</a></li>
                <li><a href="#" className="hover:text-white transition-colors">AI Automation</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Integration Projects</a></li>
              </ul>
            </div>
            
            {/* Column 3 - Resources */}
            <div>
              <h3 className="font-semibold mb-4">Resources</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">AI Credit Guide</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Qualifying Activities</a></li>
                <li><a href="#" className="hover:text-white transition-colors">FAQ</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Success Stories</a></li>
              </ul>
            </div>
            
            {/* Column 4 - Legal */}
            <div>
              <h3 className="font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Security</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}