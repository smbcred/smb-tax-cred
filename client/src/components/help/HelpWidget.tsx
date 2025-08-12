import React, { useState } from 'react';
import { HelpCircle, Search, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Link } from 'wouter';

interface QuickHelpItem {
  id: string;
  question: string;
  answer: string;
  category: string;
  helpUrl?: string;
}

interface HelpWidgetProps {
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  showQuickHelp?: boolean;
  pageContext?: string; // Current page context for contextual help
}

const quickHelpItems: QuickHelpItem[] = [
  {
    id: 'calculator-help',
    question: 'How do I use the calculator?',
    answer: 'Enter your business type and AI-related expenses to get an instant estimate of your potential R&D tax credit.',
    category: 'calculator',
    helpUrl: '/help#calculator-guide'
  },
  {
    id: 'qualification-help',
    question: 'Do I qualify for R&D credits?',
    answer: 'If your business experiments with AI tools, automates processes, or tests new technologies, you likely qualify.',
    category: 'eligibility',
    helpUrl: '/help#qualifying-activities'
  },
  {
    id: 'intake-help',
    question: 'What information do I need for intake?',
    answer: 'You\'ll need company details, descriptions of AI projects, time estimates, and expense information.',
    category: 'process',
    helpUrl: '/help#intake-process'
  },
  {
    id: 'pricing-help',
    question: 'How much does the service cost?',
    answer: 'Pricing is tiered based on your estimated credit: $299 (up to $5K), $599 ($5K-$25K), or $999 (over $25K).',
    category: 'pricing'
  },
  {
    id: 'timeline-help',
    question: 'How long does the process take?',
    answer: 'About 1 week total: 30-60 minutes for intake, then 3-5 business days for document generation.',
    category: 'process'
  }
];

export function HelpWidget({ 
  position = 'bottom-right', 
  showQuickHelp = true,
  pageContext 
}: HelpWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredHelp = quickHelpItems.filter(item => 
    item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (pageContext && item.category === pageContext)
  );

  const contextualHelp = pageContext ? 
    quickHelpItems.filter(item => item.category === pageContext) : [];

  const getPositionClasses = () => {
    switch (position) {
      case 'bottom-left':
        return 'bottom-4 left-4';
      case 'top-right':
        return 'top-4 right-4';
      case 'top-left':
        return 'top-4 left-4';
      default:
        return 'bottom-4 right-4';
    }
  };

  return (
    <div className={`fixed ${getPositionClasses()} z-50`}>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button
            size="lg"
            className="rounded-full shadow-lg hover:scale-105 transition-transform bg-blue-600 hover:bg-blue-700 text-white"
          >
            <HelpCircle className="h-5 w-5 mr-2" />
            Help
          </Button>
        </DialogTrigger>
        
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <HelpCircle className="h-5 w-5 text-blue-600" />
              Quick Help
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="Search for help..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Contextual Help */}
            {pageContext && contextualHelp.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-medium text-slate-900 dark:text-white flex items-center gap-2">
                  Help for this page
                  <Badge variant="outline" className="text-xs">
                    {pageContext}
                  </Badge>
                </h3>
                <div className="space-y-2">
                  {contextualHelp.map(item => (
                    <Card key={item.id} className="border-blue-200 bg-blue-50 dark:bg-blue-950 dark:border-blue-800">
                      <CardContent className="p-4">
                        <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                          {item.question}
                        </h4>
                        <p className="text-sm text-blue-700 dark:text-blue-200 mb-3">
                          {item.answer}
                        </p>
                        {item.helpUrl && (
                          <Link href={item.helpUrl}>
                            <Button variant="outline" size="sm" className="text-xs">
                              Learn more
                              <ExternalLink className="h-3 w-3 ml-1" />
                            </Button>
                          </Link>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Help Items */}
            <div className="space-y-3">
              <h3 className="font-medium text-slate-900 dark:text-white">
                {searchQuery ? 'Search Results' : 'Frequently Asked'}
              </h3>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {filteredHelp.map(item => (
                  <Card key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                    <CardContent className="p-4">
                      <h4 className="font-medium text-slate-900 dark:text-white mb-2">
                        {item.question}
                      </h4>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                        {item.answer}
                      </p>
                      <div className="flex items-center justify-between">
                        <Badge variant="secondary" className="text-xs">
                          {item.category}
                        </Badge>
                        {item.helpUrl && (
                          <Link href={item.helpUrl}>
                            <Button variant="ghost" size="sm" className="text-xs">
                              Learn more
                              <ExternalLink className="h-3 w-3 ml-1" />
                            </Button>
                          </Link>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {filteredHelp.length === 0 && (
                <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                  <HelpCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No help items found.</p>
                  <p className="text-xs">Try different search terms.</p>
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="border-t pt-4 space-y-3">
              <h3 className="font-medium text-slate-900 dark:text-white">
                Need More Help?
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <Link href="/help">
                  <Button variant="outline" className="w-full justify-start">
                    <HelpCircle className="h-4 w-4 mr-2" />
                    Help Center
                  </Button>
                </Link>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => window.open('mailto:help@smbtaxcredits.com', '_blank')}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Contact Support
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default HelpWidget;