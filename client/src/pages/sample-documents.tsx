import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { FaFileAlt, FaDownload, FaCheck, FaLock, FaEye } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Link } from "wouter";
import { Footer } from "@/components/layout/Footer";
import { useState } from "react";

const SampleDocuments = () => {
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });

  const [selectedDoc, setSelectedDoc] = useState<string | null>(null);

  const documents = [
    {
      id: "form-6765",
      title: "Form 6765 - Credit for Increasing Research Activities",
      description: "The main IRS form for claiming R&D tax credits, fully completed with your business information",
      pages: 4,
      features: [
        "All required calculations completed",
        "Section G compliance for credits over $50K",
        "Alternative Simplified Credit (ASC) method",
        "Prior year comparisons included"
      ],
      preview: "/assets/form-6765-preview.png"
    },
    {
      id: "technical-narrative",
      title: "Technical Narrative Documentation",
      description: "AI-generated narratives that explain your R&D activities in IRS-compliant language",
      pages: 8,
      features: [
        "Project-by-project descriptions",
        "Four-part test compliance",
        "Technical uncertainty documentation",
        "Process of experimentation details"
      ],
      preview: "/assets/technical-narrative-preview.png"
    },
    {
      id: "qre-worksheet",
      title: "QRE Calculation Worksheet",
      description: "Detailed breakdown of all Qualified Research Expenses with supporting calculations",
      pages: 6,
      features: [
        "Employee wage calculations",
        "Contractor cost adjustments (65%)",
        "Supply and cloud expenses",
        "Monthly/quarterly breakdowns"
      ],
      preview: "/assets/qre-worksheet-preview.png"
    },
    {
      id: "executive-summary",
      title: "Executive Summary & CPA Guide",
      description: "High-level overview and filing instructions for your tax professional",
      pages: 3,
      features: [
        "Credit calculation summary",
        "Filing instructions for CPAs",
        "Key assumptions and methodology",
        "Risk assessment and recommendations"
      ],
      preview: "/assets/executive-summary-preview.png"
    },
    {
      id: "project-timeline",
      title: "Project Timeline & Activities",
      description: "Visual timeline showing when R&D activities occurred throughout the tax year",
      pages: 2,
      features: [
        "Month-by-month activity breakdown",
        "Resource allocation by project",
        "Milestone achievements",
        "Innovation timeline mapping"
      ],
      preview: "/assets/timeline-preview.png"
    },
    {
      id: "supporting-docs",
      title: "Supporting Documentation Checklist",
      description: "Comprehensive list of records to maintain for IRS compliance",
      pages: 2,
      features: [
        "Required documentation list",
        "Record retention guidelines",
        "Audit preparation checklist",
        "Best practices for documentation"
      ],
      preview: "/assets/checklist-preview.png"
    }
  ];

  const sampleData = {
    company: "TechCo Solutions, Inc.",
    year: "2024",
    credit: "$45,000",
    projects: 3,
    employees: 12,
    industry: "Software Development"
  };

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
              See Exactly What You'll Receive
            </h1>
            <p className="text-xl text-ash max-w-3xl mx-auto mb-8">
              Professional, IRS-compliant documentation that your CPA will love. 
              Every package includes these comprehensive documents.
            </p>
            
            {/* Sample Info Card */}
            <Card className="max-w-2xl mx-auto p-6 bg-blue-50 border-blue-200">
              <div className="flex items-center justify-center mb-3">
                <FaLock className="text-blue-600 mr-2" />
                <span className="text-sm font-semibold text-blue-600">SAMPLE DOCUMENTATION</span>
              </div>
              <p className="text-sm text-graphite">
                Based on a real client: <strong>{sampleData.company}</strong> • 
                {" "}{sampleData.year} Tax Year • 
                {" "}{sampleData.projects} Projects • 
                {" "}{sampleData.employees} Employees • 
                {" "}<span className="text-emerald-600 font-bold">{sampleData.credit} Credit</span>
              </p>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Documents Grid */}
      <section ref={ref} className="py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {documents.map((doc, index) => (
              <motion.div
                key={doc.id}
                initial={{ opacity: 0, y: 20 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="h-full hover:shadow-xl transition-shadow">
                  <div className="p-6">
                    {/* Document Header */}
                    <div className="flex items-start justify-between mb-4">
                      <FaFileAlt className="text-3xl text-blue-500" />
                      <span className="text-sm text-ash">{doc.pages} pages</span>
                    </div>
                    
                    {/* Document Title & Description */}
                    <h3 className="text-lg font-bold text-ink mb-2">
                      {doc.title}
                    </h3>
                    <p className="text-sm text-ash mb-4">
                      {doc.description}
                    </p>
                    
                    {/* Features List */}
                    <ul className="space-y-2 mb-6">
                      {doc.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <FaCheck className="text-emerald-500 mt-0.5 flex-shrink-0" />
                          <span className="text-xs text-graphite">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    
                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => setSelectedDoc(doc.id)}
                      >
                        <FaEye className="mr-2" />
                        Preview
                      </Button>
                      <Button
                        size="sm"
                        className="flex-1 btn-primary"
                      >
                        <FaDownload className="mr-2" />
                        Sample
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Package Details */}
      <section className="bg-blue-50 py-16 lg:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-ink mb-12">
            Complete Documentation Package Includes
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* IRS Forms */}
            <Card className="p-6">
              <h3 className="font-bold text-ink mb-4 flex items-center">
                <span className="w-8 h-8 bg-blue-500 text-paper rounded-full flex items-center justify-center text-sm font-bold mr-3">1</span>
                IRS Forms
              </h3>
              <p className="text-sm text-ash mb-4">
                All required federal forms completed and ready for filing
              </p>
              <ul className="space-y-2">
                <li className="text-sm text-graphite">• Form 6765 (main credit form)</li>
                <li className="text-sm text-graphite">• Schedule C adjustments</li>
                <li className="text-sm text-graphite">• Carryforward worksheets</li>
                <li className="text-sm text-graphite">• Amendment forms (if applicable)</li>
              </ul>
            </Card>
            
            {/* Supporting Documents */}
            <Card className="p-6">
              <h3 className="font-bold text-ink mb-4 flex items-center">
                <span className="w-8 h-8 bg-emerald-500 text-paper rounded-full flex items-center justify-center text-sm font-bold mr-3">2</span>
                Supporting Documents
              </h3>
              <p className="text-sm text-ash mb-4">
                Comprehensive documentation to support your credit claim
              </p>
              <ul className="space-y-2">
                <li className="text-sm text-graphite">• Technical narratives</li>
                <li className="text-sm text-graphite">• QRE calculations</li>
                <li className="text-sm text-graphite">• Project timelines</li>
                <li className="text-sm text-graphite">• Four-part test analysis</li>
              </ul>
            </Card>
            
            {/* Professional Guidance */}
            <Card className="p-6">
              <h3 className="font-bold text-ink mb-4 flex items-center">
                <span className="w-8 h-8 bg-purple-500 text-paper rounded-full flex items-center justify-center text-sm font-bold mr-3">3</span>
                Professional Guidance
              </h3>
              <p className="text-sm text-ash mb-4">
                Everything your CPA needs to file with confidence
              </p>
              <ul className="space-y-2">
                <li className="text-sm text-graphite">• Executive summary</li>
                <li className="text-sm text-graphite">• CPA filing instructions</li>
                <li className="text-sm text-graphite">• Audit defense guide</li>
                <li className="text-sm text-graphite">• Best practices checklist</li>
              </ul>
            </Card>
          </div>
        </div>
      </section>

      {/* Quality Guarantees */}
      <section className="py-16 lg:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-ink mb-12">
            Documentation Quality Guarantees
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="font-semibold text-ink mb-3">
                ✓ IRS Compliance Guaranteed
              </h3>
              <p className="text-sm text-ash">
                Every document follows IRS guidelines, regulations, and best practices. 
                We stay updated on all tax law changes and court precedents.
              </p>
            </Card>
            
            <Card className="p-6">
              <h3 className="font-semibold text-ink mb-3">
                ✓ CPA-Ready Format
              </h3>
              <p className="text-sm text-ash">
                Documents organized exactly how CPAs expect them. Clear instructions, 
                proper formatting, and all required attachments included.
              </p>
            </Card>
            
            <Card className="p-6">
              <h3 className="font-semibold text-ink mb-3">
                ✓ Audit-Defense Documentation
              </h3>
              <p className="text-sm text-ash">
                Comprehensive supporting documentation that can withstand IRS scrutiny. 
                Includes detailed narratives and calculation worksheets.
              </p>
            </Card>
            
            <Card className="p-6">
              <h3 className="font-semibold text-ink mb-3">
                ✓ Plain English Explanations
              </h3>
              <p className="text-sm text-ash">
                While technically accurate, our documents are written in clear language 
                that both you and your CPA can understand.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Download Sample CTA */}
      <section className="bg-gradient-to-r from-blue-500 to-emerald-500 py-16 lg:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-paper mb-4">
            Ready to Get Your Documentation?
          </h2>
          <p className="text-xl text-paper/90 mb-8">
            Join 500+ businesses that have successfully claimed their R&D credits
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
            <Button size="lg" className="bg-paper text-blue-600 hover:bg-cloud">
              <FaDownload className="mr-2" />
              Download Sample Package
            </Button>
            <Link href="/#calculator">
              <Button size="lg" variant="outline" className="border-paper text-paper hover:bg-paper/10">
                Start Your Documentation
              </Button>
            </Link>
          </div>
          
          <p className="text-sm text-paper/80">
            Sample package includes redacted examples from real client documentation
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default SampleDocuments;