import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { FaBullhorn, FaLightbulb, FaChartLine, FaUsers, FaCheckCircle, FaArrowRight } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Link } from "wouter";
import ResponsiveNav from "@/components/navigation/ResponsiveNav";
import { Footer } from "@/components/layout/Footer";

const MarketingAgencies = () => {
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });

  const qualifyingActivities = [
    {
      icon: <FaLightbulb className="w-6 h-6 text-emerald-600" />,
      title: "AI-Powered Creative Development",
      description: "Testing ChatGPT/Claude for ad copy, content generation, and creative campaigns",
      examples: [
        "Developing prompt libraries for different client industries",
        "A/B testing AI-generated vs human-written content",
        "Creating custom GPTs for brand voice consistency",
        "Experimenting with AI image generation workflows"
      ]
    },
    {
      icon: <FaBullhorn className="w-6 h-6 text-blue-600" />,
      title: "Campaign Automation & Optimization",
      description: "Building automated workflows and testing new marketing technologies",
      examples: [
        "Developing automated reporting dashboards",
        "Creating chatbots for lead qualification",
        "Testing programmatic ad bidding strategies",
        "Building custom marketing automation flows"
      ]
    },
    {
      icon: <FaChartLine className="w-6 h-6 text-emerald-600" />,
      title: "Data Analytics & Attribution",
      description: "Developing new methods for tracking and analyzing campaign performance",
      examples: [
        "Creating multi-touch attribution models",
        "Building predictive analytics for campaign success",
        "Developing custom tracking pixels and scripts",
        "Testing new data visualization approaches"
      ]
    },
    {
      icon: <FaUsers className="w-6 h-6 text-blue-600" />,
      title: "Personalization & Segmentation",
      description: "Experimenting with dynamic content and audience targeting",
      examples: [
        "Building dynamic email personalization systems",
        "Testing AI-driven audience segmentation",
        "Creating personalized landing page systems",
        "Developing custom recommendation engines"
      ]
    }
  ];

  const caseStudies = [
    {
      company: "Creative Digital Agency",
      employees: "15 employees",
      credit: "$42,000",
      activities: "Developed custom GPT for brand voice, tested 200+ prompt variations",
      savings: "Covered 3 months of overhead expenses"
    },
    {
      company: "Performance Marketing Co",
      employees: "8 employees",
      credit: "$28,000",
      activities: "Built automated reporting system, created chatbot for lead qualification",
      savings: "Funded new hire for 6 months"
    },
    {
      company: "Content Studio LLC",
      employees: "5 employees",
      credit: "$18,000",
      activities: "Experimented with AI video scripts, developed content automation workflow",
      savings: "Paid for annual software licenses"
    }
  ];

  const commonProjects = [
    "Prompt engineering for client campaigns",
    "Custom GPT development for specific industries",
    "AI-powered content generation workflows",
    "Automated reporting and analytics dashboards",
    "Chatbot development for client websites",
    "Marketing automation flow optimization",
    "A/B testing frameworks and tools",
    "Custom tracking and attribution systems",
    "Dynamic personalization engines",
    "Predictive analytics models"
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
              <FaBullhorn className="mr-2" />
              Industry-Specific R&D Credits
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold text-ink mb-6">
              R&D Tax Credits for <span className="text-blue-500">Marketing Agencies</span>
            </h1>
            <p className="text-xl text-ash max-w-3xl mx-auto mb-8">
              Your creative experiments with AI, automation, and new marketing technologies qualify for federal tax credits worth $15,000-$50,000+ annually.
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
              <div className="text-3xl font-bold">$28K</div>
              <div className="text-blue-100">Average Credit</div>
            </div>
            <div>
              <div className="text-3xl font-bold">87%</div>
              <div className="text-blue-100">Agencies Qualify</div>
            </div>
            <div>
              <div className="text-3xl font-bold">14%</div>
              <div className="text-blue-100">Federal Credit Rate</div>
            </div>
            <div>
              <div className="text-3xl font-bold">2-3x</div>
              <div className="text-blue-100">ROI on Documentation</div>
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
              What Activities Qualify for R&D Credits?
            </h2>
            <p className="text-lg text-ash max-w-3xl mx-auto">
              If you're testing new approaches, experimenting with AI, or developing custom solutions for clients, you're likely performing qualified R&D.
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
              These typical agency projects often qualify for R&D tax credits
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
              Real Agency Success Stories
            </h2>
            <p className="text-lg text-ash max-w-3xl mx-auto">
              See how other marketing agencies have claimed significant R&D tax credits
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
            Stop Leaving Money on the Table
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Most agencies miss out on $15,000-$50,000 in credits every year. Calculate your potential credit in just 2 minutes.
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

export default MarketingAgencies;