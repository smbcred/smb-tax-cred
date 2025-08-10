import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Link } from "wouter";
import { 
  Calculator, 
  CheckCircle2, 
  XCircle, 
  Code2, 
  Cpu, 
  Database, 
  Cloud, 
  Shield, 
  Smartphone,
  Globe,
  BarChart3,
  Zap,
  Package,
  Wrench,
  AlertCircle 
} from "lucide-react";

const industryActivities = {
  software: {
    title: "Software Development",
    icon: Code2,
    qualifying: [
      "Developing new algorithms or computational methods",
      "Creating custom APIs and integration solutions",
      "Building AI/ML models for business applications",
      "Implementing blockchain or distributed systems",
      "Developing cloud-native architectures",
      "Creating automated testing frameworks",
      "Building real-time data processing systems",
      "Developing cross-platform mobile applications"
    ],
    nonQualifying: [
      "Routine website updates and maintenance",
      "Installing off-the-shelf software",
      "Data entry or migration without transformation",
      "Cosmetic UI changes without functionality improvements"
    ]
  },
  ecommerce: {
    title: "E-commerce & Retail",
    icon: Package,
    qualifying: [
      "Developing recommendation engines",
      "Creating dynamic pricing algorithms",
      "Building inventory optimization systems",
      "Implementing AR/VR for virtual try-ons",
      "Developing fraud detection systems",
      "Creating personalized shopping experiences",
      "Building supply chain automation",
      "Developing predictive analytics for demand"
    ],
    nonQualifying: [
      "Basic product catalog updates",
      "Standard payment gateway integration",
      "Routine order processing",
      "Basic email marketing campaigns"
    ]
  },
  healthcare: {
    title: "Healthcare & Medical",
    icon: Shield,
    qualifying: [
      "Developing telehealth platforms",
      "Creating patient data analytics systems",
      "Building HIPAA-compliant infrastructure",
      "Implementing medical imaging AI",
      "Developing clinical decision support systems",
      "Creating interoperability solutions for EHRs",
      "Building remote patient monitoring systems",
      "Developing automated diagnostic tools"
    ],
    nonQualifying: [
      "Routine EHR data entry",
      "Standard appointment scheduling",
      "Basic patient portal maintenance",
      "Regular compliance reporting"
    ]
  },
  fintech: {
    title: "Financial Services",
    icon: BarChart3,
    qualifying: [
      "Developing risk assessment models",
      "Creating automated trading algorithms",
      "Building blockchain payment systems",
      "Implementing fraud detection ML models",
      "Developing regulatory compliance automation",
      "Creating credit scoring algorithms",
      "Building real-time transaction processing",
      "Developing cryptocurrency platforms"
    ],
    nonQualifying: [
      "Standard accounting procedures",
      "Routine financial reporting",
      "Basic payment processing",
      "Manual data reconciliation"
    ]
  },
  manufacturing: {
    title: "Manufacturing & IoT",
    icon: Cpu,
    qualifying: [
      "Developing predictive maintenance systems",
      "Creating IoT sensor networks",
      "Building quality control automation",
      "Implementing computer vision for inspection",
      "Developing digital twin simulations",
      "Creating robotic process automation",
      "Building supply chain optimization",
      "Developing energy efficiency systems"
    ],
    nonQualifying: [
      "Routine equipment maintenance",
      "Standard production line operations",
      "Basic inventory management",
      "Manual quality checks"
    ]
  }
};

export default function QualifyingActivities() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-cloud-50 to-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-ink-900 to-ink-800 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="mb-4 bg-emerald-500 text-white">2025 IRS Guidelines</Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Qualifying R&D Activities
            </h1>
            <p className="text-xl text-ash-200 mb-8">
              Discover which innovation activities qualify for federal tax credits
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/calculator">
                <Button size="lg" className="bg-emerald-500 hover:bg-emerald-600 text-white">
                  <Calculator className="mr-2 h-5 w-5" />
                  Calculate Your Credit
                </Button>
              </Link>
              <Link href="/rd-credit-guide">
                <Button size="lg" variant="outline" className="bg-white text-ink-900 hover:bg-ash-50">
                  Read Full Guide
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Assessment */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-6xl">
          <Alert className="border-emerald-200 bg-emerald-50 mb-8">
            <AlertCircle className="h-4 w-4 text-emerald-600" />
            <AlertDescription>
              <strong>Remember:</strong> Activities must meet all four parts of the IRS test: Technological in Nature, 
              Elimination of Uncertainty, Process of Experimentation, and Qualified Purpose.
            </AlertDescription>
          </Alert>

          <h2 className="text-3xl font-bold text-center mb-12">Activities by Industry</h2>
          
          <Tabs defaultValue="software" className="w-full">
            <TabsList className="grid grid-cols-2 md:grid-cols-5 h-auto p-1">
              {Object.entries(industryActivities).map(([key, industry]) => {
                const Icon = industry.icon;
                return (
                  <TabsTrigger 
                    key={key} 
                    value={key}
                    className="flex flex-col gap-1 py-3"
                  >
                    <Icon className="h-5 w-5" />
                    <span className="text-xs">{industry.title}</span>
                  </TabsTrigger>
                );
              })}
            </TabsList>

            {Object.entries(industryActivities).map(([key, industry]) => (
              <TabsContent key={key} value={key} className="mt-8">
                <div className="grid md:grid-cols-2 gap-6">
                  <Card className="border-emerald-200">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-emerald-700">
                        <CheckCircle2 className="h-6 w-6" />
                        Qualifying Activities
                      </CardTitle>
                      <CardDescription>These activities typically qualify for R&D tax credits</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-3">
                        {industry.qualifying.map((activity, index) => (
                          <li key={index} className="flex items-start">
                            <CheckCircle2 className="h-5 w-5 text-emerald-500 mr-3 mt-0.5 flex-shrink-0" />
                            <span className="text-ash-700">{activity}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>

                  <Card className="border-red-200">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-red-700">
                        <XCircle className="h-6 w-6" />
                        Non-Qualifying Activities
                      </CardTitle>
                      <CardDescription>These activities typically do NOT qualify</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-3">
                        {industry.nonQualifying.map((activity, index) => (
                          <li key={index} className="flex items-start">
                            <XCircle className="h-5 w-5 text-red-500 mr-3 mt-0.5 flex-shrink-0" />
                            <span className="text-ash-700">{activity}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </section>

      {/* Common Technology Activities */}
      <section className="py-16 bg-cloud-50">
        <div className="container mx-auto px-4 max-w-6xl">
          <h2 className="text-3xl font-bold text-center mb-12">Common Technology Activities That Qualify</h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-emerald-100 flex items-center justify-center mb-4">
                  <Database className="h-6 w-6 text-emerald-600" />
                </div>
                <CardTitle>Data Engineering</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-ash-600">
                  <li>• ETL pipeline development</li>
                  <li>• Data lake architecture</li>
                  <li>• Real-time streaming systems</li>
                  <li>• Data warehouse optimization</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-emerald-100 flex items-center justify-center mb-4">
                  <Cloud className="h-6 w-6 text-emerald-600" />
                </div>
                <CardTitle>Cloud Architecture</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-ash-600">
                  <li>• Microservices development</li>
                  <li>• Serverless implementations</li>
                  <li>• Container orchestration</li>
                  <li>• Multi-cloud strategies</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-emerald-100 flex items-center justify-center mb-4">
                  <Zap className="h-6 w-6 text-emerald-600" />
                </div>
                <CardTitle>Process Automation</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-ash-600">
                  <li>• RPA development</li>
                  <li>• Workflow optimization</li>
                  <li>• Business process automation</li>
                  <li>• Integration platforms</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-emerald-100 flex items-center justify-center mb-4">
                  <Shield className="h-6 w-6 text-emerald-600" />
                </div>
                <CardTitle>Cybersecurity</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-ash-600">
                  <li>• Threat detection systems</li>
                  <li>• Encryption protocols</li>
                  <li>• Zero-trust architecture</li>
                  <li>• Security automation</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-emerald-100 flex items-center justify-center mb-4">
                  <Smartphone className="h-6 w-6 text-emerald-600" />
                </div>
                <CardTitle>Mobile Development</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-ash-600">
                  <li>• Native app development</li>
                  <li>• Cross-platform frameworks</li>
                  <li>• Offline synchronization</li>
                  <li>• Push notification systems</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-emerald-100 flex items-center justify-center mb-4">
                  <Globe className="h-6 w-6 text-emerald-600" />
                </div>
                <CardTitle>Web Technologies</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-ash-600">
                  <li>• Progressive web apps</li>
                  <li>• Real-time collaboration</li>
                  <li>• WebRTC implementations</li>
                  <li>• Performance optimization</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Documentation Tips */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="text-3xl font-bold text-center mb-12">Documentation Best Practices</h2>
          
          <Card>
            <CardHeader>
              <CardTitle>What to Document for Each Activity</CardTitle>
              <CardDescription>Proper documentation is crucial for claiming R&D tax credits</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-3 flex items-center">
                    <Wrench className="h-5 w-5 text-ink-600 mr-2" />
                    Technical Documentation
                  </h3>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span>Design documents and specifications</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span>Testing protocols and results</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span>Code repositories and commits</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span>Meeting notes and decisions</span>
                    </li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-3 flex items-center">
                    <BarChart3 className="h-5 w-5 text-ink-600 mr-2" />
                    Business Documentation
                  </h3>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span>Project timelines and milestones</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span>Employee time tracking</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span>Contractor invoices and SOWs</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span>Supply and cloud service receipts</span>
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
          <h2 className="text-3xl font-bold mb-6">Not Sure If Your Activities Qualify?</h2>
          <p className="text-xl text-ash-200 mb-8 max-w-2xl mx-auto">
            Use our free calculator to estimate your potential credit based on your specific activities and expenses.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/calculator">
              <Button size="lg" className="bg-emerald-500 hover:bg-emerald-600 text-white">
                <Calculator className="mr-2 h-5 w-5" />
                Calculate Your Credit
              </Button>
            </Link>
            <Link href="/how-it-works">
              <Button size="lg" variant="outline" className="bg-white text-ink-900 hover:bg-ash-50">
                Learn How It Works
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}