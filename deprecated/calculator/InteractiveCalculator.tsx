/**
 * @file InteractiveCalculator.tsx
 * @description Main interactive R&D tax credit calculator component
 * @author SMBTaxCredits.com Team
 * @date 2024-01-15
 */

import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Calculator, 
  DollarSign, 
  Users, 
  Cloud, 
  TrendingUp, 
  ArrowRight,
  CheckCircle
} from "lucide-react";
import { calculateRDTaxCredit, businessTypes } from "@/services/calculator.service";
import type { CalculatorExpenses, CalculationResult } from "@shared/schema";
import { formatCurrency } from "@/utils/calculations";
import { CalculatorEvents } from "@/utils/analyticsEvents";

// CTA Button with development mode gating
interface CTAButtonProps {
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
  children: React.ReactNode;
  results: CalculationResult;
  onDebugLog?: (message: string) => void;
}

function CTAButton({ size = 'default', className, children, results, onDebugLog }: CTAButtonProps) {
  const isDevelopment = import.meta.env.DEV;
  const minEligibleCredit = 5000;
  const isEligible = results.federalCredit >= minEligibleCredit;
  
  const handleClick = () => {
    if (isDevelopment) {
      const debugInfo = {
        mode: 'development',
        eligible: isEligible,
        federalCredit: results.federalCredit,
        minRequired: minEligibleCredit,
        timestamp: new Date().toISOString()
      };
      
      const message = `CTA clicked in development mode - Eligible: ${isEligible}, Credit: $${results.federalCredit.toLocaleString()}`;
      onDebugLog?.(message);
      console.log('[CTA Debug]:', debugInfo);
      
      // Show alert in development
      alert(`Development Mode:\n\nCredit Amount: $${results.federalCredit.toLocaleString()}\nEligible for service: ${isEligible ? 'Yes' : 'No'}\nMinimum required: $${minEligibleCredit.toLocaleString()}`);
    } else {
      // Production behavior
      if (isEligible) {
        window.location.href = '/get-started';
      } else {
        // Track low-value leads differently
        console.log('Low-value lead:', results);
      }
    }
  };
  
  return (
    <Button 
      size={size} 
      className={`${className} ${!isEligible ? 'opacity-50 cursor-not-allowed' : ''}`}
      onClick={handleClick}
      disabled={!isEligible && !isDevelopment}
      variant={isEligible ? 'default' : 'outline'}
      title={!isEligible ? `Minimum credit of $${minEligibleCredit.toLocaleString()} required` : ''}
    >
      {children}
    </Button>
  );
}

interface CalculatorState extends CalculatorExpenses {
  businessType: string;
  hasQualifyingActivities: boolean;
}

export function InteractiveCalculator() {
  const [state, setState] = useState<CalculatorState>({
    wages: 0,
    contractors: 0,
    supplies: 0,
    cloud: 0,
    businessType: '',
    hasQualifyingActivities: false,
  });
  
  const [step, setStep] = useState(1);
  const [showResults, setShowResults] = useState(false);
  const [calculatorStartTime] = useState(Date.now());

  const updateState = (updates: Partial<CalculatorState>) => {
    setState(prev => ({ ...prev, ...updates }));
  };

  const calculateResults = (): CalculationResult => {
    const expenses: CalculatorExpenses = {
      wages: state.wages,
      contractors: state.contractors,
      supplies: state.supplies,
      cloud: state.cloud
    };
    return calculateRDTaxCredit(expenses);
  };

  const handleCalculate = () => {
    const results = calculateResults();
    const timeSpent = Date.now() - calculatorStartTime;
    
    // Track calculator completion analytics
    CalculatorEvents.completed(
      {
        federalCredit: results.federalCredit,
        totalQRE: results.totalQRE,
        pricingTier: results.pricingTier,
        businessType: state.businessType
      },
      timeSpent
    );
    
    // Development debug logging
    if (import.meta.env.DEV) {
      console.log('[ANALYTICS DEBUG] calc.completed:', {
        federalCredit: results.federalCredit,
        totalQRE: results.totalQRE,
        timeSpent: `${(timeSpent / 1000).toFixed(1)}s`,
        businessType: state.businessType,
        expenses: {
          wages: state.wages,
          contractors: state.contractors,
          supplies: state.supplies,
          cloud: state.cloud
        }
      });
    }
    
    setShowResults(true);
  };

  const resetCalculator = () => {
    setState({
      wages: 0,
      contractors: 0,
      supplies: 0,
      cloud: 0,
      businessType: '',
      hasQualifyingActivities: false,
    });
    setStep(1);
    setShowResults(false);
  };

  const results = showResults ? calculateResults() : null;

  if (showResults && results) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto"
      >
        <Card className="overflow-hidden shadow-xl border-0">
          <CardHeader className="bg-gradient-to-r from-emerald-500 to-blue-600 text-white dark:from-emerald-600 dark:to-blue-700">
            <CardTitle className="flex items-center gap-2 text-2xl">
              <TrendingUp className="h-6 w-6" />
              Your R&D Tax Credit Estimate
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 sm:p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
              {/* Results Summary */}
              <div className="space-y-6">
                <div className="text-center">
                  <div className="text-4xl font-bold text-green-600 mb-2">
                    {formatCurrency(results.federalCredit)}
                  </div>
                  <p className="text-gray-600">Estimated Federal R&D Tax Credit</p>
                </div>
                
                <Separator />
                
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Qualified Research Expenses</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Employee Wages:</span>
                      <span className="font-medium">{formatCurrency(state.wages)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Contractor Costs (65%):</span>
                      <span className="font-medium">{formatCurrency(state.contractors * 0.65)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Software & Supplies:</span>
                      <span className="font-medium">{formatCurrency(state.supplies)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Cloud & Hosting:</span>
                      <span className="font-medium">{formatCurrency(state.cloud)}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-semibold">
                      <span>Total QRE:</span>
                      <span>{formatCurrency(results.totalQRE)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Service Tier */}
              <div className="space-y-6">
                <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
                  <h3 className="font-semibold text-lg mb-4">Recommended Service Tier</h3>
                  <div className="text-center">
                    <Badge variant="outline" className="text-lg px-3 py-1 mb-2">
                      Tier {results.pricingTier}
                    </Badge>
                    <div className="text-2xl font-bold text-blue-600 mb-2">
                      {formatCurrency(results.pricingAmount)}
                    </div>
                    <p className="text-sm text-gray-600 mb-4">
                      Professional documentation service
                    </p>
                    <div className="flex items-center gap-2 text-sm text-green-600">
                      <CheckCircle className="h-4 w-4" />
                      <span>ROI: {Math.round((results.federalCredit / results.pricingAmount) * 100)}%</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">What's Included:</h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                      IRS-compliant documentation
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                      Form 6765 preparation
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                      Detailed activity narratives
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                      Audit support materials
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mt-8 pt-6 border-t">
              <CTAButton 
                size="lg" 
                className="flex-1" 
                results={calculateResults()}
                onDebugLog={(message) => console.log('[DEV DEBUG]:', message)}
              >
                Get Professional Documentation
                <ArrowRight className="ml-2 h-4 w-4" />
              </CTAButton>
              <Button size="lg" variant="outline" onClick={resetCalculator}>
                Calculate Another Scenario
              </Button>
            </div>

            {/* Disclaimer */}
            <p className="text-xs text-gray-500 mt-4 text-center">
              * This is a preliminary estimate. Final credit amount depends on detailed analysis of your specific activities and documentation.
            </p>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <Card className="shadow-lg border-0 bg-card dark:bg-card">
        <CardHeader className="pb-6">
          <CardTitle className="flex items-center gap-3 text-2xl font-semibold text-foreground">
            <Calculator className="h-7 w-7 text-primary" />
            R&D Tax Credit Calculator
          </CardTitle>
          <p className="text-muted-foreground text-base mt-2">
            Get an instant estimate of your potential federal R&D tax credits
          </p>
        </CardHeader>
        <CardContent className="space-y-8 p-6 sm:p-8">
          {/* Business Type Selection */}
          {step === 1 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <div>
                <h3 className="text-xl font-semibold mb-6 text-foreground">What type of business are you?</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {businessTypes.map((type) => (
                    <button
                      key={type.id}
                      data-testid={`business-type-${type.id}`}
                      onClick={() => {
                        updateState({ businessType: type.id });
                        
                        // Track calculator start analytics
                        CalculatorEvents.start('calculator_widget');
                        
                        // Development debug logging
                        if (import.meta.env.DEV) {
                          console.log('[ANALYTICS DEBUG] calc.started:', {
                            businessType: type.id,
                            source: 'calculator_widget',
                            timestamp: new Date().toISOString()
                          });
                        }
                        
                        setStep(2);
                      }}
                      className={`group p-6 border-2 rounded-xl text-left hover:border-primary hover:bg-accent/50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                        state.businessType === type.id 
                          ? 'border-primary bg-primary/5 ring-2 ring-primary ring-offset-2' 
                          : 'border-border bg-card hover:shadow-md'
                      }`}
                    >
                      <h4 className="font-semibold mb-2 text-card-foreground group-hover:text-primary transition-colors">{type.name}</h4>
                      <p className="text-sm text-muted-foreground leading-relaxed">{type.description}</p>
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* Expense Inputs */}
          {step === 2 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <div>
                <h3 className="text-xl font-semibold mb-6 text-foreground">Enter your annual R&D expenses</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="wages" className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Technical Employee Wages
                    </Label>
                    <Input
                      id="wages"
                      data-testid="wages-input"
                      type="number"
                      placeholder="0"
                      value={state.wages || ''}
                      onChange={(e) => updateState({ wages: Number(e.target.value) || 0 })}
                      className="text-lg"
                    />
                    <p className="text-sm text-muted-foreground">Annual salaries for developers, engineers, designers</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contractors" className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      Contractor & Freelancer Costs
                    </Label>
                    <Input
                      id="contractors"
                      data-testid="contractors-input"
                      type="number"
                      placeholder="0"
                      value={state.contractors || ''}
                      onChange={(e) => updateState({ contractors: Number(e.target.value) || 0 })}
                      className="text-lg"
                    />
                    <p className="text-sm text-muted-foreground">External developers, consultants, agencies</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="supplies" className="flex items-center gap-2">
                      <Calculator className="h-4 w-4" />
                      Software & Tools
                    </Label>
                    <Input
                      id="supplies"
                      data-testid="supplies-input"
                      type="number"
                      placeholder="0"
                      value={state.supplies || ''}
                      onChange={(e) => updateState({ supplies: Number(e.target.value) || 0 })}
                      className="text-lg"
                    />
                    <p className="text-sm text-muted-foreground">Development tools, API costs, testing platforms</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cloud" className="flex items-center gap-2">
                      <Cloud className="h-4 w-4" />
                      Cloud & Infrastructure
                    </Label>
                    <Input
                      id="cloud"
                      data-testid="cloud-input"
                      type="number"
                      placeholder="0"
                      value={state.cloud || ''}
                      onChange={(e) => updateState({ cloud: Number(e.target.value) || 0 })}
                      className="text-lg"
                    />
                    <p className="text-sm text-muted-foreground">AWS, servers, databases, hosting costs</p>
                  </div>
                </div>
              </div>

              <div className="flex justify-between pt-6">
                <Button variant="outline" onClick={() => setStep(1)}>
                  Back
                </Button>
                <Button 
                  data-testid="calculate-button"
                  onClick={handleCalculate}
                  disabled={state.wages + state.contractors + state.supplies + state.cloud === 0}
                  className="flex items-center gap-2"
                >
                  Calculate Credit
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}