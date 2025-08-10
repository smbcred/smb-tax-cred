import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { FaShoppingCart, FaRobot, FaChartBar, FaBoxes, FaCheckCircle, FaArrowRight } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Link } from "wouter";
import ResponsiveNav from "@/components/navigation/ResponsiveNav";
import { Footer } from "@/components/layout/Footer";

const Ecommerce = () => {
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });

  const qualifyingActivities = [
    {
      icon: <FaRobot className="w-6 h-6 text-emerald-600" />,
      title: "AI-Powered Personalization",
      description: "Developing recommendation engines and personalized shopping experiences",
      examples: [
        "Building AI product recommendation systems",
        "Testing personalized email campaigns",
        "Creating dynamic pricing algorithms",
        "Developing chatbots for customer service"
      ]
    },
    {
      icon: <FaShoppingCart className="w-6 h-6 text-blue-600" />,
      title: "Conversion Optimization",
      description: "Testing and developing new methods to improve checkout and conversion rates",
      examples: [
        "A/B testing checkout flows",
        "Developing abandoned cart recovery systems",
        "Creating dynamic product bundles",
        "Building custom upsell/cross-sell engines"
      ]
    },
    {
      icon: <FaChartBar className="w-6 h-6 text-emerald-600" />,
      title: "Analytics & Attribution",
      description: "Building custom analytics tools and tracking systems",
      examples: [
        "Developing customer lifetime value models",
        "Creating multi-channel attribution systems",
        "Building predictive inventory systems",
        "Testing new data visualization dashboards"
      ]
    },
    {
      icon: <FaBoxes className="w-6 h-6 text-blue-600" />,
      title: "Operations Automation",
      description: "Automating fulfillment, inventory, and customer service processes",
      examples: [
        "Building automated inventory management",
        "Creating smart shipping algorithms",
        "Developing returns processing automation",
        "Testing warehouse optimization systems"
      ]
    }
  ];

  const caseStudies = [
    {
      company: "Fashion Retailer Online",
      employees: "12 employees",
      credit: "$38,000",
      activities: "Built AI sizing recommendation, tested 50+ checkout variations",
      savings: "Funded entire Q4 marketing budget"
    },
    {
      company: "Specialty Goods Store",
      employees: "6 employees",
      credit: "$22,000",
      activities: "Developed custom recommendation engine, automated inventory system",
      savings: "Covered annual software costs"
    },
    {
      company: "Direct-to-Consumer Brand",
      employees: "20 employees",
      credit: "$55,000",
      activities: "Created personalization engine, built predictive analytics dashboard",
      savings: "Hired 2 new developers"
    }
  ];

  const commonProjects = [
    "AI product recommendation engines",
    "Personalized email marketing systems",
    "Dynamic pricing algorithms",
    "Customer service chatbots",
    "Checkout flow optimization",
    "Abandoned cart recovery systems",
    "Inventory prediction models",
    "Shipping optimization algorithms",
    "Customer segmentation tools",
    "Returns automation systems"
  ];

  return (
    <div className="min-h-screen bg-cloud">
      {/* Global Navigation */}
      <ResponsiveNav />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-blue-50 to-paper py-16 lg:py-24 pt-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <div className="inline-flex items-center bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-semibold mb-4">
              <FaShoppingCart className="mr-2" />
              Industry-Specific R&D Credits
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold text-ink mb-6">
              R&D Tax Credits for <span className="text-blue-500">E-commerce</span>
            </h1>
            <p className="text-xl text-ash max-w-3xl mx-auto mb-8">
              Your experiments with AI personalization, conversion optimization, and automation qualify for federal tax credits worth $20,000-$60,000+ annually.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/#calculator">
                <Button className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-6 text-lg rounded-lg shadow-lg transition-all transform hover:scale-105">
                  Calculate Your Credit
                  <FaArrowRight className="ml-2" />
                </Button>
              </Link>
              <Link href="/rd-credit-guide">
                <Button variant="outline" className="px-8 py-6 text-lg rounded-lg border-2 border-blue-200 hover:bg-blue-50">
                  Learn More
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Statistics Bar */}
      <section className="bg-blue-600 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold">$35K</div>
              <div className="text-blue-100">Average Credit</div>
            </div>
            <div>
              <div className="text-3xl font-bold">92%</div>
              <div className="text-blue-100">E-commerce Qualify</div>
            </div>
            <div>
              <div className="text-3xl font-bold">14%</div>
              <div className="text-blue-100">Federal Credit Rate</div>
            </div>
            <div>
              <div className="text-3xl font-bold">15x</div>
              <div className="text-blue-100">ROI vs Consultant</div>
            </div>
          </div>
        </div>
      </section>

      {/* Qualifying Activities */}
      <section className="py-16 lg:py-20" ref={ref}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-ink mb-4">
              What E-commerce Activities Qualify?
            </h2>
            <p className="text-lg text-ash max-w-3xl mx-auto">
              If you're testing new features, optimizing conversions, or building custom tools, you're likely performing qualified R&D.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            {qualifyingActivities.map((activity, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className="p-6 h-full hover:shadow-lg transition-shadow">
                  <div className="flex items-start mb-4">
                    <div className="p-3 bg-paper rounded-lg mr-4">
                      {activity.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-ink mb-2">{activity.title}</h3>
                      <p className="text-ash mb-4">{activity.description}</p>
                      <ul className="space-y-2">
                        {activity.examples.map((example, idx) => (
                          <li key={idx} className="flex items-start">
                            <FaCheckCircle className="text-emerald-500 mt-1 mr-2 flex-shrink-0" />
                            <span className="text-sm text-graphite">{example}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Common Projects */}
      <section className="py-16 bg-paper">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-ink mb-4">
              Common Qualifying Projects
            </h2>
            <p className="text-lg text-ash max-w-3xl mx-auto">
              These typical e-commerce projects often qualify for R&D tax credits
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {commonProjects.map((project, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={inView ? { opacity: 1, scale: 1 } : {}}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="flex items-center bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
              >
                <FaCheckCircle className="text-emerald-500 mr-3 flex-shrink-0" />
                <span className="text-graphite">{project}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Case Studies */}
      <section className="py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-ink mb-4">
              Real E-commerce Success Stories
            </h2>
            <p className="text-lg text-ash max-w-3xl mx-auto">
              See how other online retailers have claimed significant R&D tax credits
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {caseStudies.map((study, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className="p-6 h-full hover:shadow-lg transition-shadow">
                  <div className="text-3xl font-bold text-emerald-600 mb-2">{study.credit}</div>
                  <h3 className="text-xl font-semibold text-ink mb-2">{study.company}</h3>
                  <p className="text-sm text-ash mb-4">{study.employees}</p>
                  <p className="text-graphite mb-4">{study.activities}</p>
                  <div className="pt-4 border-t border-cloud">
                    <p className="text-sm font-semibold text-blue-600">{study.savings}</p>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-emerald-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
            Turn Your Innovation Into Tax Savings
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Most e-commerce businesses miss out on $20,000-$60,000 in credits every year. Calculate your potential credit in just 2 minutes.
          </p>
          <Link href="/#calculator">
            <Button className="bg-white text-blue-600 hover:bg-paper px-8 py-6 text-lg rounded-lg shadow-lg transition-all transform hover:scale-105">
              Calculate Your Credit Now
              <FaArrowRight className="ml-2" />
            </Button>
          </Link>
          <p className="text-sm text-blue-100 mt-4">
            No credit card required • Get results instantly • 100% confidential
          </p>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Ecommerce;