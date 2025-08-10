import { useState } from "react";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { FaSearch, FaChevronDown, FaChevronUp, FaQuestionCircle, FaDollarSign, FaFileAlt, FaUserTie, FaLock, FaClock } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Link } from "wouter";
import { Footer } from "@/components/layout/Footer";
import ResponsiveNav from "@/components/navigation/ResponsiveNav";

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

const FAQPage = () => {
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [expandedItems, setExpandedItems] = useState<number[]>([]);

  const categories = [
    { id: "all", name: "All Questions", icon: <FaQuestionCircle /> },
    { id: "eligibility", name: "Eligibility & Qualification", icon: <FaFileAlt /> },
    { id: "pricing", name: "Pricing & Payment", icon: <FaDollarSign /> },
    { id: "process", name: "Documentation Process", icon: <FaClock /> },
    { id: "cpa", name: "Working with Your CPA", icon: <FaUserTie /> },
    { id: "technical", name: "Technical Questions", icon: <FaLock /> },
  ];

  const faqItems: FAQItem[] = [
    // Eligibility Questions
    {
      category: "eligibility",
      question: "We just use ChatGPT and other AI tools - do we qualify?",
      answer: "Yes! If you're systematically testing, customizing, or integrating AI tools like ChatGPT into your business operations, you likely qualify. This includes developing custom prompts, testing different AI approaches, building workflows, or creating automations. The key is that you're experimenting to improve your business processes, not just using the tools as-is."
    },
    {
      category: "eligibility",
      question: "What if our experiments didn't work?",
      answer: "Failed experiments absolutely count! In fact, they often provide the strongest documentation for R&D tax credits. The IRS recognizes that innovation involves uncertainty and failure. Document what you tried, why it didn't work, and what you learned. These failed attempts demonstrate the experimental nature of your work."
    },
    {
      category: "eligibility",
      question: "We're not a tech company - can we still claim?",
      answer: "Absolutely! The R&D tax credit isn't limited to tech companies. Any business that experiments with new processes, products, or software qualifies. We've helped marketing agencies, e-commerce stores, healthcare practices, manufacturing companies, and professional service firms claim credits for their innovation activities."
    },
    {
      category: "eligibility",
      question: "How many hours or expenses do we need to qualify?",
      answer: "There's no minimum requirement! Even small projects can qualify. Generally, if you've spent at least $5,000 on qualifying activities (including employee time), it's worth documenting. Many of our clients are surprised to find they have $20,000-$50,000 in qualifying expenses from projects they didn't think counted."
    },
    {
      category: "eligibility",
      question: "Can we claim for past years?",
      answer: "Yes! You can file amended returns for the past 3 tax years (currently 2022, 2023, and 2024). Many businesses leave money on the table by not claiming retroactively. We can help you document past projects even if you didn't track them perfectly at the time."
    },
    {
      category: "eligibility",
      question: "Do contractors and freelancers count?",
      answer: "Yes, but at 65% of their cost per IRS rules. If you paid contractors or freelancers to help with experimental projects, custom development, or technical work, 65% of those costs can qualify for the credit. Employee wages qualify at 100%."
    },
    
    // Process Questions
    {
      category: "process",
      question: "How long does the whole process take?",
      answer: "The entire process is remarkably fast: 2 minutes for the initial calculator, 1 minute for payment, and 15-20 minutes for the intake form. You'll receive your complete documentation package within 24-48 hours. Most clients finish everything in under 30 minutes of active time."
    },
    {
      category: "process",
      question: "What information do I need to provide?",
      answer: "You'll need: basic company information, descriptions of your innovation projects, approximate time spent by employees on R&D activities, contractor costs (if any), software/cloud expenses related to R&D, and project timelines. Don't worry if you don't have perfect records - our intake form helps you reconstruct the information."
    },
    {
      category: "process",
      question: "Do you file the forms for us?",
      answer: "We provide all the completed forms and documentation you need, but you or your CPA will file them with your tax return. We include clear instructions and a CPA guide that explains exactly how to file. Think of us as doing all the complex work - you just need to submit it."
    },
    {
      category: "process",
      question: "What if I need to make changes?",
      answer: "You can request revisions within 30 days of receiving your documents at no additional charge. Our team will update your documentation based on your feedback. After 30 days, we can still help but may charge a small revision fee."
    },
    {
      category: "process",
      question: "Can multiple people access our account?",
      answer: "Yes! You can invite team members to collaborate on the intake form. This is helpful when different people have information about different projects. The account owner maintains control and can manage access."
    },
    
    // Pricing Questions
    {
      category: "pricing",
      question: "Why is your pricing so much lower than consultants?",
      answer: "We use AI and automation to streamline the documentation process, eliminating the manual work that drives up consultant costs. Traditional consultants charge 20-25% of your credit amount. Our flat-fee model means you know exactly what you'll pay upfront, typically saving you 80-90%."
    },
    {
      category: "pricing",
      question: "What if my credit estimate changes?",
      answer: "If your final credit calculation puts you in a different tier, we'll adjust accordingly. If you qualify for a higher tier, we'll send an invoice for the difference. If you qualify for a lower tier, we'll refund the difference. You only pay for the tier you actually need."
    },
    {
      category: "pricing",
      question: "Are there any hidden fees?",
      answer: "No hidden fees whatsoever. The price you see is the total price. This includes all documents, revisions within 30 days, email support, and 90-day download access. No percentages, no surprises, no add-ons."
    },
    {
      category: "pricing",
      question: "Do you offer payment plans?",
      answer: "For packages over $1,500, we offer a 2-payment option: 50% to start and 50% on delivery. For enterprise engagements over $3,000, we can create custom payment terms. Contact us to discuss options."
    },
    {
      category: "pricing",
      question: "What's your refund policy?",
      answer: "We offer a satisfaction guarantee. If your CPA reviews our documentation and finds it inadequate for filing, we'll either fix it at no charge or provide a full refund. We stand behind our work 100%."
    },
    
    // CPA Questions
    {
      category: "cpa",
      question: "Will my CPA accept your documents?",
      answer: "Yes! Our documents follow IRS guidelines and include everything CPAs need to file Form 6765. We provide a CPA instruction guide that explains the documentation and how to file it. Over 500 CPAs have successfully filed returns using our documentation."
    },
    {
      category: "cpa",
      question: "Do you work directly with CPAs?",
      answer: "Absolutely! Many CPAs refer their clients to us because we handle the complex R&D documentation they don't have time for. We can coordinate directly with your CPA if they have questions or need additional information."
    },
    {
      category: "cpa",
      question: "What if my CPA has questions?",
      answer: "We provide CPA support at no additional charge. Your CPA can email us with questions, and we'll respond within 24 hours. We can also provide additional documentation or clarification as needed to ensure smooth filing."
    },
    {
      category: "cpa",
      question: "Can you recommend a CPA?",
      answer: "While we don't make specific recommendations, we work with a network of R&D-friendly CPAs across the country. If you need a CPA familiar with R&D credits, contact us and we can provide a list of professionals in your area."
    },
    
    // Technical Questions
    {
      category: "technical",
      question: "Is my data secure?",
      answer: "Absolutely. We use bank-level encryption (256-bit SSL) for all data transmission and storage. Your information is stored on secure servers with SOC 2 compliance. We never share your data with third parties and delete it upon request."
    },
    {
      category: "technical",
      question: "How do you calculate the credit?",
      answer: "We use the IRS Alternative Simplified Credit (ASC) method, which provides 14% of qualified research expenses (QREs) for most businesses. For first-time filers, it's 6% of QREs exceeding a base amount. Our calculator considers wages, contractor costs (at 65%), supplies, and cloud expenses."
    },
    {
      category: "technical",
      question: "What is Section G?",
      answer: "Section G of Form 6765 requires detailed documentation for businesses claiming credits over $50,000. It includes technical narratives, project descriptions, and qualification explanations. Our documentation automatically includes Section G compliance for all applicable claims."
    },
    {
      category: "technical",
      question: "What about state credits?",
      answer: "We focus exclusively on federal R&D tax credits, which are available to all US businesses. Many states offer additional credits with different rules. While we don't prepare state documentation, our federal documentation often provides the foundation for state claims."
    },
    {
      category: "technical",
      question: "What's the difference between regular credit and ASC?",
      answer: "The Regular Credit Method (RCM) provides 20% of QREs above a base amount but requires historical data. The Alternative Simplified Credit (ASC) provides 14% of QREs above a simpler base and doesn't require pre-2009 data. We typically use ASC as it's simpler and often more beneficial for SMBs."
    }
  ];

  const filteredFAQs = faqItems.filter(item => {
    const matchesCategory = selectedCategory === "all" || item.category === selectedCategory;
    const matchesSearch = searchQuery === "" || 
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const toggleExpanded = (index: number) => {
    setExpandedItems(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  return (
    <div className="min-h-screen bg-cloud">
      {/* Global Navigation */}
      <ResponsiveNav />
      
      {/* Hero Section with padding for fixed nav */}
      <section className="bg-gradient-to-b from-blue-50 to-paper py-16 lg:py-20 pt-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h1 className="text-4xl lg:text-5xl font-bold text-ink mb-6">
              Frequently Asked Questions
            </h1>
            <p className="text-xl text-ash max-w-3xl mx-auto mb-8">
              Everything you need to know about R&D tax credits and our documentation service
            </p>
            
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto relative">
              <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-ash" />
              <Input
                type="text"
                placeholder="Search for answers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 pr-4 py-3 text-lg"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Category Filter */}
      <section className="py-8 bg-paper border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap gap-3 justify-center">
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "outline"}
                onClick={() => setSelectedCategory(category.id)}
                className="flex items-center gap-2"
              >
                {category.icon}
                {category.name}
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Items */}
      <section ref={ref} className="py-16 lg:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {filteredFAQs.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-lg text-ash mb-4">
                No questions found matching your search.
              </p>
              <p className="text-sm text-ash">
                Try searching with different keywords or browse by category.
              </p>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredFAQs.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={inView ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card 
                    className="cursor-pointer hover:shadow-lg transition-shadow"
                    onClick={() => toggleExpanded(index)}
                  >
                    <div className="p-6">
                      <div className="flex justify-between items-start">
                        <h3 className="font-semibold text-ink pr-4">
                          {item.question}
                        </h3>
                        {expandedItems.includes(index) ? (
                          <FaChevronUp className="text-ash flex-shrink-0 mt-1" />
                        ) : (
                          <FaChevronDown className="text-ash flex-shrink-0 mt-1" />
                        )}
                      </div>
                      
                      {expandedItems.includes(index) && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          transition={{ duration: 0.3 }}
                          className="mt-4"
                        >
                          <p className="text-ash leading-relaxed">
                            {item.answer}
                          </p>
                        </motion.div>
                      )}
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
          
          {/* Results count */}
          {searchQuery && (
            <p className="text-sm text-ash text-center mt-6">
              Showing {filteredFAQs.length} result{filteredFAQs.length !== 1 ? 's' : ''} 
              {selectedCategory !== "all" && ` in ${categories.find(c => c.id === selectedCategory)?.name}`}
            </p>
          )}
        </div>
      </section>

      {/* Still Have Questions? */}
      <section className="bg-blue-50 py-16 lg:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-ink mb-4">
            Still Have Questions?
          </h2>
          <p className="text-lg text-ash mb-8">
            Our team is here to help you understand your R&D tax credit potential
          </p>
          
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <Card className="p-6">
              <h3 className="font-semibold text-ink mb-2">Email Support</h3>
              <p className="text-sm text-ash mb-4">
                Get answers within 24 hours
              </p>
              <a href="mailto:support@rdtaxcreditpro.com" className="text-blue-600 hover:underline">
                support@rdtaxcreditpro.com
              </a>
            </Card>
            
            <Card className="p-6">
              <h3 className="font-semibold text-ink mb-2">Live Chat</h3>
              <p className="text-sm text-ash mb-4">
                Available Mon-Fri 9am-5pm EST
              </p>
              <Button className="btn-primary">
                Start Chat
              </Button>
            </Card>
            
            <Card className="p-6">
              <h3 className="font-semibold text-ink mb-2">Schedule Call</h3>
              <p className="text-sm text-ash mb-4">
                Free 15-minute consultation
              </p>
              <Button variant="outline">
                Book Time
              </Button>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-blue-500 to-emerald-500 py-16 lg:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-paper mb-4">
            Ready to Claim Your Credits?
          </h2>
          <p className="text-xl text-paper/90 mb-8">
            See how much you could save in just 2 minutes
          </p>
          <Link href="/#calculator">
            <Button size="lg" className="bg-paper text-blue-600 hover:bg-cloud">
              Start Free Estimate
            </Button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default FAQPage;