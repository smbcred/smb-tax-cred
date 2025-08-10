import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { FaCheckCircle, FaCalculator, FaArrowRight, FaTrophy, FaShieldAlt } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Link } from "wouter";
import { Footer } from "@/components/layout/Footer";
import ResponsiveNav from "@/components/navigation/ResponsiveNav";
import { useState } from "react";

const PricingPage = () => {
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });

  const [selectedCredit, setSelectedCredit] = useState(25000);

  const pricingTiers = [
    {
      name: "Starter",
      price: "$299",
      creditRange: "Up to $5,000",
      creditMin: 0,
      creditMax: 5000,
      example: "Perfect for small projects and initial experiments",
      popular: false
    },
    {
      name: "Basic",
      price: "$599",
      creditRange: "$5,001 - $10,000",
      creditMin: 5001,
      creditMax: 10000,
      example: "Ideal for startups testing AI tools",
      popular: false
    },
    {
      name: "Growth",
      price: "$999",
      creditRange: "$10,001 - $25,000",
      creditMin: 10001,
      creditMax: 25000,
      example: "Most popular for growing SMBs",
      popular: true
    },
    {
      name: "Scale",
      price: "$1,499",
      creditRange: "$25,001 - $50,000",
      creditMin: 25001,
      creditMax: 50000,
      example: "For established businesses with multiple projects",
      popular: false
    },
    {
      name: "Professional",
      price: "$1,999",
      creditRange: "$50,001 - $75,000",
      creditMin: 50001,
      creditMax: 75000,
      example: "Companies with dedicated innovation teams",
      popular: false
    },
    {
      name: "Advanced",
      price: "$2,999",
      creditRange: "$75,001 - $100,000",
      creditMin: 75001,
      creditMax: 100000,
      example: "Organizations with substantial R&D investment",
      popular: false
    },
    {
      name: "Enterprise",
      price: "$3,999",
      creditRange: "$100,000+",
      creditMin: 100001,
      creditMax: 999999,
      example: "Large-scale innovation programs",
      popular: false
    }
  ];

  const allFeatures = [
    "Complete Form 6765 preparation",
    "AI-generated technical narratives",
    "Detailed QRE calculations",
    "Four-part test documentation",
    "Section G compliance",
    "Executive summary report",
    "CPA instruction guide",
    "90-day download access",
    "30-day revision period",
    "Email support included"
  ];

  const calculateSavings = (credit: number) => {
    const consultantFee = credit * 0.20; // 20% typical consultant fee
    const tier = pricingTiers.find(t => credit >= t.creditMin && credit <= t.creditMax);
    const ourFee = tier ? parseInt(tier.price.replace(/[$,]/g, '')) : 299;
    const savings = consultantFee - ourFee;
    const savingsPercent = ((savings / consultantFee) * 100).toFixed(0);
    
    return {
      consultantFee,
      ourFee,
      savings,
      savingsPercent
    };
  };

  const savings = calculateSavings(selectedCredit);

  return (
    <div className="min-h-screen bg-cloud">
      {/* Global Navigation */}
      <ResponsiveNav />
      
      {/* Hero Section with padding for fixed nav */}
      <section className="bg-gradient-to-b from-blue-50 to-paper py-16 lg:py-24 pt-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <div className="inline-flex items-center bg-emerald-100 text-emerald-700 px-4 py-2 rounded-full text-sm font-semibold mb-4">
              <FaTrophy className="mr-2" />
              Save 80-90% vs Traditional Consultants
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold text-ink mb-6">
              Simple, Flat-Fee Pricing. <span className="text-blue-500">No Surprises.</span>
            </h1>
            <p className="text-xl text-ash max-w-3xl mx-auto mb-8">
              Pay once. Get everything. While consultants charge 20-25% of your credit, 
              we charge a simple flat fee based on your credit size.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Savings Calculator */}
      <section className="py-12 bg-emerald-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="p-6 lg:p-8">
            <h3 className="text-2xl font-bold text-ink mb-6 text-center">
              See Your Savings
            </h3>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-graphite mb-2">
                Your Estimated R&D Credit: ${selectedCredit.toLocaleString()}
              </label>
              <input
                type="range"
                min="1000"
                max="150000"
                step="1000"
                value={selectedCredit}
                onChange={(e) => setSelectedCredit(parseInt(e.target.value))}
                className="w-full h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-xs text-ash mt-1">
                <span>$1K</span>
                <span>$150K</span>
              </div>
            </div>
            
            <div className="grid md:grid-cols-3 gap-4 text-center">
              <div className="bg-red-50 p-4 rounded-lg">
                <p className="text-sm text-ash mb-1">Consultant Fee (20%)</p>
                <p className="text-2xl font-bold text-red-600">
                  ${savings.consultantFee.toLocaleString()}
                </p>
              </div>
              <div className="bg-emerald-50 p-4 rounded-lg">
                <p className="text-sm text-ash mb-1">Our Flat Fee</p>
                <p className="text-2xl font-bold text-emerald-600">
                  ${savings.ourFee.toLocaleString()}
                </p>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-ash mb-1">You Save</p>
                <p className="text-2xl font-bold text-blue-600">
                  ${savings.savings.toLocaleString()}
                </p>
                <p className="text-sm text-blue-600">({savings.savingsPercent}%)</p>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Pricing Table */}
      <section ref={ref} className="py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {pricingTiers.map((tier, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={tier.popular ? "relative" : ""}
              >
                {tier.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                    <span className="bg-gradient-to-r from-blue-500 to-emerald-500 text-paper text-xs px-3 py-1 rounded-full font-semibold">
                      MOST POPULAR
                    </span>
                  </div>
                )}
                <Card className={`p-6 h-full ${tier.popular ? 'border-2 border-blue-500 shadow-xl transform scale-105' : ''}`}>
                  <div className="text-center mb-6">
                    <h3 className="text-lg font-semibold text-ink mb-2">{tier.name}</h3>
                    <p className="text-3xl font-bold text-blue-600 mb-2">{tier.price}</p>
                    <p className="text-sm text-ash mb-1">{tier.creditRange}</p>
                    <p className="text-xs text-ash/80">{tier.example}</p>
                  </div>
                  
                  <Link href="/#calculator">
                    <Button className={`w-full ${tier.popular ? 'btn-primary' : 'btn-outline'}`}>
                      Get Started
                      <FaArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                  </Link>
                </Card>
              </motion.div>
            ))}
          </div>
          
          {/* What's Included */}
          <Card className="mt-12 p-8">
            <h3 className="text-2xl font-bold text-center text-ink mb-8">
              Everything Included in Every Package
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              {allFeatures.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={inView ? { opacity: 1, x: 0 } : {}}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-start gap-3"
                >
                  <FaCheckCircle className="text-emerald-500 mt-1 flex-shrink-0" />
                  <span className="text-graphite">{feature}</span>
                </motion.div>
              ))}
            </div>
          </Card>
        </div>
      </section>

      {/* Comparison Section */}
      <section className="bg-graphite text-paper py-16 lg:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl lg:text-4xl font-bold text-center mb-12">
            Why Pay 10x More for the Same Documentation?
          </h2>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-cloud/20">
                  <th className="text-left py-4 px-4"></th>
                  <th className="text-center py-4 px-4">
                    <div className="text-emerald-400 font-semibold">Us</div>
                  </th>
                  <th className="text-center py-4 px-4">
                    <div className="text-ash">Traditional Consultants</div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cloud/10">
                <tr>
                  <td className="py-4 px-4">Pricing Model</td>
                  <td className="text-center py-4 px-4">
                    <span className="text-emerald-400">✓ Flat Fee</span>
                  </td>
                  <td className="text-center py-4 px-4">20-25% of credit</td>
                </tr>
                <tr>
                  <td className="py-4 px-4">$50K Credit Cost</td>
                  <td className="text-center py-4 px-4">
                    <span className="text-emerald-400 font-bold">$1,499</span>
                  </td>
                  <td className="text-center py-4 px-4">$10,000-$12,500</td>
                </tr>
                <tr>
                  <td className="py-4 px-4">Delivery Time</td>
                  <td className="text-center py-4 px-4">
                    <span className="text-emerald-400">24-48 hours</span>
                  </td>
                  <td className="text-center py-4 px-4">2-4 weeks</td>
                </tr>
                <tr>
                  <td className="py-4 px-4">IRS Compliance</td>
                  <td className="text-center py-4 px-4">
                    <span className="text-emerald-400">✓</span>
                  </td>
                  <td className="text-center py-4 px-4">✓</td>
                </tr>
                <tr>
                  <td className="py-4 px-4">AI-Generated Narratives</td>
                  <td className="text-center py-4 px-4">
                    <span className="text-emerald-400">✓</span>
                  </td>
                  <td className="text-center py-4 px-4">Manual</td>
                </tr>
                <tr>
                  <td className="py-4 px-4">Multi-Year Support</td>
                  <td className="text-center py-4 px-4">
                    <span className="text-emerald-400">✓</span>
                  </td>
                  <td className="text-center py-4 px-4">Extra fees</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 lg:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-ink mb-12">
            Pricing Questions
          </h2>
          
          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="font-semibold text-ink mb-2">
                Why is your pricing so much lower than consultants?
              </h3>
              <p className="text-ash">
                We use AI and automation to streamline the documentation process, 
                eliminating the manual work that drives up consultant costs. 
                Our flat-fee model means you know exactly what you'll pay upfront.
              </p>
            </Card>
            
            <Card className="p-6">
              <h3 className="font-semibold text-ink mb-2">
                What if my credit estimate changes after payment?
              </h3>
              <p className="text-ash">
                If your final credit calculation puts you in a different tier, 
                we'll adjust accordingly. Higher tier? We'll send an invoice for 
                the difference. Lower tier? We'll refund the difference.
              </p>
            </Card>
            
            <Card className="p-6">
              <h3 className="font-semibold text-ink mb-2">
                Are there any hidden fees?
              </h3>
              <p className="text-ash">
                No hidden fees whatsoever. The price you see is the total price. 
                This includes all documents, revisions within 30 days, and email support.
              </p>
            </Card>
            
            <Card className="p-6">
              <h3 className="font-semibold text-ink mb-2">
                Do you offer multi-year discounts?
              </h3>
              <p className="text-ash">
                Yes! Save 10% when documenting 2 years and 15% for 3 years 
                (2022-2024 amended returns). Contact us for custom pricing on 
                larger engagements.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Guarantees */}
      <section className="bg-blue-50 py-16 lg:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <FaShieldAlt className="w-12 h-12 text-blue-500 mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-ink mb-4">
              Our Guarantees
            </h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="p-6 text-center">
              <h3 className="font-semibold text-ink mb-2">Price Match</h3>
              <p className="text-sm text-ash">
                Find a lower price for the same quality documentation? 
                We'll match it.
              </p>
            </Card>
            <Card className="p-6 text-center">
              <h3 className="font-semibold text-ink mb-2">CPA Acceptance</h3>
              <p className="text-sm text-ash">
                If your CPA won't accept our documents, we'll work with 
                them directly at no charge.
              </p>
            </Card>
            <Card className="p-6 text-center">
              <h3 className="font-semibold text-ink mb-2">90-Day Access</h3>
              <p className="text-sm text-ash">
                Download your documents anytime for 90 days. Need them 
                longer? Just ask.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-blue-500 to-emerald-500 py-16 lg:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-paper mb-4">
            Ready to Save Thousands?
          </h2>
          <p className="text-xl text-paper/90 mb-8">
            Calculate your credit and see your exact pricing in 2 minutes
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/#calculator">
              <Button size="lg" className="bg-paper text-blue-600 hover:bg-cloud">
                <FaCalculator className="mr-2" />
                Calculate Your Credit
              </Button>
            </Link>
            <Link href="/sample-documents">
              <Button size="lg" variant="outline" className="border-paper text-paper hover:bg-paper/10">
                View Sample Documents
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default PricingPage;