/**
 * @file ResponsiveNav.tsx
 * @description Mobile-first responsive navigation with hamburger menu
 * @author SMBTaxCredits.com Team
 * @knowledgeBase rd-saas-replit-guide.md - Mobile navigation requirements
 */

import { useState, useEffect } from 'react';
import { FaBars, FaTimes, FaChevronDown } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'wouter';

interface ResponsiveNavProps {
  onStartEstimate?: () => void;
}

const ResponsiveNav: React.FC<ResponsiveNavProps> = ({ onStartEstimate }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [resourcesOpen, setResourcesOpen] = useState(false);

  // Handle scroll for navbar background
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleStartEstimate = () => {
    setIsOpen(false);
    if (onStartEstimate) {
      onStartEstimate();
    } else {
      document.getElementById("calculator-section")?.scrollIntoView({ behavior: "smooth" });
    }
  };

  const navLinks = [
    { href: "/how-it-works", label: "How It Works", external: false },
    { href: "/pricing", label: "Pricing", external: false },
    { href: "/faq", label: "FAQ", external: false },
    { href: "/support", label: "Support", external: false },
  ];

  const resourceLinks = [
    { href: "/rd-credit-guide", label: "R&D Credit Guide" },
    { href: "/qualifying-activities", label: "Qualifying Activities" },
    { href: "/sample-documents", label: "Sample Documents" },
    { href: "/blog", label: "Blog" },
  ];

  return (
    <nav className={`
      fixed top-0 left-0 right-0 z-50 transition-all duration-300
      bg-white ${scrolled ? 'shadow-md' : 'shadow-sm'}
    `}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <div className="flex-shrink-0">
            <a href="/" className="text-xl sm:text-2xl font-bold text-secondary">
              SMBTaxCredits.com
            </a>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link 
                key={link.href}
                href={link.href} 
                className="text-heading hover:text-secondary transition font-medium"
              >
                {link.label}
              </Link>
            ))}
            
            {/* Resources Dropdown */}
            <div className="relative">
              <button
                onClick={() => setResourcesOpen(!resourcesOpen)}
                onMouseEnter={() => setResourcesOpen(true)}
                onMouseLeave={() => setResourcesOpen(false)}
                className="flex items-center gap-1 text-heading hover:text-secondary transition font-medium"
              >
                Resources
                <FaChevronDown className={`text-xs transition-transform ${resourcesOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {resourcesOpen && (
                <div 
                  className="absolute top-full left-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50"
                  onMouseEnter={() => setResourcesOpen(true)}
                  onMouseLeave={() => setResourcesOpen(false)}
                >
                  {resourceLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="block px-4 py-2 text-sm text-heading hover:bg-secondary-light hover:text-secondary transition"
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
            
            <button 
              onClick={handleStartEstimate}
              className="btn-primary"
            >
              Start Your Estimate
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden p-2 rounded-md text-heading hover:bg-gray-100 
                     focus:outline-none focus:ring-2 focus:ring-secondary
                     transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
            aria-label={isOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={isOpen}
          >
            {isOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
              aria-hidden="true"
            />

            {/* Slide-in Menu */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="lg:hidden fixed right-0 top-0 bottom-0 w-80 max-w-[85%] 
                       bg-white shadow-xl z-50 overflow-y-auto"
              role="dialog"
              aria-modal="true"
              aria-label="Navigation menu"
            >
              <div className="p-6">
                <button
                  onClick={() => setIsOpen(false)}
                  className="absolute top-6 right-6 p-2 rounded-md hover:bg-gray-100
                           min-w-[44px] min-h-[44px] flex items-center justify-center
                           focus:outline-none focus:ring-2 focus:ring-green-600"
                  aria-label="Close menu"
                >
                  <FaTimes size={24} />
                </button>

                <div className="mt-12 space-y-6">
                  {navLinks.map((link) => (
                    <Link 
                      key={link.href}
                      href={link.href} 
                      onClick={() => setIsOpen(false)}
                      className="block text-lg font-medium text-gray-900 hover:text-green-600
                               py-2 transition-colors"
                    >
                      {link.label}
                    </Link>
                  ))}
                  
                  {/* Resources Section */}
                  <div className="border-t border-gray-200 pt-4">
                    <p className="text-sm font-semibold text-gray-500 uppercase mb-3">Resources</p>
                    {resourceLinks.map((link) => (
                      <Link 
                        key={link.href}
                        href={link.href} 
                        onClick={() => setIsOpen(false)}
                        className="block text-lg font-medium text-gray-900 hover:text-green-600
                                 py-2 transition-colors"
                      >
                        {link.label}
                      </Link>
                    ))}
                  </div>
                  
                  <button 
                    onClick={handleStartEstimate}
                    className="w-full bg-green-600 text-white py-3 rounded-lg 
                             hover:bg-green-700 transition-all transform hover:scale-105
                             focus:outline-none focus:ring-2 focus:ring-green-500 mt-8
                             text-lg font-semibold"
                  >
                    Start Your Estimate
                  </button>
                </div>

                {/* Trust Badges in Mobile Menu */}
                <div className="mt-12 pt-8 border-t border-gray-200">
                  <p className="text-sm text-gray-500 text-center">
                    IRS Section 41 Compliant
                  </p>
                  <p className="text-sm text-gray-500 text-center mt-2">
                    256-bit SSL Encrypted
                  </p>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default ResponsiveNav;