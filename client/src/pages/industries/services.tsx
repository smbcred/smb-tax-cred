import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { FaBriefcase, FaCogs, FaUserTie, FaClipboardCheck, FaCheckCircle, FaArrowRight } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Link } from "wouter";
import ResponsiveNav from "@/components/navigation/ResponsiveNav";
import { Footer } from "@/components/layout/Footer";

const ProfessionalServices = () => {
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });

  const qualifyingActivities = [
    {
      icon: <FaCogs className="w-6 h-6 text-emerald-600" />,
      title: "Process Automation",
      description: "Building automated workflows and streamlining service delivery",
      examples: [
        "Developing automated client onboarding systems",
        "Creating document generation workflows",
        "Building project management automation",
        "Testing AI for contract analysis"
      ]
    },
    {
      icon: <FaUserTie className="w-6 h-6 text-blue-600" />,
      title: "Client Solutions Development",
      description: "Creating custom tools and methodologies for client deliverables",
      examples: [
        "Building proprietary analysis tools",
        "Developing custom reporting dashboards",
        "Creating industry-specific frameworks",
        "Testing new service delivery models"
      ]
    },
    {
      icon: <FaClipboardCheck className="w-6 h-6 text-emerald-600" />,
      title: "Quality Assurance Systems",
      description: "Developing systems to ensure consistent service quality",
      examples: [
        "Building automated QA checkpoints",
        "Creating compliance tracking systems",
        "Developing peer review workflows",
        "Testing AI-powered quality analysis"
      ]
    },
    {
      icon: <FaBriefcase className="w-6 h-6 text-blue-600" />,
      title: "Knowledge Management",
      description: "Building systems to capture and share organizational knowledge",
      examples: [
        "Creating internal knowledge bases",
        "Developing training automation systems",
        "Building expertise matching algorithms",
        "Testing AI for knowledge extraction"
      ]
    }
  ];

  const caseStudies = [
    {
      company: "Management Consulting LLC",
      employees: "25 employees",
      credit: "$68,000",
      activities: "Built proprietary analysis tools, automated report generation",
      savings: "Funded new practice area launch"
    },
    {
      company: "Legal Services Firm",
      employees: "15 employees",
      credit: "$45,000",
      activities: "Developed AI contract review system, automated billing workflows",
      savings: "Covered technology upgrades"
    },
    {
      company: "Accounting Practice",
      employees: "10 employees",
      credit: "$32,000",
      activities: "Created automated tax prep workflows, built client portal",
      savings: "Hired additional staff member"
    }
  ];

  const commonProjects = [
    "Automated client onboarding systems",
    "Custom reporting dashboards",
    "Document generation workflows",
    "Project management automation",
    "AI-powered research tools",
    "Client portal development",
    "Billing and invoicing automation",
    "Knowledge base systems",
    "Quality assurance workflows",
    "Compliance tracking tools"
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
              <FaBriefcase className="mr-2" />
              Industry-Specific R&D Credits
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold text-ink mb-6">
              R&D Tax Credits for <span className="text-blue-500">Professional Services</span>
            </h1>
            <p className="text-xl text-ash max-w-3xl mx-auto mb-8">
              Your innovations in service delivery, automation, and custom client solutions qualify for federal tax credits worth $25,000-$75,000+ annually.
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
              <div className="text-3xl font-bold">$42K</div>
              <div className="text-blue-100">Average Credit</div>
            </div>
            <div>
              <div className="text-3xl font-bold">78%</div>
              <div className="text-blue-100">Firms Qualify</div>
            </div>
            <div>
              <div className="text-3xl font-bold">14%</div>
              <div className="text-blue-100">Federal Credit Rate</div>
            </div>
            <div>
              <div className="text-3xl font-bold">20x</div>
              <div className="text-blue-100">ROI on Filing</div>
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
              What Service Activities Qualify?
            </h2>
            <p className="text-lg text-ash max-w-3xl mx-auto">
              If you're developing proprietary tools, automating processes, or creating new methodologies, you're likely performing qualified R&D.
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
              These typical professional service projects often qualify for R&D tax credits
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
              Real Professional Services Success Stories
            </h2>
            <p className="text-lg text-ash max-w-3xl mx-auto">
              See how other service firms have claimed significant R&D tax credits
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
            Your Innovation Deserves Recognition
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Most professional service firms miss out on $25,000-$75,000 in credits every year. Calculate your potential credit in just 2 minutes.
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

export default ProfessionalServices;