import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { FaCalculator, FaCreditCard, FaFileAlt, FaDownload, FaCheckCircle, FaClock, FaShieldAlt } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Link } from "wouter";
import { Footer } from "@/components/layout/Footer";

const HowItWorks = () => {
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });

  const steps = [
    {
      number: "1",
      title: "Quick Estimate",
      subtitle: "2 minutes",
      description: "Use our AI-powered calculator to estimate your R&D tax credit based on your innovation activities.",
      icon: <FaCalculator className="w-8 h-8" />,
      details: [
        "Answer simple questions about your business",
        "Select your AI and innovation activities",
        "Enter basic expense information",
        "Get instant credit estimate"
      ],
      screenshot: "/assets/calculator-preview.png"
    },
    {
      number: "2",
      title: "Secure Payment",
      subtitle: "1 minute",
      description: "Choose your tier and complete payment through our secure Stripe checkout.",
      icon: <FaCreditCard className="w-8 h-8" />,
      details: [
        "Transparent flat-fee pricing",
        "No hidden costs or percentages",
        "Secure SSL encryption",
        "Immediate access to next step"
      ],
      screenshot: "/assets/payment-preview.png"
    },
    {
      number: "3",
      title: "Smart Intake",
      subtitle: "15-20 minutes",
      description: "Complete our guided intake form with your project details and qualifying expenses.",
      icon: <FaFileAlt className="w-8 h-8" />,
      details: [
        "Pre-filled with calculator data",
        "Smart suggestions and examples",
        "Save and resume anytime",
        "Upload supporting documents"
      ],
      screenshot: "/assets/intake-preview.png"
    },
    {
      number: "4",
      title: "Professional Documents",
      subtitle: "24-48 hours",
      description: "Receive your complete IRS-compliant documentation package ready for filing.",
      icon: <FaDownload className="w-8 h-8" />,
      details: [
        "Form 6765 (completed)",
        "Technical narratives (AI-generated)",
        "QRE calculation worksheets",
        "CPA-ready executive summary"
      ],
      screenshot: "/assets/documents-preview.png"
    }
  ];

  const trustSignals = [
    { icon: <FaShieldAlt />, text: "IRS Compliant", subtext: "Following Section 41 guidelines" },
    { icon: <FaCheckCircle />, text: "CPA Ready", subtext: "Accepted by tax professionals" },
    { icon: <FaClock />, text: "Fast Delivery", subtext: "Documents in 24-48 hours" }
  ];

  const examples = [
    {
      industry: "Marketing Agency",
      activity: "Testing ChatGPT Prompts",
      credit: "$15,000",
      description: "Developed custom prompt library for client campaigns"
    },
    {
      industry: "E-commerce Store", 
      activity: "Product Recommendations",
      credit: "$8,500",
      description: "Built AI-powered recommendation engine"
    },
    {
      industry: "Service Business",
      activity: "Customer Automation",
      credit: "$12,000",
      description: "Automated support with custom chatbot"
    }
  ];

  return (
    <div className="min-h-screen bg-cloud">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-blue-50 to-paper py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h1 className="text-4xl lg:text-5xl font-bold text-ink mb-6">
              Get Your R&D Tax Credits in <span className="text-blue-500">3 Simple Steps</span>
            </h1>
            <p className="text-xl text-ash max-w-3xl mx-auto mb-8">
              Turn your AI experimentation and innovation into valuable tax credits. 
              Our streamlined process takes you from estimate to IRS-ready documents in just 48 hours.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              {trustSignals.map((signal, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center bg-paper rounded-lg px-4 py-3 shadow-sm"
                >
                  <span className="text-emerald-500 mr-3">{signal.icon}</span>
                  <div className="text-left">
                    <p className="font-semibold text-ink text-sm">{signal.text}</p>
                    <p className="text-xs text-ash">{signal.subtext}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Process Timeline */}
      <section ref={ref} className="py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative">
            {/* Timeline Line - Desktop Only */}
            <div className="hidden lg:block absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-gradient-to-b from-blue-500 to-emerald-500"></div>
            
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                animate={inView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                className={`relative mb-12 lg:mb-24 ${
                  index % 2 === 0 ? 'lg:pr-[50%] lg:text-right' : 'lg:pl-[50%] lg:text-left'
                }`}
              >
                {/* Step Number Circle */}
                <div className={`absolute top-0 left-1/2 transform -translate-x-1/2 
                  w-16 h-16 bg-gradient-to-br from-blue-500 to-emerald-500 
                  rounded-full flex items-center justify-center text-paper 
                  font-bold text-xl shadow-lg z-10 
                  ${index % 2 === 0 ? 'lg:left-1/2' : 'lg:left-1/2'}`}>
                  {step.number}
                </div>
                
                {/* Content Card */}
                <Card className={`p-6 lg:p-8 mt-10 ${
                  index % 2 === 0 ? 'lg:mr-8' : 'lg:ml-8'
                }`}>
                  <div className={`flex items-start gap-4 mb-4 ${
                    index % 2 === 0 ? 'lg:flex-row-reverse' : ''
                  }`}>
                    <div className="text-blue-500">{step.icon}</div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-ink mb-1">{step.title}</h3>
                      <p className="text-sm text-emerald-600 font-semibold">{step.subtitle}</p>
                    </div>
                  </div>
                  
                  <p className="text-ash mb-4">{step.description}</p>
                  
                  <ul className="space-y-2 mb-4">
                    {step.details.map((detail, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <FaCheckCircle className="text-emerald-500 mt-1 flex-shrink-0" />
                        <span className="text-sm text-graphite">{detail}</span>
                      </li>
                    ))}
                  </ul>
                  
                  {index === 0 && (
                    <Link href="/#calculator">
                      <Button className="btn-primary">
                        Start Free Estimate
                      </Button>
                    </Link>
                  )}
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Real Examples Section */}
      <section className="bg-blue-50 py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-ink mb-4">
              Real AI Projects That Qualified
            </h2>
            <p className="text-lg text-ash">
              See how businesses like yours turned innovation into tax savings
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            {examples.map((example, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="p-6 h-full">
                  <div className="text-sm text-blue-600 font-semibold mb-2">
                    {example.industry}
                  </div>
                  <h4 className="text-xl font-bold text-ink mb-2">
                    {example.activity}
                  </h4>
                  <p className="text-3xl font-bold text-emerald-600 mb-3">
                    {example.credit}
                  </p>
                  <p className="text-sm text-ash">
                    {example.description}
                  </p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 lg:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-ink mb-12">
            Frequently Asked Questions
          </h2>
          
          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="font-semibold text-ink mb-2">
                How long does the entire process take?
              </h3>
              <p className="text-ash">
                Most clients complete everything in under 30 minutes of active time: 
                2 minutes for the calculator, 1 minute for payment, and 15-20 minutes 
                for the intake form. You'll receive your documents within 24-48 hours.
              </p>
            </Card>
            
            <Card className="p-6">
              <h3 className="font-semibold text-ink mb-2">
                What if I need to make changes after submitting?
              </h3>
              <p className="text-ash">
                You can request revisions within 30 days of receiving your documents. 
                Our team will update your documentation at no additional charge.
              </p>
            </Card>
            
            <Card className="p-6">
              <h3 className="font-semibold text-ink mb-2">
                Do you file the forms for me?
              </h3>
              <p className="text-ash">
                We provide all the completed forms and documentation you need. 
                You or your CPA will file them with your tax return. We provide 
                clear instructions and CPA guidance documents.
              </p>
            </Card>
          </div>
          
          <div className="text-center mt-8">
            <Link href="/faq">
              <Button variant="outline">
                View All FAQs
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-blue-500 to-emerald-500 py-16 lg:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-paper mb-4">
            Ready to Claim Your R&D Tax Credits?
          </h2>
          <p className="text-xl text-paper/90 mb-8">
            Join 500+ businesses that have saved thousands with our simple process
          </p>
          <Link href="/#calculator">
            <Button size="lg" className="bg-paper text-blue-600 hover:bg-cloud">
              Start Your Free Estimate
            </Button>
          </Link>
          <p className="text-sm text-paper/80 mt-4">
            No credit card required • Results in 2 minutes
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default HowItWorks;