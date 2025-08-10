import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Link } from "wouter";
import { Calculator, FileText, CheckCircle2, AlertCircle, TrendingUp, Building2, Code2, FlaskConical, Users, Lightbulb, ArrowRight } from "lucide-react";
import ResponsiveNav from "@/components/navigation/ResponsiveNav";
import { Footer } from "@/components/layout/Footer";

export default function RDCreditGuide() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-cloud-50 to-white">
      {/* Global Navigation */}
      <ResponsiveNav />
      
      {/* Hero Section with padding for fixed nav */}
      <section className="bg-gradient-to-r from-ink-900 to-ink-800 text-white py-16 pt-32">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="mb-4 bg-emerald-500 text-white">Comprehensive Guide</Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              R&D Tax Credit Guide for Small Businesses
            </h1>
            <p className="text-xl text-ash-200 mb-8">
              Everything you need to know about claiming innovation tax credits in 2025
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/calculator">
                <Button size="lg" className="bg-emerald-500 hover:bg-emerald-600 text-white">
                  <Calculator className="mr-2 h-5 w-5" />
                  Calculate Your Credit
                </Button>
              </Link>
              <Link href="/qualifying-activities">
                <Button size="lg" variant="outline" className="bg-white text-ink-900 hover:bg-ash-50">
                  View Qualifying Activities
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Introduction */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">What is the R&D Tax Credit?</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-ash max-w-none">
              <p className="text-lg leading-relaxed mb-4">
                The Research & Development (R&D) tax credit is a federal tax incentive designed to reward U.S. companies for increasing their investment in innovation. Created in 1981 and made permanent in 2015, this credit can reduce your tax liability dollar-for-dollar.
              </p>
              <Alert className="border-emerald-200 bg-emerald-50">
                <TrendingUp className="h-4 w-4 text-emerald-600" />
                <AlertDescription>
                  <strong>Key Benefit:</strong> Small businesses can claim up to $500,000 per year against payroll taxes, making it accessible even for pre-revenue startups.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Who Qualifies */}
      <section className="py-16 bg-cloud-50">
        <div className="container mx-auto px-4 max-w-6xl">
          <h2 className="text-3xl font-bold text-center mb-12">Who Qualifies for R&D Credits?</h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <Building2 className="h-8 w-8 text-ink-600 mb-2" />
                <CardTitle>Professional Services</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <CheckCircle2 className="h-5 w-5 text-emerald-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Custom software development</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="h-5 w-5 text-emerald-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Process automation solutions</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="h-5 w-5 text-emerald-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Data analytics platforms</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <Code2 className="h-8 w-8 text-ink-600 mb-2" />
                <CardTitle>Technology Companies</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <CheckCircle2 className="h-5 w-5 text-emerald-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span>SaaS platform development</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="h-5 w-5 text-emerald-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span>AI/ML implementation</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="h-5 w-5 text-emerald-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span>API integrations</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <FlaskConical className="h-8 w-8 text-ink-600 mb-2" />
                <CardTitle>Healthcare & Life Sciences</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <CheckCircle2 className="h-5 w-5 text-emerald-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Medical device software</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="h-5 w-5 text-emerald-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Telehealth platforms</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="h-5 w-5 text-emerald-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Clinical data systems</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Four-Part Test */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="text-3xl font-bold text-center mb-12">The Four-Part Test for R&D Activities</h2>
          
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center">
                    <span className="font-bold text-emerald-700">1</span>
                  </div>
                  <CardTitle>Technological in Nature</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-ash-600">
                  The activity must rely on principles of engineering, computer science, biological science, or physical science.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center">
                    <span className="font-bold text-emerald-700">2</span>
                  </div>
                  <CardTitle>Elimination of Uncertainty</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-ash-600">
                  You must be attempting to eliminate technical uncertainty about the development or improvement of a product or process.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center">
                    <span className="font-bold text-emerald-700">3</span>
                  </div>
                  <CardTitle>Process of Experimentation</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-ash-600">
                  You must evaluate alternatives through modeling, simulation, systematic trial and error, or other methods.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center">
                    <span className="font-bold text-emerald-700">4</span>
                  </div>
                  <CardTitle>Qualified Purpose</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-ash-600">
                  The activity must be for creating new or improved functionality, performance, reliability, or quality of a product or process.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Calculation Methods */}
      <section className="py-16 bg-cloud-50">
        <div className="container mx-auto px-4 max-w-6xl">
          <h2 className="text-3xl font-bold text-center mb-12">Credit Calculation Methods</h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="border-2 border-emerald-200">
              <CardHeader>
                <Badge className="w-fit mb-2 bg-emerald-100 text-emerald-700">Recommended for SMBs</Badge>
                <CardTitle className="text-2xl">Alternative Simplified Credit (ASC)</CardTitle>
                <CardDescription>Best for companies with less than $50M in revenue</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="bg-emerald-50 p-4 rounded-lg">
                    <p className="font-semibold mb-2">Credit Rate: 14%</p>
                    <p className="text-sm text-ash-600">Of current year QREs exceeding 50% of prior 3-year average</p>
                  </div>
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <CheckCircle2 className="h-5 w-5 text-emerald-500 mr-2 mt-0.5" />
                      <span>Simpler calculation method</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle2 className="h-5 w-5 text-emerald-500 mr-2 mt-0.5" />
                      <span>No base amount complications</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle2 className="h-5 w-5 text-emerald-500 mr-2 mt-0.5" />
                      <span>Perfect for growing companies</span>
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Regular Credit Method (RRC)</CardTitle>
                <CardDescription>Traditional method for established companies</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="bg-ash-50 p-4 rounded-lg">
                    <p className="font-semibold mb-2">Credit Rate: 20%</p>
                    <p className="text-sm text-ash-600">Of QREs exceeding a computed base amount</p>
                  </div>
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <AlertCircle className="h-5 w-5 text-amber-500 mr-2 mt-0.5" />
                      <span>Complex base calculations</span>
                    </li>
                    <li className="flex items-start">
                      <AlertCircle className="h-5 w-5 text-amber-500 mr-2 mt-0.5" />
                      <span>Requires historical data</span>
                    </li>
                    <li className="flex items-start">
                      <AlertCircle className="h-5 w-5 text-amber-500 mr-2 mt-0.5" />
                      <span>May yield lower credits for SMBs</span>
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Qualified Expenses */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="text-3xl font-bold text-center mb-12">Qualified Research Expenses (QREs)</h2>
          
          <Card>
            <CardContent className="pt-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-lg mb-4 flex items-center">
                    <CheckCircle2 className="h-5 w-5 text-emerald-500 mr-2" />
                    Eligible Expenses
                  </h3>
                  <ul className="space-y-3">
                    <li className="pl-7">
                      <strong>W-2 Wages:</strong> Salaries for employees directly performing, supervising, or supporting R&D
                    </li>
                    <li className="pl-7">
                      <strong>1099 Contractors:</strong> 65% of amounts paid for qualified research services
                    </li>
                    <li className="pl-7">
                      <strong>Supplies:</strong> Materials used in R&D process (not capital equipment)
                    </li>
                    <li className="pl-7">
                      <strong>Cloud Computing:</strong> AWS, Azure, GCP costs for development environments
                    </li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="font-semibold text-lg mb-4 flex items-center">
                    <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                    Non-Eligible Expenses
                  </h3>
                  <ul className="space-y-3">
                    <li className="pl-7">
                      <strong>Land/Buildings:</strong> Capital expenditures and depreciation
                    </li>
                    <li className="pl-7">
                      <strong>General Admin:</strong> Overhead, utilities, and rent
                    </li>
                    <li className="pl-7">
                      <strong>Foreign Research:</strong> Work performed outside the U.S.
                    </li>
                    <li className="pl-7">
                      <strong>Funded Research:</strong> Work paid for by grants or customers
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-ink-900 to-ink-800 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Claim Your R&D Tax Credit?</h2>
          <p className="text-xl text-ash-200 mb-8 max-w-2xl mx-auto">
            Our automated platform makes it easy to calculate, document, and claim your innovation tax credits.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/calculator">
              <Button size="lg" className="bg-emerald-500 hover:bg-emerald-600 text-white">
                <Calculator className="mr-2 h-5 w-5" />
                Start Free Calculation
              </Button>
            </Link>
            <Link href="/qualifying-activities">
              <Button size="lg" variant="outline" className="bg-white text-ink-900 hover:bg-ash-50">
                <FileText className="mr-2 h-5 w-5" />
                See Qualifying Activities
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Global Footer */}
      <Footer />
    </div>
  );
}