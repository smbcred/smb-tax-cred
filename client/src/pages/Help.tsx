import React, { useState } from 'react';
import { Search, BookOpen, MessageCircle, FileText, AlertCircle, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

interface HelpArticle {
  id: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  content: string;
  lastUpdated: string;
}

interface FAQItem {
  question: string;
  answer: string;
  category: string;
  popular: boolean;
}

const helpArticles: HelpArticle[] = [
  {
    id: 'getting-started',
    title: 'Getting Started Guide',
    description: 'Complete guide to using SMBTaxCredits.com effectively',
    category: 'Getting Started',
    tags: ['basics', 'overview', 'first-time'],
    content: 'Complete walkthrough of our platform...',
    lastUpdated: '2024-01-15'
  },
  {
    id: 'qualifying-activities',
    title: 'What AI Activities Qualify for R&D Credits?',
    description: 'Learn which AI experiments and implementations qualify',
    category: 'Eligibility',
    tags: ['qualification', 'ai', 'activities'],
    content: 'Detailed explanation of qualifying activities...',
    lastUpdated: '2024-01-14'
  },
  {
    id: 'calculator-guide',
    title: 'How to Use the R&D Tax Credit Calculator',
    description: 'Step-by-step guide to getting accurate estimates',
    category: 'Calculator',
    tags: ['calculator', 'estimates', 'tutorial'],
    content: 'Complete calculator tutorial...',
    lastUpdated: '2024-01-13'
  },
  {
    id: 'intake-process',
    title: 'Completing Your Intake Form',
    description: 'Tips for providing accurate information in your intake',
    category: 'Process',
    tags: ['intake', 'forms', 'documentation'],
    content: 'Intake form completion guide...',
    lastUpdated: '2024-01-12'
  },
  {
    id: 'mobile-tips',
    title: 'Using SMBTaxCredits.com on Mobile',
    description: 'Optimize your experience on phones and tablets',
    category: 'Technical',
    tags: ['mobile', 'responsive', 'tips'],
    content: 'Mobile usage optimization guide...',
    lastUpdated: '2024-01-11'
  }
];

const faqData: FAQItem[] = [
  {
    question: 'How much can I save with R&D tax credits?',
    answer: 'R&D tax credits can be worth 6-14% of your qualifying expenses, up to $250,000 per year for small businesses. For example, $100,000 in AI-related expenses could result in $6,000-$14,000 in tax credits.',
    category: 'general',
    popular: true
  },
  {
    question: 'Do I qualify if I just use AI tools like ChatGPT?',
    answer: 'Potentially yes! If you\'re experimenting with AI tools to improve business processes, testing different solutions, or implementing new AI-powered workflows, you may qualify. The key is experimentation and implementation, not just routine use.',
    category: 'eligibility',
    popular: true
  },
  {
    question: 'How long does the documentation process take?',
    answer: 'The complete process typically takes 1 week: 30-60 minutes to complete your intake form, then 3-5 business days for our team to generate your IRS-compliant documentation package.',
    category: 'process',
    popular: true
  },
  {
    question: 'What if I don\'t have detailed time tracking?',
    answer: 'That\'s common! We help you estimate time spent on AI activities based on project descriptions, number of employees involved, and duration of experiments. Perfect records aren\'t required.',
    category: 'documentation',
    popular: false
  },
  {
    question: 'Can I claim credits for previous years?',
    answer: 'Yes, you can typically claim R&D credits for the past 3 years if you have qualifying activities and haven\'t already claimed them. We can help document historical activities.',
    category: 'eligibility',
    popular: false
  },
  {
    question: 'Is my data secure?',
    answer: 'Yes. We use enterprise-grade security including 256-bit SSL encryption, SOC 2 compliant data handling, and strict data retention policies. We never store sensitive financial information unnecessarily.',
    category: 'technical',
    popular: false
  }
];

export default function Help() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const filteredArticles = helpArticles.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         article.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         article.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || article.category.toLowerCase() === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const filteredFAQ = faqData.filter(faq => 
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const popularFAQ = faqData.filter(faq => faq.popular);
  const categories = ['all', ...Array.from(new Set(helpArticles.map(article => article.category.toLowerCase())))];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-emerald-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
      {/* Header */}
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-b border-slate-200/50 dark:border-slate-700/50">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
              Help Center
            </h1>
            <p className="text-xl text-slate-600 dark:text-slate-300 mb-6">
              Get the most out of SMBTaxCredits.com
            </p>
            
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
              <Input
                type="text"
                placeholder="Search for help articles, FAQs, or topics..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-3 text-lg border-slate-200 dark:border-slate-700 focus:border-blue-500 dark:focus:border-blue-400"
              />
            </div>
          </div>

          {/* Quick Links */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer border-slate-200 dark:border-slate-700">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                  <BookOpen className="h-5 w-5" />
                  Getting Started
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  New to our platform? Start here for a complete overview.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer border-slate-200 dark:border-slate-700">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                  <MessageCircle className="h-5 w-5" />
                  FAQ
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Quick answers to the most common questions.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer border-slate-200 dark:border-slate-700">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
                  <AlertCircle className="h-5 w-5" />
                  Troubleshooting
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Having issues? Find solutions to common problems.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer border-slate-200 dark:border-slate-700">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-purple-600 dark:text-purple-400">
                  <FileText className="h-5 w-5" />
                  API Docs
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Technical documentation for developers.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="articles" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="articles">Help Articles</TabsTrigger>
            <TabsTrigger value="faq">FAQ</TabsTrigger>
            <TabsTrigger value="contact">Contact Support</TabsTrigger>
          </TabsList>

          <TabsContent value="articles" className="space-y-6">
            {/* Category Filter */}
            <div className="flex flex-wrap gap-2 mb-6">
              {categories.map(category => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                  className="capitalize"
                >
                  {category === 'all' ? 'All Categories' : category}
                </Button>
              ))}
            </div>

            {/* Articles Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredArticles.map(article => (
                <Card key={article.id} className="hover:shadow-lg transition-shadow border-slate-200 dark:border-slate-700">
                  <CardHeader>
                    <div className="flex items-start justify-between mb-2">
                      <Badge variant="outline" className="text-xs">
                        {article.category}
                      </Badge>
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        {new Date(article.lastUpdated).toLocaleDateString()}
                      </span>
                    </div>
                    <CardTitle className="text-lg text-slate-900 dark:text-white">
                      {article.title}
                    </CardTitle>
                    <CardDescription className="text-slate-600 dark:text-slate-400">
                      {article.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-1 mb-4">
                      {article.tags.map(tag => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <Button variant="outline" size="sm" className="w-full">
                      Read Article
                      <ExternalLink className="h-3 w-3 ml-1" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredArticles.length === 0 && (
              <div className="text-center py-12">
                <AlertCircle className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
                  No articles found
                </h3>
                <p className="text-slate-600 dark:text-slate-400">
                  Try adjusting your search terms or browse by category.
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="faq" className="space-y-6">
            {/* Popular FAQ */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
                Popular Questions
              </h2>
              <Accordion type="single" collapsible className="space-y-2">
                {popularFAQ.map((faq, index) => (
                  <AccordionItem key={index} value={`popular-${index}`} className="border border-slate-200 dark:border-slate-700 rounded-lg px-4">
                    <AccordionTrigger className="text-left font-medium text-slate-900 dark:text-white">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-slate-600 dark:text-slate-400 pb-4">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>

            {/* All FAQ */}
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
                All Questions
              </h2>
              <Accordion type="single" collapsible className="space-y-2">
                {filteredFAQ.map((faq, index) => (
                  <AccordionItem key={index} value={`all-${index}`} className="border border-slate-200 dark:border-slate-700 rounded-lg px-4">
                    <AccordionTrigger className="text-left font-medium text-slate-900 dark:text-white">
                      <div className="flex items-center gap-2">
                        {faq.question}
                        {faq.popular && (
                          <Badge variant="secondary" className="text-xs">
                            Popular
                          </Badge>
                        )}
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="text-slate-600 dark:text-slate-400 pb-4">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>

            {filteredFAQ.length === 0 && (
              <div className="text-center py-12">
                <MessageCircle className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
                  No FAQ found
                </h3>
                <p className="text-slate-600 dark:text-slate-400">
                  Try different search terms or contact support for help.
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="contact" className="space-y-6">
            <div className="max-w-2xl mx-auto">
              <Card className="border-slate-200 dark:border-slate-700">
                <CardHeader>
                  <CardTitle className="text-slate-900 dark:text-white">
                    Contact Support
                  </CardTitle>
                  <CardDescription className="text-slate-600 dark:text-slate-400">
                    Can't find what you're looking for? Our support team is here to help.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium text-slate-900 dark:text-white mb-2">
                        Email Support
                      </h4>
                      <p className="text-slate-600 dark:text-slate-400 mb-3">
                        Get help with technical issues, account questions, or general inquiries.
                      </p>
                      <Button variant="outline" className="w-full">
                        Email help@smbtaxcredits.com
                        <ExternalLink className="h-4 w-4 ml-2" />
                      </Button>
                    </div>

                    <div>
                      <h4 className="font-medium text-slate-900 dark:text-white mb-2">
                        Response Time
                      </h4>
                      <p className="text-slate-600 dark:text-slate-400 mb-3">
                        We respond to all support requests within 24 hours during business days.
                      </p>
                      <div className="text-sm text-slate-500 dark:text-slate-400">
                        Business hours: Mon-Fri, 9 AM - 6 PM EST
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-slate-200 dark:border-slate-700 pt-6">
                    <h4 className="font-medium text-slate-900 dark:text-white mb-2">
                      What We Can Help With
                    </h4>
                    <ul className="space-y-1 text-slate-600 dark:text-slate-400">
                      <li>• Technical problems with our platform</li>
                      <li>• Questions about the intake process</li>
                      <li>• Clarification on qualifying activities</li>
                      <li>• Payment and billing issues</li>
                      <li>• Document access and delivery</li>
                    </ul>
                  </div>

                  <div className="border-t border-slate-200 dark:border-slate-700 pt-6">
                    <h4 className="font-medium text-slate-900 dark:text-white mb-2">
                      What We Cannot Help With
                    </h4>
                    <ul className="space-y-1 text-slate-600 dark:text-slate-400">
                      <li>• Tax advice or preparation services</li>
                      <li>• IRS representation or audit support</li>
                      <li>• Legal counsel</li>
                      <li>• Financial planning advice</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}