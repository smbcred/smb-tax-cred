/**
 * @file EnhancedResultsStep.tsx
 * @description Enhanced results display with legislative benefits, QSB analysis, and industry insights
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TrendingUp,
  DollarSign,
  Calendar,
  Users,
  AlertTriangle,
  CheckCircle,
  Info,
  Sparkles,
  Award,
  CreditCard,
  Clock,
  Target,
  BarChart3,
  FileText,
  ArrowUpRight,
  ArrowDownRight,
  ChevronRight,
  Building
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import type { EnhancedCalculationResult } from '@/services/calculation/calculator.engine';

interface EnhancedResultsStepProps {
  results: EnhancedCalculationResult;
  onStartOver: () => void;
  onCaptureLeads: () => void;
}

export function EnhancedResultsStep({ results, onStartOver, onCaptureLeads }: EnhancedResultsStepProps) {
  const [activeTab, setActiveTab] = useState('overview');
  
  const formatCurrency = (amount: number) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(amount);

  const formatNumber = (amount: number) => 
    new Intl.NumberFormat('en-US').format(amount);

  // Confidence color mapping
  const confidenceConfig = {
    high: { color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-950', border: 'border-green-200' },
    medium: { color: 'text-yellow-600', bg: 'bg-yellow-50 dark:bg-yellow-950', border: 'border-yellow-200' },
    low: { color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-950', border: 'border-red-200' }
  };

  const confidence = confidenceConfig[results.confidence];

  return (
    <div className="space-y-6">
      {/* Hero Results Section */}
      <Card className="p-8 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-950 dark:to-indigo-900">
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2">
            <Sparkles className="h-6 w-6 text-blue-600" />
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              Your R&D Tax Credit Analysis
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            {/* Federal Credit */}
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">
                {formatCurrency(results.federalCredit)}
              </div>
              <p className="text-gray-600 dark:text-gray-400">Federal R&D Credit</p>
              <Badge variant="secondary" className="mt-1">{results.effectiveCreditRate}</Badge>
            </div>

            {/* QSB Benefit */}
            <div className="text-center">
              <div className={`text-4xl font-bold mb-2 ${
                results.qsbAnalysis.payrollOffsetAvailable ? 'text-green-600' : 'text-gray-400'
              }`}>
                {results.qsbAnalysis.payrollOffsetAvailable 
                  ? formatCurrency(results.qsbAnalysis.quarterlyBenefit * 4)
                  : formatCurrency(0)
                }
              </div>
              <p className="text-gray-600 dark:text-gray-400">Annual Cash Benefit</p>
              <Badge variant={results.qsbAnalysis.payrollOffsetAvailable ? "default" : "secondary"} className="mt-1">
                {results.qsbAnalysis.payrollOffsetAvailable ? 'QSB Eligible' : 'Traditional Credit'}
              </Badge>
            </div>

            {/* ROI */}
            <div className="text-center">
              <div className="text-4xl font-bold text-emerald-600 mb-2">
                {results.roi.roiMultiple}
              </div>
              <p className="text-gray-600 dark:text-gray-400">Return on Investment</p>
              <Badge variant="secondary" className="mt-1">
                {results.roi.paybackDays ? `${results.roi.paybackDays} day payback` : 'Immediate'}
              </Badge>
            </div>
          </div>

          {/* Confidence Indicator */}
          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${confidence.bg} ${confidence.border} border`}>
            <div className={`w-2 h-2 rounded-full ${
              results.confidence === 'high' ? 'bg-green-500' : 
              results.confidence === 'medium' ? 'bg-yellow-500' : 'bg-red-500'
            }`} />
            <span className={`font-medium ${confidence.color}`}>
              {results.confidence.charAt(0).toUpperCase() + results.confidence.slice(1)} Confidence
            </span>
          </div>
        </div>
      </Card>

      {/* Detailed Analysis Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-2 md:grid-cols-4 w-full">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="qsb" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            QSB Benefits
          </TabsTrigger>
          <TabsTrigger value="legislative" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Legislative
          </TabsTrigger>
          <TabsTrigger value="industry" className="flex items-center gap-2">
            <Building className="h-4 w-4" />
            Industry
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* QRE Breakdown */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <DollarSign className="h-5 w-5 text-blue-600" />
              <h3 className="text-lg font-semibold">Qualified Research Expenses</h3>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-gray-500">Wages</p>
                <p className="text-lg font-semibold">{formatCurrency(results.qreBreakdown.wages)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Contractors</p>
                <p className="text-lg font-semibold">{formatCurrency(results.qreBreakdown.contractors)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Supplies</p>
                <p className="text-lg font-semibold">{formatCurrency(results.qreBreakdown.supplies)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Cloud/Software</p>
                <p className="text-lg font-semibold">{formatCurrency(results.qreBreakdown.cloudAndSoftware)}</p>
              </div>
            </div>

            <Separator className="my-4" />
            <div className="flex justify-between items-center">
              <span className="font-semibold text-lg">Total QRE</span>
              <span className="font-bold text-xl text-blue-600">{formatCurrency(results.qreBreakdown.total)}</span>
            </div>
          </Card>

          {/* Credit Options Comparison */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <CreditCard className="h-5 w-5 text-blue-600" />
              <h3 className="text-lg font-semibold">Section 280C Election Analysis</h3>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className={`p-4 rounded-lg border ${
                results.creditOptions.recommendation === 'full' ? 'border-green-500 bg-green-50 dark:bg-green-950' : 'border-gray-200'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">Full Credit</h4>
                  {results.creditOptions.recommendation === 'full' && (
                    <Badge variant="default">Recommended</Badge>
                  )}
                </div>
                <p className="text-2xl font-bold text-green-600 mb-2">
                  {formatCurrency(results.creditOptions.fullCredit.amount)}
                </p>
                <p className="text-sm text-gray-600 mb-2">{results.creditOptions.fullCredit.complexity}</p>
                <p className="text-sm">
                  <span className="text-gray-500">Net Benefit: </span>
                  <span className="font-medium">{formatCurrency(results.creditOptions.fullCredit.netBenefit)}</span>
                </p>
              </div>

              <div className={`p-4 rounded-lg border ${
                results.creditOptions.recommendation === 'reduced' ? 'border-green-500 bg-green-50 dark:bg-green-950' : 'border-gray-200'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">Reduced Credit</h4>
                  {results.creditOptions.recommendation === 'reduced' && (
                    <Badge variant="default">Recommended</Badge>
                  )}
                </div>
                <p className="text-2xl font-bold text-blue-600 mb-2">
                  {formatCurrency(results.creditOptions.reducedCredit.amount)}
                </p>
                <p className="text-sm text-gray-600 mb-2">{results.creditOptions.reducedCredit.complexity}</p>
                <p className="text-sm">
                  <span className="text-gray-500">Net Benefit: </span>
                  <span className="font-medium">{formatCurrency(results.creditOptions.reducedCredit.netBenefit)}</span>
                </p>
              </div>
            </div>

            <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                <strong>Recommendation:</strong> {results.creditOptions.reasoning}
              </p>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="qsb" className="space-y-6">
          {/* QSB Eligibility Status */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Award className="h-5 w-5 text-blue-600" />
              <h3 className="text-lg font-semibold">Qualified Small Business Status</h3>
            </div>

            <div className={`p-4 rounded-lg border ${
              results.qsbAnalysis.isEligible ? 'border-green-500 bg-green-50 dark:bg-green-950' : 'border-red-500 bg-red-50 dark:bg-red-950'
            }`}>
              <div className="flex items-center gap-2 mb-2">
                {results.qsbAnalysis.isEligible ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                )}
                <h4 className={`font-medium ${results.qsbAnalysis.isEligible ? 'text-green-800 dark:text-green-200' : 'text-red-800 dark:text-red-200'}`}>
                  {results.qsbAnalysis.isEligible ? 'QSB Eligible' : 'QSB Ineligible'}
                </h4>
              </div>
              
              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-500">Current Revenue</p>
                  <p className="font-medium">{formatCurrency(results.qsbAnalysis.currentYearRevenue)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Years in Business</p>
                  <p className="font-medium">{results.qsbAnalysis.yearsInBusiness}</p>
                </div>
              </div>

              <div className="space-y-2">
                {results.qsbAnalysis.eligibilityReasons.map((reason, index) => (
                  <p key={index} className={`text-sm ${
                    results.qsbAnalysis.isEligible ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'
                  }`}>
                    • {reason}
                  </p>
                ))}
              </div>
            </div>
          </Card>

          {/* Cash Flow Comparison */}
          {results.qsbAnalysis.payrollOffsetAvailable && (
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Clock className="h-5 w-5 text-blue-600" />
                <h3 className="text-lg font-semibold">Payroll Tax Offset Benefits</h3>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium text-green-600">With Payroll Offset (Immediate)</h4>
                  <div className="space-y-2">
                    {Object.entries(results.qsbAnalysis.cashFlowComparison.withPayrollOffset).map(([period, amount]) => 
                      period !== 'total' && (
                        <div key={period} className="flex justify-between">
                          <span className="text-sm text-gray-500">{period.toUpperCase()}</span>
                          <span className="font-medium text-green-600">{formatCurrency(amount as number)}</span>
                        </div>
                      )
                    )}
                    <Separator />
                    <div className="flex justify-between font-semibold">
                      <span>Total Year 1</span>
                      <span className="text-green-600">{formatCurrency(results.qsbAnalysis.cashFlowComparison.withPayrollOffset.total)}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium text-blue-600">Traditional Credit (Carryforward)</h4>
                  <div className="space-y-2">
                    {Object.entries(results.qsbAnalysis.cashFlowComparison.traditionalCredit).map(([year, amount]) => 
                      year !== 'yearToBreakeven' && (
                        <div key={year} className="flex justify-between">
                          <span className="text-sm text-gray-500">
                            {year === 'year1' ? 'Year 1' : year === 'year2' ? 'Year 2' : 'Year 3'}
                          </span>
                          <span className="font-medium text-blue-600">{formatCurrency(amount as number)}</span>
                        </div>
                      )
                    )}
                    <Separator />
                    <div className="flex justify-between text-sm">
                      <span>Breakeven</span>
                      <span className="font-medium">Year {results.qsbAnalysis.cashFlowComparison.traditionalCredit.yearToBreakeven}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                <h5 className="font-medium text-green-800 dark:text-green-200 mb-2">Recommended Action</h5>
                <p className="text-green-700 dark:text-green-300 text-sm">{results.qsbAnalysis.recommendedAction}</p>
              </div>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="legislative" className="space-y-6">
          {/* Legislative Context */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="h-5 w-5 text-blue-600" />
              <h3 className="text-lg font-semibold">Legislative Environment ({results.legislativeContext.taxYear})</h3>
            </div>

            <div className="space-y-4">
              {results.legislativeContext.alerts.map((alert, index) => (
                <Alert key={index} className={
                  alert.type === 'benefit' ? 'border-green-200 bg-green-50 dark:bg-green-950' :
                  alert.type === 'warning' ? 'border-yellow-200 bg-yellow-50 dark:bg-yellow-950' :
                  'border-blue-200 bg-blue-50 dark:bg-blue-950'
                }>
                  <div className="flex items-start gap-2">
                    {alert.type === 'benefit' ? (
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                    ) : alert.type === 'warning' ? (
                      <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                    ) : (
                      <Info className="h-5 w-5 text-blue-600 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <h4 className={`font-medium mb-1 ${
                        alert.type === 'benefit' ? 'text-green-800 dark:text-green-200' :
                        alert.type === 'warning' ? 'text-yellow-800 dark:text-yellow-200' :
                        'text-blue-800 dark:text-blue-200'
                      }`}>
                        {alert.message}
                      </h4>
                      <p className={`text-sm ${
                        alert.type === 'benefit' ? 'text-green-700 dark:text-green-300' :
                        alert.type === 'warning' ? 'text-yellow-700 dark:text-yellow-300' :
                        'text-blue-700 dark:text-blue-300'
                      }`}>
                        {alert.impact}
                      </p>
                    </div>
                  </div>
                </Alert>
              ))}
            </div>

            <div className="grid md:grid-cols-3 gap-4 mt-6">
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-sm text-gray-500">Payroll Tax Cap</p>
                <p className="text-lg font-semibold">{formatCurrency(results.legislativeContext.payrollTaxCap)}</p>
              </div>
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-sm text-gray-500">Deduction Rate</p>
                <p className="text-lg font-semibold">{results.legislativeContext.deductionPercentage}%</p>
              </div>
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-sm text-gray-500">Amortization</p>
                <p className="text-lg font-semibold">{results.legislativeContext.amortizationRequired ? 'Required' : 'Optional'}</p>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="industry" className="space-y-6">
          {/* Industry Insights */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Building className="h-5 w-5 text-blue-600" />
              <h3 className="text-lg font-semibold">Industry Insights</h3>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-3">Common Qualifying Activities</h4>
                <ul className="space-y-2">
                  {results.industryInsights.commonActivities.map((activity, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                      {activity}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-4">
                <div className="text-center p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                  <p className="text-sm text-blue-600">Industry Average Credit</p>
                  <p className="text-2xl font-bold text-blue-800 dark:text-blue-200">{results.industryInsights.averageCredit}</p>
                </div>

                <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                  <h5 className="font-medium text-green-800 dark:text-green-200 mb-2">Success Story</h5>
                  <p className="text-sm text-green-700 dark:text-green-300">{results.industryInsights.successStory}</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Service Tier & ROI */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Target className="h-5 w-5 text-blue-600" />
              <h3 className="text-lg font-semibold">Service Recommendation</h3>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                <h4 className="font-medium mb-2">{results.pricingTier.name} Plan</h4>
                <p className="text-2xl font-bold text-blue-600 mb-2">{formatCurrency(results.pricingTier.price)}</p>
                <p className="text-xs text-gray-500">{results.pricingTier.creditRange}</p>
              </div>

              <div className="text-center p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                <h4 className="font-medium mb-2">Net Benefit</h4>
                <p className="text-2xl font-bold text-green-600 mb-2">{formatCurrency(results.roi.netBenefit)}</p>
                <p className="text-xs text-gray-500">After service cost</p>
              </div>

              <div className="text-center p-4 bg-purple-50 dark:bg-purple-950 rounded-lg">
                <h4 className="font-medium mb-2">ROI Multiple</h4>
                <p className="text-2xl font-bold text-purple-600 mb-2">{results.roi.roiMultiple}</p>
                <p className="text-xs text-gray-500">{results.roi.paybackDays ? `${results.roi.paybackDays} day payback` : 'Immediate return'}</p>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Warnings & Assumptions */}
      {(results.warnings.length > 0 || results.assumptions.length > 0) && (
        <Card className="p-6">
          <div className="space-y-4">
            {results.warnings.length > 0 && (
              <div>
                <h4 className="font-medium text-amber-700 dark:text-amber-300 mb-2 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  Important Considerations
                </h4>
                <ul className="space-y-1">
                  {results.warnings.map((warning, index) => (
                    <li key={index} className="text-sm text-amber-600 dark:text-amber-400">• {warning}</li>
                  ))}
                </ul>
              </div>
            )}

            {results.assumptions.length > 0 && (
              <div>
                <h4 className="font-medium text-blue-700 dark:text-blue-300 mb-2 flex items-center gap-2">
                  <Info className="h-4 w-4" />
                  Key Assumptions
                </h4>
                <ul className="space-y-1">
                  {results.assumptions.map((assumption, index) => (
                    <li key={index} className="text-sm text-blue-600 dark:text-blue-400">• {assumption}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="flex gap-4 justify-center">
        <Button onClick={onCaptureLeads} size="lg" className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Get Your Documentation
          <ArrowUpRight className="h-4 w-4" />
        </Button>
        <Button variant="outline" onClick={onStartOver} size="lg" className="flex items-center gap-2">
          Calculate Another Scenario
        </Button>
      </div>
    </div>
  );
}