import { Link } from "wouter";
import { FaTwitter, FaLinkedin, FaFacebook, FaEnvelope, FaPhone } from "react-icons/fa";

export const Footer = () => {
  const footerLinks = {
    product: [
      { name: "How It Works", href: "/how-it-works" },
      { name: "Pricing", href: "/pricing" },
      { name: "Sample Documents", href: "/sample-documents" },
      { name: "Start Free Estimate", href: "/#calculator" },
    ],
    resources: [
      { name: "R&D Credit Guide", href: "/guide" },
      { name: "Qualifying Activities", href: "/qualifying-activities" },
      { name: "FAQ", href: "/faq" },
      { name: "Blog", href: "/blog" },
    ],
    company: [
      { name: "About Us", href: "/about" },
      { name: "Contact", href: "/contact" },
      { name: "Privacy Policy", href: "/privacy" },
      { name: "Terms of Service", href: "/terms" },
    ],
    industries: [
      { name: "Marketing Agencies", href: "/industries/marketing" },
      { name: "E-commerce", href: "/industries/ecommerce" },
      { name: "Professional Services", href: "/industries/services" },
      { name: "Healthcare", href: "/industries/healthcare" },
    ],
  };

  return (
    <footer className="bg-graphite text-cloud">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Company Info */}
          <div className="lg:col-span-1">
            <h3 className="text-xl font-bold text-paper mb-4">R&D Tax Credit Pro</h3>
            <p className="text-sm text-cloud/80 mb-4">
              Simple, affordable R&D tax credit documentation for SMBs using AI and innovation.
            </p>
            <div className="flex space-x-4">
              <a href="https://twitter.com" className="text-cloud/60 hover:text-paper transition-colors">
                <FaTwitter className="w-5 h-5" />
              </a>
              <a href="https://linkedin.com" className="text-cloud/60 hover:text-paper transition-colors">
                <FaLinkedin className="w-5 h-5" />
              </a>
              <a href="https://facebook.com" className="text-cloud/60 hover:text-paper transition-colors">
                <FaFacebook className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h4 className="text-sm font-semibold text-paper mb-4 uppercase tracking-wider">Product</h4>
            <ul className="space-y-2">
              {footerLinks.product.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-cloud/80 hover:text-paper transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources Links */}
          <div>
            <h4 className="text-sm font-semibold text-paper mb-4 uppercase tracking-wider">Resources</h4>
            <ul className="space-y-2">
              {footerLinks.resources.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-cloud/80 hover:text-paper transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Industries */}
          <div>
            <h4 className="text-sm font-semibold text-paper mb-4 uppercase tracking-wider">Industries</h4>
            <ul className="space-y-2">
              {footerLinks.industries.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-cloud/80 hover:text-paper transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="text-sm font-semibold text-paper mb-4 uppercase tracking-wider">Company</h4>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-cloud/80 hover:text-paper transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-cloud/10">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-sm text-cloud/60">
              © 2025 R&D Tax Credit Pro. All rights reserved.
            </p>
            <div className="flex items-center space-x-6 text-sm text-cloud/60">
              <a href="mailto:support@rdtaxcreditpro.com" className="flex items-center hover:text-paper transition-colors">
                <FaEnvelope className="w-4 h-4 mr-2" />
                support@rdtaxcreditpro.com
              </a>
              <a href="tel:1-800-RD-CREDIT" className="flex items-center hover:text-paper transition-colors">
                <FaPhone className="w-4 h-4 mr-2" />
                1-800-RD-CREDIT
              </a>
            </div>
          </div>
          <div className="mt-4 text-xs text-cloud/40 text-center">
            <p>IRS Circular 230 Disclosure: To ensure compliance with requirements imposed by the IRS, we inform you that any U.S. federal tax advice contained in this communication is not intended or written to be used, and cannot be used, for the purpose of avoiding penalties under the Internal Revenue Code.</p>
          </div>
        </div>
      </div>
    </footer>
  );
};